import * as crypto from 'crypto';

export class PasswordUtils {
  /**
   * Génère un salt aléatoire pour le hachage
   */
  static generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Hache un mot de passe avec le salt fourni
   */
  static hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  /**
   * Génère un nouveau salt et hache le mot de passe
   */
  static hashNewPassword(password: string): {
    hashedPassword: string;
    salt: string;
  } {
    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(password, salt);
    return { hashedPassword, salt };
  }

  /**
   * Valide un mot de passe par rapport à un hash stocké
   */
  static validatePassword(
    password: string,
    salt: string,
    storedHash: string,
  ): boolean {
    const hash = this.hashPassword(password, salt);
    return hash === storedHash;
  }
}
