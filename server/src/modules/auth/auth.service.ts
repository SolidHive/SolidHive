import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordUtils } from '../../common/utils/password.utils';
import { Response } from 'express';
import { Session } from 'express-session';
import * as crypto from 'crypto';
import { RedisService } from '../../common/redis/redis.service';

// Extension du type Session pour inclure Passport
declare module 'express-session' {
  interface Session {
    passport?: {
      user?: {
        id: string;
        [key: string]: any;
      };
    };
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private redisService: RedisService
  ) {}

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
    // Clé de cache pour le profil utilisateur
    const cacheKey = `user:profile:${userId}`;

    // Vérifier d'abord le cache Redis
    const cachedProfile = await this.redisService.get(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }

    // Si pas en cache, récupérer depuis la base de données
    const user = await this.usersService.findOne(userId);

    // Récupérer les associations de l'utilisateur
    const userAssociations = await this.usersService.getUserAssociations(userId);

    const profile = {
      name: user.name,
      firstname: user.firstname,
      email: user.email,
      phone: user.phone,
      createdAt: user.timestamps.createdAt,
      updatedAt: user.timestamps.updatedAt,
      associations: userAssociations,
      roles: user.roles,
    };

    // Mettre en cache pour 5 minutes (300 secondes)
    await this.redisService.set(cacheKey, profile, 300);

    return profile;
  }

  logout(session: Session | undefined, res: Response): { message: string } {
    // Invalider le cache utilisateur si on a une session
    if (session?.passport?.user?.id) {
      const cacheKey = `user:profile:${session.passport.user.id}`;
      this.redisService.del(cacheKey);
    }

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

  // Méthode pour invalider le cache utilisateur (appelée lors des mises à jour)
  async invalidateUserCache(userId: string) {
    const cacheKey = `user:profile:${userId}`;
    await this.redisService.del(cacheKey);
  }
}
