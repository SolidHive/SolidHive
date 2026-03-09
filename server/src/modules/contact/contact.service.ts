import { Injectable, Logger } from '@nestjs/common';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { EmailService } from '../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

const SUBJECT_LABELS: Record<string, string> = {
  support: 'Support technique',
  association: 'Question association',
  donation: 'Question don / paiement',
  partnership: 'Partenariat',
  other: 'Autre',
};

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private contactTemplate: handlebars.TemplateDelegate;

  constructor(private readonly emailService: EmailService) {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'common',
        'utils',
        'email',
        'templates',
        'contact-message.html'
      );
      const source = fs.readFileSync(templatePath, 'utf8');
      this.contactTemplate = handlebars.compile(source);
    } catch (err) {
      this.logger.error('Erreur chargement template contact', err);
    }
  }

  async send(dto: CreateContactMessageDto): Promise<void> {
    if (!this.contactTemplate) return;

    const html = this.contactTemplate({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      subject: SUBJECT_LABELS[dto.subject] ?? dto.subject,
      message: dto.message,
      year: new Date().getFullYear(),
    });

    await this.emailService
      .sendEmail({
        to: 'support@solidhive.fr',
        subject: `[Contact] ${SUBJECT_LABELS[dto.subject] ?? dto.subject} — ${dto.firstName} ${dto.lastName}`,
        html,
      })
      .catch((err) => this.logger.error("Impossible d'envoyer l'email de contact", err));
  }
}
