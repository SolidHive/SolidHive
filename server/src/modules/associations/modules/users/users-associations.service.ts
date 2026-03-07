import { HttpException, HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from './entities/user-association.entity';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Association } from '../../entities/association.entity';
import { AssociationRole } from '../roles/entities/association-role.entity';
import { CreateUserAssociationDto } from './dto/create-user-association.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateUserAssociationDto } from './dto/update-user-association.dto';
import { Status } from '../../../../common/enums/status';
import { StatusUserAssociationDto } from './dto/status-user-association';
import { EmailService } from '../../../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class UsersAssociationsService {
  private memberInvitationTemplate: Handlebars.TemplateDelegate;
  private newMemberNotificationTemplate: Handlebars.TemplateDelegate;

  constructor(
    @InjectRepository(AssociationRole)
    private associationsRolesRepository: Repository<AssociationRole>,
    @InjectRepository(Association)
    private associationsRepository: Repository<Association>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAssociation)
    private usersAssociationsRepository: Repository<UserAssociation>,
    private readonly emailService: EmailService
  ) {
    // Charger le template d'invitation de membre
    const memberInvitationTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/member-invitation.html'
    );
    try {
      const content = fs.readFileSync(memberInvitationTemplatePath, 'utf8');
      this.memberInvitationTemplate = Handlebars.compile(content);
    } catch (error) {
      console.error('Erreur chargement template invitation membre:', error);
    }

    // Charger le template de notification nouveau membre
    const newMemberNotificationTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/new-member-notification.html'
    );
    try {
      const content = fs.readFileSync(newMemberNotificationTemplatePath, 'utf8');
      this.newMemberNotificationTemplate = Handlebars.compile(content);
    } catch (error) {
      console.error('Erreur chargement template notification nouveau membre:', error);
    }
  }

  async create(
    createUserAssociationDto: CreateUserAssociationDto,
    associationId: string,
    currentUserId?: string
  ) {
    const user = await this.usersRepository.findOne({
      where: { email: createUserAssociationDto.email },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const association = await this.associationsRepository.findOne({
      where: { id: associationId },
    });
    if (!association) {
      throw new HttpException('Association not found', HttpStatus.NOT_FOUND);
    }

    const role = await this.associationsRolesRepository.findOne({
      where: { id: createUserAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    // Si on essaie d'assigner le rôle owner, vérifier que l'utilisateur actuel est owner
    if (role.name === 'owner' && currentUserId) {
      const currentUserAssociation = await this.usersAssociationsRepository.findOne({
        where: { userId: currentUserId, associationId },
        relations: ['role'],
      });
      if (!currentUserAssociation || currentUserAssociation.role.name !== 'owner') {
        throw new HttpException(
          'Seul un propriétaire peut assigner le rôle de propriétaire',
          HttpStatus.FORBIDDEN
        );
      }
    }

    // Vérifier si l'utilisateur est déjà membre de l'association
    const existingUserAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId: user.id, associationId },
    });
    if (existingUserAssociation) {
      throw new HttpException(
        'Cet utilisateur est déjà membre de cette association',
        HttpStatus.CONFLICT
      );
    }

    const userAssociation = this.usersAssociationsRepository.create({
      user,
      association,
      role,
    });

    const savedUserAssociation = await this.usersAssociationsRepository.save(userAssociation);

    // Envoyer un email d'invitation au nouveau membre
    await this.sendInvitationEmail(savedUserAssociation);

    return savedUserAssociation;
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    let whereConditions: FindOptionsWhere<UserAssociation>[] = [{ associationId }];

    if (options?.where !== undefined && typeof options.where === 'string' && options.where !== '') {
      const searchTerm = `%${options.where}%`;
      whereConditions = [
        { associationId, user: { name: ILike(searchTerm) } },
        { associationId, user: { firstname: ILike(searchTerm) } },
        { associationId, user: { email: ILike(searchTerm) } },
        { associationId, user: { phone: ILike(searchTerm) } },
        { associationId, role: { name: ILike(searchTerm) } },
      ];
    }

    const findOptions: any = {
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
        },
        status: true,
      },
      where: whereConditions,
    };

    if (options?.order) {
      findOptions.order = options.order;
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [usersAssociations, total] =
        await this.usersAssociationsRepository.findAndCount(findOptions);
      return {
        data: usersAssociations,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const usersAssociations = await this.usersAssociationsRepository.find(findOptions);
      return usersAssociations;
    }
  }

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.usersAssociationsRepository.findOne({
      ...options,
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
          id: true,
        },
        status: true,
      },
      where: { id, associationId },
    });
  }

  async findAllByStatus(associationId: string, status: string, options?: FindOptionsDto) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    let whereConditions: any = { associationId, status: status as Status };

    if (options?.where !== undefined && typeof options.where === 'string' && options.where !== '') {
      const searchTerm = `%${options.where}%`;
      whereConditions = [
        { associationId, status: status as Status, user: { name: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { firstname: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { email: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { phone: ILike(searchTerm) } },
        { associationId, status: status as Status, role: { name: ILike(searchTerm) } },
      ];
    }

    const findOptions: any = {
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
        },
        status: true,
      },
      where: whereConditions,
    };

    if (options?.order) {
      findOptions.order = options.order;
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [usersAssociations, total] =
        await this.usersAssociationsRepository.findAndCount(findOptions);
      return {
        data: usersAssociations,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const usersAssociations = await this.usersAssociationsRepository.find(findOptions);
      return usersAssociations;
    }
  }

  async findOneByStatus(
    id: string,
    associationId: string,
    status: string,
    options?: FindOptionsDto
  ) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    return this.usersAssociationsRepository.findOne({
      ...options,
      where: { id, associationId, status: status as Status },
    });
  }

  async update(
    id: string,
    associationId: string,
    updateUserAssociationDto: UpdateUserAssociationDto,
    currentUserId?: string
  ) {
    // Récupérer l'association utilisateur à modifier
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id, associationId },
      relations: ['user', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    // Empêcher l'auto-modification
    if (currentUserId && userAssociation.user.id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle');
    }

    const role = await this.associationsRolesRepository.findOne({
      where: { id: updateUserAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    // Si on modifie un owner ou qu'on assigne le rôle owner, vérifier que l'utilisateur actuel est owner
    if ((userAssociation.role.name === 'owner' || role.name === 'owner') && currentUserId) {
      const currentUserAssociation = await this.usersAssociationsRepository.findOne({
        where: { userId: currentUserId, associationId },
        relations: ['role'],
      });
      if (!currentUserAssociation || currentUserAssociation.role.name !== 'owner') {
        throw new ForbiddenException(
          'Seul un propriétaire peut modifier ou assigner le rôle de propriétaire'
        );
      }
    }

    await this.usersAssociationsRepository.update(id, {
      role,
    });
    return this.findOne(id, associationId);
  }

  async updateStatus(
    userId: string,
    associationId: string,
    updateStatusUserAssociationDto: StatusUserAssociationDto
  ) {
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId, associationId },
      relations: ['user', 'association', 'role'],
    });
    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    const validStatuses = [Status.ACCEPTED, Status.REJECTED];

    if (!validStatuses.includes(updateStatusUserAssociationDto.status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    await this.usersAssociationsRepository.update(userId, {
      status: updateStatusUserAssociationDto.status,
    });

    // Si le statut devient ACCEPTED, notifier les propriétaires
    if (updateStatusUserAssociationDto.status === Status.ACCEPTED) {
      await this.notifyOwnersOfNewMember(userAssociation);
    }

    return this.findOne(userId, associationId);
  }

  async remove(id: string, associationId: string, currentUserId?: string) {
    // Récupérer l'association utilisateur à supprimer
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id, associationId },
      relations: ['user', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    // Empêcher l'auto-suppression
    if (currentUserId && userAssociation.user.id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas vous supprimer vous-même');
    }

    // Si on supprime un owner, vérifier que l'utilisateur actuel est owner
    if (userAssociation.role.name === 'owner' && currentUserId) {
      const currentUserAssociation = await this.usersAssociationsRepository.findOne({
        where: { userId: currentUserId, associationId },
        relations: ['role'],
      });
      if (!currentUserAssociation || currentUserAssociation.role.name !== 'owner') {
        throw new ForbiddenException('Seul un propriétaire peut supprimer un autre propriétaire');
      }
    }

    return this.usersAssociationsRepository.delete({ id, associationId });
  }

  private async notifyOwnersOfNewMember(userAssociation: UserAssociation): Promise<void> {
    try {
      // Récupérer tous les propriétaires acceptés de l'association
      const owners = await this.usersAssociationsRepository.find({
        where: {
          associationId: userAssociation.associationId,
          role: { name: 'owner' },
          status: Status.ACCEPTED,
        },
        relations: ['user'],
      });

      if (owners.length === 0) {
        console.warn(
          `Aucun propriétaire trouvé pour l'association ${userAssociation.associationId}`
        );
        return;
      }

      if (!this.newMemberNotificationTemplate) {
        console.error('Template de notification nouveau membre non chargé');
        return;
      }

      // Pour chaque propriétaire, envoyer un email de notification
      for (const owner of owners) {
        const htmlContent = this.newMemberNotificationTemplate({
          ownerFirstname: owner.user.firstname,
          associationName: userAssociation.association.name,
          memberFirstname: userAssociation.user.firstname,
          memberName: userAssociation.user.name,
          memberRole:
            userAssociation.role.name === 'owner' ? 'Propriétaire' : userAssociation.role.name,
          memberEmail: userAssociation.user.email,
          dashboardUrl: `${process.env.FRONTEND_URL}/crm/${userAssociation.associationId}/members`,
        });

        await this.emailService.sendEmail({
          to: owner.user.email,
          subject: `Nouveau membre dans ${userAssociation.association.name}`,
          html: htmlContent,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification aux propriétaires:", error);
      // Ne pas échouer l'opération si l'email échoue
    }
  }

  private async sendInvitationEmail(userAssociation: UserAssociation): Promise<void> {
    try {
      if (!this.memberInvitationTemplate) {
        console.error("Template d'invitation membre non chargé");
        return;
      }

      const invitationLink = `${process.env.FRONTEND_URL}/invitation/${userAssociation.id}`;

      const htmlContent = this.memberInvitationTemplate({
        memberFirstname: userAssociation.user.firstname,
        associationName: userAssociation.association.name,
        memberRole:
          userAssociation.role.name === 'owner' ? 'propriétaire' : userAssociation.role.name,
        invitationLink: invitationLink,
      });

      await this.emailService.sendEmail({
        to: userAssociation.user.email,
        subject: `Invitation à rejoindre ${userAssociation.association.name}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'invitation:", error);
      // Ne pas échouer l'opération si l'email échoue
    }
  }

  async acceptInvitation(invitationId: string): Promise<{ message: string }> {
    // Trouver l'invitation
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id: invitationId },
      relations: ['user', 'association', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('Invitation non trouvée', HttpStatus.NOT_FOUND);
    }

    // Vérifier que l'invitation est en attente
    if (userAssociation.status !== Status.PENDING) {
      throw new HttpException(
        userAssociation.status === Status.ACCEPTED
          ? 'Cette invitation a déjà été acceptée'
          : 'Cette invitation a été rejetée',
        HttpStatus.BAD_REQUEST
      );
    }

    // Accepter l'invitation
    userAssociation.status = Status.ACCEPTED;
    await this.usersAssociationsRepository.save(userAssociation);

    // Notifier les propriétaires
    await this.notifyOwnersOfNewMember(userAssociation);

    return { message: 'Invitation acceptée avec succès' };
  }

  async rejectInvitation(invitationId: string): Promise<{ message: string }> {
    // Trouver l'invitation
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id: invitationId },
      relations: ['user', 'association', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('Invitation non trouvée', HttpStatus.NOT_FOUND);
    }

    // Vérifier que l'invitation est en attente
    if (userAssociation.status !== Status.PENDING) {
      throw new HttpException(
        userAssociation.status === Status.ACCEPTED
          ? 'Cette invitation a déjà été acceptée'
          : 'Cette invitation a déjà été rejetée',
        HttpStatus.BAD_REQUEST
      );
    }

    // Rejeter l'invitation
    userAssociation.status = Status.REJECTED;
    await this.usersAssociationsRepository.save(userAssociation);

    return { message: 'Invitation rejetée avec succès' };
  }
}
