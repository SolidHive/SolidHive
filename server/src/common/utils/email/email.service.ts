import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const transportConfig: SMTPTransport.Options = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_USER.trim() !== '') {
      transportConfig.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  /**
   * Méthode générique pour envoyer un email
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    text?: string;
    attachments?: any[];
  }): Promise<void> {
    const mailOptions = {
      from: options.from || `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Vérifie si le transporteur d'email est correctement configuré
   */
  async verifyConnection(): Promise<boolean> {
    try {
      console.log('🔄 Vérification de la connexion au serveur email...');
      await this.transporter.verify();
      console.log('✅ Connexion au serveur email vérifiée avec succès');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

      console.error('❌ Erreur de connexion au serveur email:', errorMessage);
      return false;
    }
  }
}
