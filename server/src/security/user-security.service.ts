import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { PasswordUtils } from '../utils/password.utils';
import { SecurityActionType } from './enums/security-action-type.enum';
import { SecurityActionRequestDto } from './dto/security-action.dto';
import { SecurityUtils } from './utils/security.utils';

@Injectable()
export class UserSecurityService {
  private templates: Map<SecurityActionType, HandlebarsTemplateDelegate> =
    new Map();
  private readonly JWT_SECRET: string;
  private readonly FRONTEND_URL: string;
  private usedTokens: Set<string> = new Set();

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    // Récupération sécurisée des variables d'environnement
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET') || '';
    this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || '';

    if (!this.JWT_SECRET) {
      console.error(
        "AVERTISSEMENT: JWT_SECRET n'est pas défini dans les variables d'environnement!",
      );
    }

    if (!this.FRONTEND_URL) {
      console.error(
        "AVERTISSEMENT: FRONTEND_URL n'est pas défini dans les variables d'environnement!",
      );
    }

    this.loadTemplates();
  }

  // Point d'entrée principal pour toutes les actions de sécurité
  async processSecurityAction(
    request: SecurityActionRequestDto,
  ): Promise<{ message: string; userId?: string }> {
    // Vérification anticipée de la configuration
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException('Configuration JWT manquante');
    }

    try {
      switch (request.actionType) {
        case SecurityActionType.VERIFY_EMAIL:
          if (!request.token)
            throw new BadRequestException('Token requis pour cette action');
          return this.verifyEmail(request.token);

        case SecurityActionType.RESET_PASSWORD:
          if (request.token && request.newPassword) {
            // Réinitialisation de mot de passe
            return this.resetPassword(request.token, request.newPassword);
          } else if (request.email) {
            // Envoi d'email de réinitialisation
            return this.sendPasswordResetEmail(request.email);
          }
          throw new BadRequestException(
            'Token avec mot de passe ou email requis pour cette action',
          );

        default:
          throw new BadRequestException('Action non supportée');
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Erreur: ${SecurityUtils.getErrorMessage(error)}`,
      );
    }
  }

  // Charge les templates d'emails
  private loadTemplates(): void {
    const templatePaths = {
      [SecurityActionType.VERIFY_EMAIL]:
        'src/utils/email/templates/verification.html',
      [SecurityActionType.RESET_PASSWORD]:
        'src/utils/email/templates/reset-password.html',
    };

    Object.entries(templatePaths).forEach(([type, templatePath]) => {
      try {
        const fullPath = path.join(process.cwd(), templatePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        this.templates.set(
          type as SecurityActionType,
          Handlebars.compile(content),
        );
      } catch (error: unknown) {
        console.error(
          `Erreur lors du chargement du template ${type}: ${SecurityUtils.getErrorMessage(error)}`,
        );
      }
    });
  }

  // Envoie un email de vérification
  async sendVerificationEmail(user: User): Promise<void> {
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException('Configuration JWT manquante');
    }

    const token = SecurityUtils.generateToken(
      user.id,
      SecurityActionType.VERIFY_EMAIL,
      this.JWT_SECRET,
    );

    const template = this.templates.get(SecurityActionType.VERIFY_EMAIL);

    if (!template || !this.FRONTEND_URL) {
      throw new InternalServerErrorException('Configuration email incorrecte');
    }

    const verificationUrl = `${this.FRONTEND_URL}/verify-email?token=${token}`;
    const htmlContent = template({
      name: user.name,
      verificationUrl,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Vérification de votre compte',
      html: htmlContent,
    });
  }

  // Envoie un email de réinitialisation de mot de passe
  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException('Configuration JWT manquante');
    }

    const user = await this.usersRepository.findOne({ where: { email } });
    const message =
      'Si votre email est enregistré, vous recevrez un lien de réinitialisation.';

    if (!user) return { message };

    try {
      const token = SecurityUtils.generateToken(
        user.id,
        SecurityActionType.RESET_PASSWORD,
        this.JWT_SECRET,
      );

      const template = this.templates.get(SecurityActionType.RESET_PASSWORD);

      if (!template || !this.FRONTEND_URL) {
        throw new InternalServerErrorException(
          'Configuration email incorrecte',
        );
      }

      const resetUrl = `${this.FRONTEND_URL}/reset-password?token=${token}`;
      const htmlContent = template({
        name: user.name,
        resetUrl,
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: htmlContent,
      });

      return { message };
    } catch (error: unknown) {
      console.error(
        `Erreur d'envoi d'email à ${email}: ${SecurityUtils.getErrorMessage(error)}`,
      );
      return { message };
    }
  }

  // Vérifie l'email d'un utilisateur
  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException('Configuration JWT manquante');
    }

    try {
      const { userId } = SecurityUtils.verifyToken(
        token,
        SecurityActionType.VERIFY_EMAIL,
        this.JWT_SECRET,
      );

      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) throw new BadRequestException('Utilisateur non trouvé');
      if (user.isVerified) return { message: 'Votre compte est déjà vérifié' };

      user.isVerified = true;
      await this.usersRepository.save(user);

      return {
        message: 'Vérification réussie. Vous pouvez maintenant vous connecter.',
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Lien de vérification invalide');
    }
  }

  // Réinitialise le mot de passe
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException('Configuration JWT manquante');
    }

    try {
      // Vérifier si le token a déjà été utilisé
      if (this.usedTokens.has(token)) {
        throw new BadRequestException(
          'Ce lien de réinitialisation a déjà été utilisé',
        );
      }

      // Valide le token
      const { userId } = SecurityUtils.verifyToken(
        token,
        SecurityActionType.RESET_PASSWORD,
        this.JWT_SECRET,
      );

      await SecurityUtils.validatePassword(newPassword);

      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) throw new BadRequestException('Utilisateur non trouvé');

      // Utilise la classe utilitaire pour générer le hash et le salt
      const { hashedPassword, salt } =
        PasswordUtils.hashNewPassword(newPassword);

      // Met à jour l'utilisateur
      user.password = hashedPassword;
      user.salt = salt;
      await this.usersRepository.save(user);

      // Marque le token comme utilisé
      this.usedTokens.add(token);

      return {
        message:
          'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Erreur lors de la réinitialisation du mot de passe: ' +
          SecurityUtils.getErrorMessage(error),
      );
    }
  }
}
