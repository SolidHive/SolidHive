import { BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SecurityActionType } from '../enums/security-action-type.enum';
import { SecurityTokenPayload } from '../dto/security-action.dto';
import { PasswordValidationDto } from '../dto/password-validation.dto';

export interface ErrorWithMessage {
  message: string;
}

export class SecurityUtils {
  // Gestion des erreurs
  static isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    );
  }

  static getErrorMessage(error: unknown): string {
    if (this.isErrorWithMessage(error)) {
      return error.message;
    }
    return 'Erreur inconnue';
  }

  // Validation de mot de passe
  static async validatePassword(password: string): Promise<void> {
    const validation = plainToClass(PasswordValidationDto, { password });
    const errors = await validate(validation);

    if (errors.length > 0) {
      const constraints = errors[0].constraints;
      const message = constraints
        ? Object.values(constraints)[0]
        : 'Mot de passe invalide';
      throw new BadRequestException(message);
    }
  }

  // Gestion des tokens JWT
  static generateToken(
    userId: string,
    actionType: SecurityActionType,
    jwtSecret: string,
  ): string {
    if (!jwtSecret) {
      throw new BadRequestException('Configuration JWT manquante');
    }

    const expiresIn =
      actionType === SecurityActionType.RESET_PASSWORD ? '1h' : '24h';
    return jwt.sign({ userId, actionType }, jwtSecret, { expiresIn });
  }

  static verifyToken(
    token: string,
    expectedActionType: SecurityActionType,
    jwtSecret: string,
  ): SecurityTokenPayload {
    if (!jwtSecret) {
      throw new BadRequestException('Configuration JWT manquante');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as unknown;

      if (
        !decoded ||
        typeof decoded !== 'object' ||
        !('userId' in decoded) ||
        !('actionType' in decoded)
      ) {
        throw new BadRequestException('Format de token invalide');
      }

      const payload = decoded as SecurityTokenPayload;

      if (payload.actionType !== expectedActionType) {
        throw new BadRequestException(`Token non valide pour cette action`);
      }

      return payload;
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Le token a expiré');
      }
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Token invalide');
    }
  }
}
