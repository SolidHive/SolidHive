import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSecurityService } from '../security/user-security.service';
import { PasswordUtils } from '../utils/password.utils';

@Injectable()
export class UsersService {
  // Liste de domaines d'emails personnels courants à rejeter
  private readonly PERSONAL_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'yahoo.fr',
    'hotmail.com',
    'hotmail.fr',
    'outlook.com',
    'outlook.fr',
    'live.com',
    'live.fr',
    'aol.com',
    'orange.fr',
    'wanadoo.fr',
    'free.fr',
    'sfr.fr',
    'laposte.net',
    'protonmail.com',
    'mail.com',
    'gmx.com',
    'icloud.com',
    'me.com',
  ];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private userSecurityService: UserSecurityService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec l'email ${email}`,
      );
    }

    return user;
  }

  private isBusinessEmail(email: string): boolean {
    const domain = email.split('@')[1].toLowerCase();
    // Si le domaine est dans la liste des domaines personnels, c'est un email personnel
    return !this.PERSONAL_EMAIL_DOMAINS.includes(domain);
  }

  async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
    // Vérifie si l'email est déjà utilisé
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Vérifie que c'est un email d'entreprise
    if (!this.isBusinessEmail(createUserDto.email)) {
      throw new BadRequestException(
        'Veuillez utiliser une adresse email professionnelle',
      );
    }

    const salt = PasswordUtils.generateSalt();
    const hashedPassword = PasswordUtils.hashPassword(
      createUserDto.password,
      salt,
    );

    // Chercher le rôle USER
    let userRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });

    // Si le rôle USER n'existe pas, le créer
    if (!userRole) {
      userRole = this.roleRepository.create({
        name: 'USER',
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
          message:
            'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
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
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de l'inscription",
      );
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }
}
