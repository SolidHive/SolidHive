import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { EmailService } from '../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private subscriptionTemplate: handlebars.TemplateDelegate;
  private announcementTemplate: handlebars.TemplateDelegate;

  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    private readonly emailService: EmailService
  ) {
    // charger les templates HTML (générés à partir des MJML par la pipeline de build)
    try {
      const subPath = path.join(
        process.cwd(),
        'src',
        'common',
        'utils',
        'email',
        'templates',
        'newsletter-subscription-confirmation.html'
      );
      const subSource = fs.readFileSync(subPath, 'utf8');
      this.subscriptionTemplate = handlebars.compile(subSource);
    } catch (err) {
      this.logger.error('Erreur chargement template subscription newsletter', err);
    }

    try {
      const annPath = path.join(
        process.cwd(),
        'src',
        'common',
        'utils',
        'email',
        'templates',
        'newsletter-announcement.html'
      );
      const annSource = fs.readFileSync(annPath, 'utf8');
      this.announcementTemplate = handlebars.compile(annSource);
    } catch (err) {
      this.logger.error('Erreur chargement template annonce newsletter', err);
    }
  }

  async subscribe(email: string): Promise<NewsletterSubscriber> {
    // ne pas dupliquer
    let subscriber = await this.subscriberRepository.findOne({ where: { email } });
    if (!subscriber) {
      subscriber = this.subscriberRepository.create({ email });
      subscriber = await this.subscriberRepository.save(subscriber);
    }

    // envoyer mail de bienvenue si template présent
    if (this.subscriptionTemplate) {
      const html = this.subscriptionTemplate({
        email,
        year: new Date().getFullYear(),
      });
      try {
        await this.emailService.sendEmail({
          to: email,
          subject: 'Confirmation d’inscription à la newsletter SolidHive',
          html,
        });
      } catch (err) {
        this.logger.error(`Impossible d’envoyer mail de confirmation à ${email}`, err);
      }
    }

    return subscriber;
  }

  async unsubscribe(email: string): Promise<void> {
    await this.subscriberRepository.delete({ email });
  }

  async notifyAnnouncement(announcement: {
    id: string;
    title: string;
    content: string;
  }): Promise<void> {
    const subs = await this.subscriberRepository.find();
    if (!subs.length) return;

    const frontendUrl = process.env.FRONTEND_URL || '';
    const link = `${frontendUrl}/blog`;
    const unsubscribeLink = `${frontendUrl}/newsletter`;

    for (const sub of subs) {
      if (this.announcementTemplate) {
        const html = this.announcementTemplate({
          title: announcement.title,
          content: announcement.content,
          link,
          unsubscribeLink,
          year: new Date().getFullYear(),
        });
        try {
          await this.emailService.sendEmail({
            to: sub.email,
            subject: `Nouvelle annonce SolidHive : ${announcement.title}`,
            html,
          });
        } catch (err) {
          this.logger.error(`Échec envoi annonce à ${sub.email}`, err);
        }
      }
    }
  }
}
