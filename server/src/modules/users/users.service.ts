import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSecurityService } from '../security/user-security.service';
import { PasswordUtils } from '../../common/utils/password.utils';
import { UserAssociation } from '../associations/modules/users/entities/user-association.entity';
import { Status } from 'src/common/enums/status';
import { Roles } from '../../common/enums/roles';
import { RedisService } from '../../common/redis/redis.service';
import { DeleteUserDto } from './dto/delete-user.dto';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Association } from '../associations/entities/association.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserAssociation)
    private userAssociationRepository: Repository<UserAssociation>,
    @InjectRepository(EventRegister)
    private eventRegisterRepository: Repository<EventRegister>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    @InjectRepository(Fundraising)
    private fundraisingRepository: Repository<Fundraising>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private userSecurityService: UserSecurityService,
    private redisService: RedisService
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé avec l'email ${email}`);
    }

    return user;
  }

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    // Vérifie si l'email est déjà utilisé
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const salt = PasswordUtils.generateSalt();
    const hashedPassword = PasswordUtils.hashPassword(createUserDto.password, salt);

    // Chercher le rôle USER
    let userRole = await this.roleRepository.findOne({
      where: { name: Roles.USER },
    });

    // Si le rôle USER n'existe pas, le créer
    if (!userRole) {
      userRole = this.roleRepository.create({
        name: Roles.USER,
        description: 'Utilisateur standard',
      });
      await this.roleRepository.save(userRole);
    }

    try {
      // Créer l'utilisateur
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        salt,
        isVerified: false,
        roles: [userRole],
      });

      // Enregistrer l'utilisateur
      const savedUser = await this.usersRepository.save(user);

      // Envoi de l'email de vérification
      try {
        await this.userSecurityService.sendVerificationEmail(savedUser);

        return {
          message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        };
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);

        return {
          message:
            "Inscription réussie, mais nous n'avons pas pu envoyer l'email de vérification. Veuillez contacter le support.",
        };
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw new InternalServerErrorException("Une erreur est survenue lors de l'inscription");
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async getUserAssociations(userId: string) {
    const userAssociations = await this.userAssociationRepository.find({
      where: { userId },
      relations: ['association', 'role'],
    });

    return userAssociations.map((ua) => ({
      id: ua.id,
      association: {
        id: ua.association.id,
        name: ua.association.name,
        description: ua.association.description,
        primaryColor: ua.association.primaryColor,
        status: ua.association.status,
      },
      role: ua.role
        ? {
            id: ua.role.id,
            name: ua.role.name,
            description: ua.role.description,
          }
        : null,
      status: ua.status,
      createdAt: ua.createdAt,
    }));
  }

  async hasAccessToAssociation(
    userId: string,
    associationId: string
  ): Promise<UserAssociation | null> {
    const userAssociation = await this.userAssociationRepository.findOne({
      relations: {
        role: true,
        association: true,
        user: true,
      },
      select: {
        id: true,
        role: {
          id: true,
          name: true,
          description: true,
          permissions: true,
        },
        user: {
          id: true,
          name: true,
          firstname: true,
          email: true,
          phone: true,
        },
        status: true,
        association: {},
      },
      where: {
        userId,
        associationId,
        status: Status.ACCEPTED,
      },
    });

    return userAssociation;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    const updateData: Partial<User> = {};
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.firstname !== undefined) updateData.firstname = updateUserDto.firstname;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;

    Object.assign(user, updateData);

    try {
      const updatedUser = await this.usersRepository.save(user);

      // Invalider le cache Redis pour ce profil utilisateur
      const cacheKey = `user:profile:${userId}`;
      await this.redisService.del(cacheKey);

      return updatedUser;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour du profil'
      );
    }
  }

  async deleteUser(userId: string, deleteUserDto: DeleteUserDto): Promise<{ message: string }> {
    const user = await this.findOne(userId);

    // Vérifier le mot de passe
    const isPasswordValid = PasswordUtils.validatePassword(
      deleteUserDto.password,
      user.salt,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    // Vérifications avant suppression
    await this.validateUserCanBeDeleted(userId);

    // Démarrer une transaction pour assurer l'intégrité des données
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Anonymiser les données personnelles dans les transactions
      await queryRunner.manager.update(
        Transaction,
        { user: { id: userId } },
        {
          user: null, // Dissocier l'utilisateur des transactions pour garder l'historique
        }
      );

      // 2. Supprimer les inscriptions aux événements (mais garder l'historique si nécessaire)
      // Pour les événements passés, on garde les inscriptions anonymisées
      const pastEventRegisters = await queryRunner.manager.find(EventRegister, {
        where: {
          user: { id: userId },
          eventPricing: {
            event: {
              endDate: new Date(), // Événements terminés
            },
          },
        },
        relations: ['eventPricing', 'eventPricing.event'],
      });

      // Anonymiser les inscriptions aux événements passés
      for (const register of pastEventRegisters) {
        await queryRunner.manager.update(
          EventRegister,
          { id: register.id },
          {
            user: null,
            participantLastName: 'Anonyme',
            participantFirstName: 'Utilisateur',
          }
        );
      }

      // Supprimer les inscriptions aux événements futurs
      const futureEventRegisters = await queryRunner.manager.find(EventRegister, {
        where: {
          user: { id: userId },
          eventPricing: {
            event: {
              endDate: MoreThan(new Date()), // Événements futurs
            },
          },
        },
        select: ['id'],
      });

      if (futureEventRegisters.length > 0) {
        const registerIds = futureEventRegisters.map((register) => register.id);
        await queryRunner.manager.delete(EventRegister, registerIds);
      }

      // 3. Supprimer les favoris
      await queryRunner.manager.delete(Favorite, { userId });

      // 4. Supprimer les associations utilisateur (mais pas les associations elles-mêmes)
      await queryRunner.manager.delete(UserAssociation, { userId });

      // 5. Anonymiser l'utilisateur (soft delete avec conservation des données légales)
      const anonymizedData = {
        name: 'Utilisateur',
        firstname: 'Supprimé',
        email: `deleted_${userId}@anonymous.local`,
        phone: '',
        password: '', // Vider le mot de passe
        salt: '',
        isVerified: false,
      };

      await queryRunner.manager.update(User, { id: userId }, anonymizedData);

      // 8. Supprimer le cache Redis
      const cacheKey = `user:profile:${userId}`;
      await this.redisService.del(cacheKey);

      // 9. Logger la suppression pour audit
      console.log(
        `Utilisateur ${userId} supprimé le ${new Date().toISOString()}. Raison: ${deleteUserDto.reason || 'Non spécifiée'}`
      );

      await queryRunner.commitTransaction();

      return {
        message:
          'Votre compte a été supprimé avec succès. Toutes vos données personnelles ont été anonymisées conformément à la réglementation.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erreur lors de la suppression du compte:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la suppression du compte'
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async validateUserCanBeDeleted(userId: string): Promise<void> {
    // Vérifier si l'utilisateur est propriétaire d'associations
    const ownedAssociations = await this.associationRepository.count({
      where: { createdBy: { id: userId } },
    });

    if (ownedAssociations > 0) {
      throw new BadRequestException(
        "Vous ne pouvez pas supprimer votre compte car vous êtes propriétaire d'une ou plusieurs associations. " +
          'Veuillez transférer la propriété de vos associations à un autre administrateur avant de supprimer votre compte.'
      );
    }

    // Vérifier les inscriptions aux événements futurs
    const futureEventRegisters = await this.eventRegisterRepository
      .createQueryBuilder('register')
      .leftJoinAndSelect('register.eventPricing', 'pricing')
      .leftJoinAndSelect('pricing.event', 'event')
      .where('register.userId = :userId', { userId })
      .andWhere('event.endDate > :now', { now: new Date() })
      .getCount();

    if (futureEventRegisters > 0) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre compte car vous êtes inscrit à un ou plusieurs événements futurs. ' +
          'Veuillez vous désinscrire de tous les événements avant de supprimer votre compte.'
      );
    }

    // Vérifier les transactions récentes (conserver pour raisons légales)
    const recentTransactions = await this.transactionRepository.count({
      where: {
        user: { id: userId },
        timestamps: {
          createdAt: MoreThan(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)), // 90 jours
        },
      },
    });

    if (recentTransactions > 0) {
      // Les transactions récentes sont conservées pour raisons légales/fiscales
      // mais cela n'empêche pas la suppression du compte
    }
  }
}
