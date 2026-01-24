import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSecurityService } from '../security/user-security.service';
import { PasswordUtils } from '../../common/utils/password.utils';
import { UserAssociation } from '../associations/modules/users/entities/user-association.entity';
import { Status } from 'src/common/enums/status';
import { Roles } from '../../common/enums/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserAssociation)
    private userAssociationRepository: Repository<UserAssociation>,
    private userSecurityService: UserSecurityService
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
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour du profil'
      );
    }
  }
}
