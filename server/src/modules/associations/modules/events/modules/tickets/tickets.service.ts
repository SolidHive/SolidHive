import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventRegister } from '../registers/entities/event-register.entity';
import { Event } from '../../entities/event.entity';
import { EventPricing } from '../pricings/entities/event-pricing.entity';
import { FilesService } from '../../../../../files/files.service';
import { File } from '../../../../../files/entities/file.entity';
import { EmailService } from '../../../../../../common/utils/email/email.service';
import { Transaction } from '../../../../../transactions/entities/transaction.entity';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketsService {
  private emailTemplate: HandlebarsTemplateDelegate;

  constructor(
    @InjectRepository(EventRegister)
    private eventRegisterRepository: Repository<EventRegister>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventPricing)
    private eventPricingRepository: Repository<EventPricing>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private filesService: FilesService,
    private emailService: EmailService
  ) {
    this.loadEmailTemplate();
  }

  /**
   * Charge le template d'email pour l'envoi des billets
   */
  private loadEmailTemplate(): void {
    try {
      const templatePath = join(
        process.cwd(),
        'src',
        'common',
        'utils',
        'email',
        'templates',
        'event-ticket.html'
      );
      const content = readFileSync(templatePath, 'utf8');
      this.emailTemplate = Handlebars.compile(content);
    } catch (error) {
      console.error('Erreur lors du chargement du template email:', error);
    }
  }

  /**
   * Génère et envoie le billet par email après un paiement réussi
   */
  async generateAndSendTicket(registrationId: string): Promise<void> {
    // Récupérer l'inscription avec toutes les relations nécessaires
    const registration = await this.eventRegisterRepository.findOne({
      where: { id: registrationId },
      relations: ['user', 'eventPricing', 'eventPricing.event', 'eventPricing.event.association'],
    });

    if (!registration) {
      throw new NotFoundException('Inscription non trouvée');
    }

    if (!registration.user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si le billet existe déjà
    const existingTicket = await this.filesService.findOne(
      'EventRegister',
      registrationId,
      0,
      registration.user.id,
      'ticket'
    );

    let ticketPath: string;

    if (existingTicket) {
      // Utiliser le billet existant
      ticketPath = join(process.cwd(), 'uploads', registration.user.id, existingTicket.filename);
    } else {
      // Générer un nouveau billet
      ticketPath = await this.generateTicketPDF(registration);
    }

    // Récupérer la facture associée à l'événement (chercher par userId et eventId)
    const event = registration.eventPricing.event;

    // Trouver la transaction liée à cet événement pour récupérer la facture
    const invoiceFiles = await this.fileRepository.find({
      where: {
        userId: registration.user.id,
        purpose: 'invoice',
        relatedTo: 'Transaction',
      },
    });

    // Chercher la facture correspondant à l'événement via les transactions
    let invoicePath: string | null = null;
    for (const file of invoiceFiles) {
      const transaction = await this.transactionRepository.findOne({
        where: { id: file.relatedBy },
      });

      if (transaction && transaction.relatedBy === event.id) {
        invoicePath = join(process.cwd(), 'uploads', registration.user.id, file.filename);
        break;
      }
    }

    // Envoyer l'email avec les pièces jointes
    await this.sendTicketEmail(registration, ticketPath, invoicePath);
  }

  /**
   * Génère le PDF du billet
   */
  private async generateTicketPDF(registration: EventRegister): Promise<string> {
    const event = registration.eventPricing.event;
    const pricing = registration.eventPricing;

    // Générer le HTML du billet avec QR code
    const html = await this.generateTicketHTML(registration, event, pricing);

    // Convertir en PDF
    const pdfBuffer = await this.generatePDF(html);

    // Sauvegarder le fichier
    const uploadsDir = join(process.cwd(), 'uploads', registration.user!.id);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const { v4: uuidv4 } = await import('uuid');
    const filename = uuidv4();
    const filePath = join(uploadsDir, filename);
    writeFileSync(filePath, pdfBuffer);

    // Créer l'entrée de fichier en base de données
    const fileEntity = this.fileRepository.create({
      filename: filename,
      relatedTo: 'EventRegister',
      relatedBy: registration.id,
      purpose: 'ticket',
      index: 0,
      userId: registration.user!.id,
      oldFilename: `billet-${event.title.replace(/\s+/g, '-')}.pdf`,
      mimetype: 'application/pdf',
      extension: 'pdf',
      size: pdfBuffer.length,
      allowedSystemRoles: [],
      allowedAssociationRoles: [],
    });

    await this.fileRepository.save(fileEntity);

    return filePath;
  }

  /**
   * Génère le HTML du billet
   */
  private async generateTicketHTML(
    registration: EventRegister,
    event: Event,
    pricing: EventPricing
  ): Promise<string> {
    const templatePath = join(
      process.cwd(),
      'src',
      'common',
      'utils',
      'ticket-template',
      'ticket.template.html'
    );
    const html = readFileSync(templatePath, 'utf-8');

    const eventDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(event.startDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const eventLocation = event.address
      ? `${event.address.street || ''}, ${event.address.postcode || ''} ${event.address.city || ''}`.trim()
      : 'À définir';

    const ticketCode = registration.id.slice(-8).toUpperCase();
    const participantEmail = registration.participantEmail || registration.user?.email || 'N/A';
    const participantName =
      registration.participantFirstName && registration.participantLastName
        ? `${registration.participantFirstName} ${registration.participantLastName}`
        : registration.user
          ? `${registration.user.firstname} ${registration.user.name}`
          : 'N/A';

    const qrCodeData = JSON.stringify({
      ticketId: registration.id,
      ticketCode: ticketCode,
      eventId: event.id,
      participantEmail: participantEmail,
    });

    const qrCodeBase64 = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: { dark: '#510d6d', light: '#ffffff' },
    });

    return html
      .replace(/{{eventTitle}}/g, event.title)
      .replace(/{{eventDate}}/g, eventDate)
      .replace(/{{eventTime}}/g, eventTime)
      .replace(/{{eventLocation}}/g, eventLocation)
      .replace(/{{participantName}}/g, participantName)
      .replace(/{{participantEmail}}/g, participantEmail)
      .replace(/{{pricingName}}/g, pricing.title)
      .replace(/{{ticketId}}/g, registration.id)
      .replace(/{{ticketCode}}/g, ticketCode)
      .replace(/{{qrCodeBase64}}/g, qrCodeBase64)
      .replace(/{{associationName}}/g, event.association?.name || 'Association');
  }

  /**
   * Convertit le HTML en PDF avec Puppeteer
   */
  private async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  /**
   * Envoie l'email avec le billet et la facture
   */
  private async sendTicketEmail(
    registration: EventRegister,
    ticketPath: string,
    invoicePath: string | null
  ): Promise<void> {
    const event = registration.eventPricing.event;
    const user = registration.user;

    if (!this.emailTemplate) {
      throw new Error('Template email non chargé');
    }

    // Préparer les données pour le template
    const eventDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(event.startDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construire l'adresse de l'événement
    const eventLocation = event.address
      ? `${event.address.street || ''}, ${event.address.postcode || ''} ${event.address.city || ''}`.trim()
      : 'À définir';

    const htmlContent = this.emailTemplate({
      userName: user!.name,
      eventTitle: event.title,
      eventDate,
      eventTime,
      eventLocation,
      ticketCode: registration.id.slice(-8).toUpperCase(),
    });

    // Préparer les pièces jointes
    const attachments: any[] = [
      {
        filename: `billet-${event.title.replace(/\s+/g, '-')}.pdf`,
        path: ticketPath,
      },
    ];

    if (invoicePath) {
      attachments.push({
        filename: `facture-${registration.id.slice(-8)}.pdf`,
        path: invoicePath,
      });
    }

    // Envoyer l'email
    await this.emailService.sendEmail({
      to: user!.email,
      subject: `Votre billet pour ${event.title}`,
      html: htmlContent,
      attachments,
    });
  }

  /**
   * Génère et envoie tous les billets d'une commande en un seul email
   */
  async generateAndSendAllTickets(registrationIds: string[], transactionId: string): Promise<void> {
    if (registrationIds.length === 0) return;

    const registrations = await this.eventRegisterRepository.find({
      where: { id: In(registrationIds) },
      relations: [
        'user',
        'eventPricing',
        'eventPricing.event',
        'eventPricing.event.association',
        'eventPricing.event.address',
      ],
    });

    if (registrations.length === 0) throw new Error('Aucune inscription trouvée');

    const event = registrations[0].eventPricing.event;
    const user = registrations[0].user;
    const ticketPaths: string[] = [];

    for (const registration of registrations) {
      const ticketPath = await this.generateTicketPDF(registration);
      ticketPaths.push(ticketPath);
    }

    const attachments = ticketPaths.map((path, index) => ({
      filename: `billet-${index + 1}.pdf`,
      path,
    }));

    if (transactionId) {
      const invoiceFile = await this.fileRepository.findOne({
        where: { relatedTo: 'Transaction', relatedBy: transactionId },
      });

      if (invoiceFile) {
        const invoicePath = join(process.cwd(), 'uploads', user!.id, invoiceFile.filename);
        if (existsSync(invoicePath)) {
          attachments.push({
            filename: invoiceFile.oldFilename || 'facture.pdf',
            path: invoicePath,
          });
        }
      }
    }

    const eventDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(event.startDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const eventLocation = event.address
      ? `${event.address.street || ''}, ${event.address.postcode || ''} ${event.address.city || ''}`.trim()
      : 'À définir';

    const htmlContent = this.emailTemplate({
      userName: user!.name,
      eventTitle: event.title,
      eventDate,
      eventTime,
      eventLocation,
      ticketCode: registrations[0].id.slice(-8).toUpperCase(),
    });

    await this.emailService.sendEmail({
      to: user!.email,
      subject: `Vos ${registrations.length} billet${registrations.length > 1 ? 's' : ''} pour ${event.title}`,
      html: htmlContent,
      attachments,
    });
  }

  /**
   * Récupère le stream d'un billet pour téléchargement
   */
  async getTicketStream(registrationId: string, _userId: string): Promise<any> {
    return await this.filesService.getFileStream('EventRegister', registrationId, 0, 'ticket');
  }
}
