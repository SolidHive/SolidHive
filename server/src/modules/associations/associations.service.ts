import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { Repository, Like } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAssociationDto } from './dto/create-association.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { StatusAssociationDto } from './dto/status-association.dto';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto';
import { Permissions } from '../../common/enums/permissions';
import { AssociationRole } from './modules/roles/entities/association-role.entity';
import { UserAssociation } from './modules/users/entities/user-association.entity';
import { Status } from '../../common/enums/status';
import { File } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { EmailService } from '../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class AssociationsService {
  private contactTemplate: HandlebarsTemplateDelegate;
  private newAssociationTemplate: HandlebarsTemplateDelegate;

  constructor(
    @InjectRepository(Association)
    private readonly associationsRepository: Repository<Association>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(File)
    private readonly filesService: FilesService,
    private readonly emailService: EmailService
  ) {
    const contactTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/association-contact.html'
    );
    try {
      const content = fs.readFileSync(contactTemplatePath, 'utf8');
      this.contactTemplate = Handlebars.compile(content);
    } catch (error) {
      console.error('Erreur chargement template contact association:', error);
    }

    const newAssociationTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/new-association-notification.html'
    );
    try {
      const content = fs.readFileSync(newAssociationTemplatePath, 'utf8');
      this.newAssociationTemplate = Handlebars.compile(content);
    } catch (error) {
      console.error('Erreur chargement template nouvelle association:', error);
    }
  }

  async create(createAssociationDto: CreateAssociationDto, userId: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    try {
      const savedAssociation: Association = await this.associationsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const addAssociation = transactionalEntityManager.create(Association, {
            ...createAssociationDto,
            createdBy: user,
          });
          const association = await transactionalEntityManager.save(Association, addAssociation);

          const addDefaultRole = transactionalEntityManager.create(AssociationRole, {
            name: 'owner',
            association: association,
            description: "Rôle propriétaire de l'association",
            createdBy: null,
            permissions: [Permissions.ALL],
          });
          const savedRole = await transactionalEntityManager.save(AssociationRole, addDefaultRole);

          const addUserAssociation = transactionalEntityManager.create(UserAssociation, {
            user,
            association: association,
            role: savedRole,
            status: Status.ACCEPTED,
          });
          await transactionalEntityManager.save(UserAssociation, addUserAssociation);

          return association;
        }
      );

      // Envoi d'email de notification à l'équipe SolidHive
      try {
        if (this.newAssociationTemplate) {
          const htmlContent = this.newAssociationTemplate({
            associationName: savedAssociation.name,
            siret: savedAssociation.siret,
            email: savedAssociation.contact || 'Non fourni',
            creatorName: `${user.firstname} ${user.name}`,
            creatorEmail: user.email,
            adminUrl: `${process.env.FRONTEND_URL}/admin/dashboard/association/${savedAssociation.id}`,
          });

          await this.emailService.sendEmail({
            to: process.env.EMAIL_SUPPORT || 'support@solidhive.fr',
            subject: `Nouvelle association créée - ${savedAssociation.name}`,
            html: htmlContent,
          });
        }
      } catch (emailError) {
        console.error('Erreur envoi email notification nouvelle association:', emailError);
        // Ne pas échouer la création si l'email échoue
      }

      return savedAssociation;
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'UQ_ceee675aefe0bb8f10f54db1696') {
        throw new HttpException(
          'Ce numéro SIRET est déjà utilisé par une autre association',
          HttpStatus.CONFLICT
        );
      }
      throw error;
    }
  }

  findAll(
    options?: FindOptionsDto & {
      name?: string;
      orderBy?: 'ASC' | 'DESC';
      includeAllStatuses?: boolean;
    }
  ) {
    const where: any = {};

    if (!options?.includeAllStatuses) {
      where.status = Status.ACCEPTED;
    }

    if (options?.name) {
      where.name = Like(`%${options.name}%`);
    }

    let order: any = options?.order;
    if (options?.orderBy) {
      order = { name: options.orderBy };
    }

    if (options?.take) {
      return this.associationsRepository
        .findAndCount({
          where,
          order,
          skip: options.skip,
          take: options.take,
        })
        .then(([data, total]) => ({
          data,
          meta: {
            total,
            page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
            limit: options.take || 10,
            totalPages: Math.ceil(total / (options.take || 10)),
          },
        }));
    }
    return this.associationsRepository.find({
      where,
      order,
    });
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.associationsRepository.findOne({
      ...options,
      where: { id },
    });
  }

  findAllByStatus(status: string, options?: FindOptionsDto & { name?: string }) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    const where: any = { status: status as Status };
    if (options?.name) {
      where.name = Like(`%${options.name}%`);
    }

    if (options?.take) {
      return this.associationsRepository
        .findAndCount({
          where,
          order: options?.order,
          skip: options.skip,
          take: options.take,
        })
        .then(([data, total]) => ({
          data,
          meta: {
            total,
            page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
            limit: options.take || 10,
            totalPages: Math.ceil(total / (options.take || 10)),
          },
        }));
    }

    return this.associationsRepository.find({
      ...options,
      where,
    });
  }

  findOneByStatus(id: string, status: string, options?: FindOptionsDto) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    return this.associationsRepository.findOne({
      ...options,
      where: { id, status: status as Status },
    });
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    await this.associationsRepository.update(id, updateAssociationDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, statusAssociationDto: StatusAssociationDto) {
    await this.associationsRepository.update(id, statusAssociationDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    try {
      await this.filesService.remove('Association', id, 0, 'image');
    } catch (error) {
      console.error(`Erreur suppression image association ${id}`, error);
    }

    return this.associationsRepository.delete(id);
  }

  async updateStripeAccount(id: string, updateStripeAccountDto: UpdateStripeAccountDto) {
    await this.associationsRepository.update(id, updateStripeAccountDto);
    return this.findOne(id);
  }

  async sendContactEmail(
    associationId: string,
    name: string,
    firstname: string,
    email: string,
    message: string,
    phone?: string
  ): Promise<void> {
    const association = await this.associationsRepository.findOne({ where: { id: associationId } });
    if (!association || !association.contact) {
      throw new HttpException('Association ou contact introuvable', HttpStatus.NOT_FOUND);
    }
    if (!this.contactTemplate) {
      throw new HttpException('Template email non disponible', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const htmlContent = this.contactTemplate({ name, firstname, email, phone, message });
    await this.emailService.sendEmail({
      to: association.contact,
      subject: `Nouveau message de contact pour l'association ${association.name}`,
      html: htmlContent,
    });
  }
}
