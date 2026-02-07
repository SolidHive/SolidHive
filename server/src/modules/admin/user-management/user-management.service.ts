import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/update-user.dto';
import { RolesList } from '../../../common/enums/roles';
import { FindOptionsDto } from '../../../common/dto/find-all-query.dto';
import { EmailService } from '../../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class UserManagementService {
  private banUserTemplate: HandlebarsTemplateDelegate;
  private unbanUserTemplate: HandlebarsTemplateDelegate;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly emailService: EmailService
  ) {
    this.initializeRoles();
    this.loadEmailTemplates();
  }

  private async initializeRoles() {
    for (const roleData of RolesList) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      }
    }
  }

  private loadEmailTemplates() {
    // Template de bannissement
    const banUserTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/user-ban-notification.html'
    );
    try {
      const banContent = fs.readFileSync(banUserTemplatePath, 'utf8');
      this.banUserTemplate = Handlebars.compile(banContent);
    } catch (error) {
      console.error('Erreur chargement template bannissement utilisateur:', error);
    }

    // Template de débannissement
    const unbanUserTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/user-unban-notification.html'
    );
    try {
      const unbanContent = fs.readFileSync(unbanUserTemplatePath, 'utf8');
      this.unbanUserTemplate = Handlebars.compile(unbanContent);
    } catch (error) {
      console.error('Erreur chargement template débannissement utilisateur:', error);
    }
  }

  async findAll(options?: FindOptionsDto) {
    // Construction de la requête de recherche
    let whereConditions = {};
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur email, firstname, name
      const searchTerm = options.where;
      whereConditions = [
        { email: Like(`%${searchTerm}%`) },
        { firstname: Like(`%${searchTerm}%`) },
        { name: Like(`%${searchTerm}%`) },
      ];
    } else if (options?.where) {
      whereConditions = options.where;
    }

    const findOptions: any = {
      where: whereConditions,
      relations: ['roles'],
    };

    if (options?.order) {
      findOptions.order = options.order;
    } else {
      findOptions.order = {
        timestamps: {
          createdAt: 'DESC',
        },
      };
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [users, total] = await this.userRepository.findAndCount(findOptions);
      return {
        data: users,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const users = await this.userRepository.find(findOptions);
      return users;
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const wasVerified = user.isVerified;

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Envoyer un email si le statut de vérification a changé
    if (updateUserDto.isVerified !== undefined && updateUserDto.isVerified !== wasVerified) {
      try {
        if (updateUserDto.isVerified === false && this.banUserTemplate) {
          // Bannissement
          const htmlContent = this.banUserTemplate({
            userName: `${user.firstname} ${user.name}`,
            userEmail: user.email,
          });

          await this.emailService.sendEmail({
            to: user.email,
            subject: 'Votre compte SolidHive a été suspendu',
            html: htmlContent,
          });
        } else if (updateUserDto.isVerified === true && this.unbanUserTemplate) {
          // Débannissement
          const htmlContent = this.unbanUserTemplate({
            userName: `${user.firstname} ${user.name}`,
            userEmail: user.email,
            loginUrl: `${process.env.FRONTEND_URL || 'https://solidhive.fr'}/login`,
          });

          await this.emailService.sendEmail({
            to: user.email,
            subject: 'Votre compte SolidHive a été réactivé',
            html: htmlContent,
          });
        }
      } catch (emailError) {
        console.error(
          'Erreur envoi email lors de la mise à jour du statut utilisateur:',
          emailError
        );
        // Ne pas échouer l'opération si l'email échoue
      }
    }

    return updatedUser;
  }

  async updateRoles(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.name IN (:...names)', { names: updateUserRoleDto.roles })
      .getMany();

    if (roles.length !== updateUserRoleDto.roles.length) {
      throw new NotFoundException('Un ou plusieurs rôles spécifiés sont invalides');
    }

    user.roles = roles;
    return await this.userRepository.save(user);
  }

  async banUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Bannir l'utilisateur en mettant isVerified à false
    await this.userRepository.update(id, { isVerified: false });

    // Envoyer un email de notification
    try {
      if (this.banUserTemplate) {
        const htmlContent = this.banUserTemplate({
          userName: `${user.firstname} ${user.name}`,
          userEmail: user.email,
        });

        await this.emailService.sendEmail({
          to: user.email,
          subject: 'Votre compte SolidHive a été suspendu',
          html: htmlContent,
        });
      }
    } catch (emailError) {
      console.error('Erreur envoi email bannissement utilisateur:', emailError);
      // Ne pas échouer l'opération si l'email échoue
    }

    return { message: 'Utilisateur banni avec succès' };
  }

  async getAllRoles() {
    return await this.roleRepository.find();
  }
}
