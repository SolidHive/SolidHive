import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordUtils } from '../../common/utils/password.utils';
import { Response } from 'express';
import { Session } from 'express-session';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      const isPasswordValid = PasswordUtils.validatePassword(password, user.salt, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      if (!user.isVerified) {
        throw new UnauthorizedException(
          "Votre compte n'est pas vérifié. Veuillez vérifier votre email avant de vous connecter."
        );
      }

      return {
        id: user.id,
        roles: user.roles,
        isVerified: user.isVerified,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Identifiants invalides');
    }
  }

  login(): { message: string } {
    return { message: 'Connexion réussie' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);

    return {
      name: user.name,
      firstname: user.firstname,
      email: user.email,
      phone: user.phone,
      siret: user.siret,
      createdAt: user.timestamps.createdAt,
      updatedAt: user.timestamps.updatedAt,
    };
  }

  logout(session: Session | undefined, res: Response): { message: string } {
    // Destruction de la session
    if (session) {
      session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    // Suppression du cookie
    const cookieName = `ca_sid_${crypto
      .createHash('sha256')
      .update('solidhive-salt')
      .digest('hex')
      .substring(0, 8)}`;

    res.clearCookie(cookieName);

    return { message: 'Déconnexion réussie' };
  }
}
