import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Association } from '../associations/entities/association.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { EventPricing } from '../associations/modules/events/modules/pricings/entities/event-pricing.entity';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { FilesService } from '../files/files.service';
import { File } from '../files/entities/file.entity';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

interface InvoiceContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  postcode?: string;
  city?: string;
}

interface InvoiceParticipant {
  firstName: string;
  lastName: string;
  email: string;
  pricingId: string;
}

interface InvoiceLineItem {
  description: string;
  amount: number;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Fundraising)
    private fundraisingRepository: Repository<Fundraising>,
    @InjectRepository(EventPricing)
    private eventPricingRepository: Repository<EventPricing>,
    @InjectRepository(EventRegister)
    private eventRegisterRepository: Repository<EventRegister>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private filesService: FilesService
  ) {}

  /**
   * Récupérer le stream de la facture (existante ou générée)
   */
  async getInvoiceStream(
    transactionId: string,
    userId: string,
    contactInfo?: InvoiceContactInfo,
    participants?: InvoiceParticipant[]
  ): Promise<any> {
    // Vérifier si la facture existe déjà
    const existingInvoice = await this.filesService.findOne(
      'Transaction',
      transactionId,
      0,
      userId,
      'invoice'
    );

    // Si la facture existe, la retourner
    if (existingInvoice) {
      return await this.filesService.getFileStream('Transaction', transactionId, 0, 'invoice');
    }

    // Sinon, générer et sauvegarder la facture
    await this.generateAndSaveInvoice(transactionId, userId, contactInfo, participants);

    // Retourner le stream de la facture nouvellement créée
    return await this.filesService.getFileStream('Transaction', transactionId, 0, 'invoice');
  }

  /**
   * Générer et sauvegarder une facture
   */
  private async generateAndSaveInvoice(
    transactionId: string,
    userId: string,
    contactInfo?: InvoiceContactInfo,
    participants?: InvoiceParticipant[]
  ): Promise<string> {
    // Récupérer la transaction
    const transaction = await this.getAndValidateTransaction(transactionId, userId);

    // Récupérer les données de l'entité liée
    const entityData = await this.fetchEntityData(transaction);

    // Générer le HTML de la facture
    const html = await this.generateInvoiceHTML(transaction, entityData, contactInfo, participants);

    // Convertir en PDF et sauvegarder
    const pdfBuffer = await this.generatePDF(html);
    const invoiceFilename = await this.saveInvoiceFile(pdfBuffer, transactionId, userId);

    return invoiceFilename;
  }

  /**
   * Récupérer et valider la transaction
   */
  private async getAndValidateTransaction(
    transactionId: string,
    userId: string
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      this.logger.error(`Transaction not found: ${transactionId}`);
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.user || transaction.user.id !== userId) {
      this.logger.error(`Unauthorized access to transaction ${transactionId} by user ${userId}`);
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Récupérer les données de l'entité liée à la transaction
   */
  private async fetchEntityData(transaction: Transaction): Promise<any> {
    const { relatedTo, relatedBy } = transaction;

    switch (relatedTo) {
      case 'Association':
        return {
          type: 'Association',
          name:
            (await this.associationRepository.findOne({ where: { id: relatedBy } }))?.name ||
            'Association inconnue',
          description: "Don à l'association",
        };

      case 'Event': {
        const event = await this.eventRepository.findOne({
          where: { id: relatedBy },
          relations: ['association'],
        });
        return {
          type: 'Event',
          name: event?.title || 'Événement inconnu',
          description: "Inscription à l'événement",
        };
      }

      case 'Fundraising': {
        const fundraising = await this.fundraisingRepository.findOne({
          where: { id: relatedBy },
          relations: ['association'],
        });
        return {
          type: 'Fundraising',
          name: fundraising?.title || 'Cagnotte inconnue',
          description: 'Contribution à la cagnotte',
        };
      }

      default:
        throw new Error(`Unknown transaction type: ${relatedTo}`);
    }
  }

  /**
   * Récupérer les informations de contact (avec fallback)
   */
  private getContactInfo(
    contactInfo: InvoiceContactInfo | undefined,
    transactionUser: any
  ): InvoiceContactInfo {
    return {
      firstName: contactInfo?.firstName || transactionUser?.firstname || 'Anonyme',
      lastName: contactInfo?.lastName || transactionUser?.name || 'Utilisateur',
      email: contactInfo?.email || transactionUser?.email || 'N/A',
      phone: contactInfo?.phone || '',
      address: contactInfo?.address || '',
      postcode: contactInfo?.postcode || '',
      city: contactInfo?.city || '',
    };
  }

  /**
   * Générer les lignes de facture pour un événement
   */
  private async generateEventInvoiceLines(
    participants: InvoiceParticipant[]
  ): Promise<InvoiceLineItem[]> {
    if (!participants || participants.length === 0) {
      return [];
    }

    // Récupérer les IDs uniques des pricings
    const pricingIds = [...new Set(participants.map((p) => p.pricingId))];

    // Charger les pricings avec l'ORM
    const pricings = await this.eventPricingRepository.find({
      where: { id: In(pricingIds) },
    });

    const pricingMap = new Map(pricings.map((p) => [p.id, p]));

    // Générer les lignes
    return participants.map((participant) => {
      const pricing = pricingMap.get(participant.pricingId);
      const amount = pricing?.amount ? Number(pricing.amount) : 0;

      return {
        description: `${participant.firstName} ${participant.lastName} - ${
          pricing?.title || 'Tarif'
        }`,
        amount,
      };
    });
  }

  /**
   * Générer les lignes de facture par fallback (depuis la BD)
   */
  private async generateEventInvoiceLinesFromDatabase(
    transaction: Transaction
  ): Promise<InvoiceLineItem[]> {
    if (!transaction.user) {
      throw new Error('Transaction sans utilisateur');
    }

    const eventId = transaction.relatedBy;
    const userId = transaction.user.id;
    const isRefund = Number(transaction.amount) < 0;

    // Pour un remboursement, filtrer par inscriptions annulées autour de la date de transaction
    // Pour un paiement normal, filtrer par inscriptions actives (sans cancelledAt)
    let eventRegisters: EventRegister[] = [];

    if (isRefund) {
      // Pour un remboursement : récupérer les inscriptions annulées
      // Fenêtre de 10 minutes autour de la création de la transaction
      const transactionDate = new Date(transaction.timestamps.createdAt);
      const startWindow = new Date(transactionDate.getTime() - 10 * 60 * 1000);
      const endWindow = new Date(transactionDate.getTime() + 10 * 60 * 1000);

      const allCancelledRegisters = await this.eventRegisterRepository
        .createQueryBuilder('register')
        .leftJoinAndSelect('register.eventPricing', 'pricing')
        .leftJoinAndSelect('pricing.event', 'event')
        .leftJoinAndSelect('register.user', 'user')
        .where('event.id = :eventId', { eventId })
        .andWhere('user.id = :userId', { userId })
        .andWhere('register.cancelledAt IS NOT NULL')
        .andWhere('register.cancelledAt BETWEEN :start AND :end', {
          start: startWindow,
          end: endWindow,
        })
        .getMany();

      eventRegisters = allCancelledRegisters;
    } else {
      // Pour un paiement normal : récupérer toutes les inscriptions de l'utilisateur pour cet événement
      // (anciennes inscriptions sans cancelledAt)
      eventRegisters = await this.eventRegisterRepository.find({
        where: {
          user: { id: userId },
          eventPricing: { event: { id: eventId } },
        },
        relations: ['eventPricing', 'user'],
      });
    }

    if (!eventRegisters || eventRegisters.length === 0) {
      return [];
    }

    return eventRegisters.map((register) => ({
      description: `${register.participantFirstName} ${register.participantLastName} - ${
        register.eventPricing?.title || 'Tarif'
      }`,
      amount: register.eventPricing?.amount ? Number(register.eventPricing.amount) : 0,
    }));
  }

  /**
   * Générer le HTML de la facture
   */
  private async generateInvoiceHTML(
    transaction: Transaction,
    entityData: any,
    contactInfo: InvoiceContactInfo | undefined,
    participants?: InvoiceParticipant[]
  ): Promise<string> {
    // Lire le template
    const template = await this.loadInvoiceTemplate();

    // Préparer les données
    const contact = this.getContactInfo(contactInfo, transaction.user);
    const formattedDate = this.formatTransactionDate(transaction);
    const amounts = this.calculateInvoiceAmounts(transaction);

    // Générer les lignes de facture selon le type de transaction
    let invoiceLines: InvoiceLineItem[] = [];
    if (entityData.type === 'Event') {
      if (participants && participants.length > 0) {
        invoiceLines = await this.generateEventInvoiceLines(participants);
      } else {
        invoiceLines = await this.generateEventInvoiceLinesFromDatabase(transaction);
      }
    } else {
      // Pour les dons (Association, Fundraising) : une ligne unique avec le montant net
      invoiceLines = [
        {
          description: `${entityData.description}: ${entityData.name}`,
          amount: Number(amounts.net),
        },
      ];
    }

    // Si c'est un remboursement, inverser le signe des montants dans les lignes
    const isRefund = Number(transaction.amount) < 0;
    if (isRefund) {
      invoiceLines = invoiceLines.map((line) => ({
        ...line,
        amount: -Math.abs(line.amount), // S'assurer que le montant est négatif
      }));
    }

    // Générer le HTML
    return this.renderInvoiceTemplate(
      template,
      transaction,
      entityData,
      contact,
      formattedDate,
      amounts,
      invoiceLines
    );
  }

  /**
   * Charger le template HTML de la facture
   */
  private async loadInvoiceTemplate(): Promise<string> {
    const templatePath = join(
      process.cwd(),
      'src',
      'common',
      'utils',
      'invoice-template',
      'invoice.template.html'
    );

    try {
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load invoice template from ${templatePath}`, error);
      throw new Error('Invoice template not found');
    }
  }

  /**
   * Formater la date de la transaction
   */
  private formatTransactionDate(transaction: Transaction): string {
    const date = new Date(transaction.timestamps.createdAt);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calculer les montants de la facture
   */
  private calculateInvoiceAmounts(transaction: Transaction): {
    total: string;
    solidHive: string;
    net: string;
  } {
    const total = Number(transaction.amount).toFixed(2);
    const solidHive = transaction.solidHiveAmount
      ? Number(transaction.solidHiveAmount).toFixed(2)
      : '0.00';
    const net = (Number(transaction.amount) - Number(transaction.solidHiveAmount || 0)).toFixed(2);

    return { total, solidHive, net };
  }

  /**
   * Rendre le template avec les données
   */
  private renderInvoiceTemplate(
    template: string,
    transaction: Transaction,
    entityData: any,
    contact: InvoiceContactInfo,
    formattedDate: string,
    amounts: { total: string; solidHive: string; net: string },
    invoiceLines: InvoiceLineItem[]
  ): string {
    let html = template;

    // Détecter si c'est un remboursement
    const isRefund = Number(transaction.amount) < 0;

    // Préparer les lignes HTML
    const invoiceLinesHtml = invoiceLines
      .map(
        (line) => `
      <tr class="border-b border-gray-200">
        <td class="py-4 text-sm">${line.description}</td>
        <td class="text-right py-4 text-sm font-semibold">${line.amount.toFixed(2)} €</td>
      </tr>`
      )
      .join('');

    // Préparer la ligne SolidHive si applicable
    const solidHiveRow =
      Math.abs(Number(amounts.solidHive)) > 0
        ? `
      <tr class="border-b border-gray-200">
        <td class="py-4 text-sm text-gray-600">Contribution SolidHive (frais de plateforme)</td>
        <td class="text-right py-4 text-sm text-gray-600">${amounts.solidHive} €</td>
      </tr>`
        : '';

    // Styles conditionnels selon le type (facture/avoir)
    const styles = isRefund
      ? {
          headerBgClass: 'bg-red-600',
          invoiceType: 'AVOIR / REMBOURSEMENT',
          transactionDetailsTitle: 'Détails du remboursement',
          tableBorderClass: 'border-red-600',
          tableHeaderClass: 'text-red-600',
          totalRowBgClass: 'bg-red-50',
          totalTextClass: 'text-red-600',
          totalLabel: 'MONTANT REMBOURSÉ',
          totalAmount: `${amounts.total} €`,
          infoBgClass: 'bg-red-50',
          infoBorderClass: 'border-red-500',
          infoIconClass: 'text-red-500',
          infoIconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          infoTextClass: 'text-red-600',
          paymentStatusTitle: 'Remboursement traité',
        }
      : {
          headerBgClass: 'bg-secondary',
          invoiceType: 'FACTURE',
          transactionDetailsTitle: 'Détails de la transaction',
          tableBorderClass: 'border-secondary',
          tableHeaderClass: 'text-secondary',
          totalRowBgClass: 'bg-gray-50',
          totalTextClass: 'text-secondary',
          totalLabel: 'TOTAL',
          totalAmount: `${amounts.total} €`,
          infoBgClass: 'bg-accent/10',
          infoBorderClass: 'border-accent',
          infoIconClass: 'text-accent',
          infoIconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          infoTextClass: 'text-accent',
          paymentStatusTitle: 'Paiement effectué avec succès',
        };

    // Remplacer les placeholders
    html = html
      .replace(/{{transactionId}}/g, transaction.id)
      .replace(/{{invoiceNumber}}/g, transaction.id.slice(-8).toUpperCase())
      .replace(/{{formattedDate}}/g, formattedDate)
      .replace(/{{userFirstname}}/g, contact.firstName)
      .replace(/{{userName}}/g, contact.lastName)
      .replace(/{{userEmail}}/g, contact.email)
      .replace(/{{userPhone}}/g, contact.phone || '')
      .replace(/{{userAddress}}/g, contact.address || '')
      .replace(/{{userPostcode}}/g, contact.postcode || '')
      .replace(/{{userCity}}/g, contact.city || '')
      .replace(/{{entityName}}/g, entityData.name)
      .replace(/{{transactionType}}/g, entityData.type)
      .replace(/{{transactionDescription}}/g, entityData.description)
      .replace(/{{amount}}/g, amounts.total)
      .replace(/{{netAmount}}/g, amounts.net)
      .replace(/{{invoiceLines}}/g, invoiceLinesHtml)
      .replace(/{{solidHiveAmountRow}}/g, solidHiveRow)
      // Nouveaux placeholders pour les styles conditionnels
      .replace(/{{headerBgClass}}/g, styles.headerBgClass)
      .replace(/{{invoiceType}}/g, styles.invoiceType)
      .replace(/{{transactionDetailsTitle}}/g, styles.transactionDetailsTitle)
      .replace(/{{tableBorderClass}}/g, styles.tableBorderClass)
      .replace(/{{tableHeaderClass}}/g, styles.tableHeaderClass)
      .replace(/{{totalRowBgClass}}/g, styles.totalRowBgClass)
      .replace(/{{totalTextClass}}/g, styles.totalTextClass)
      .replace(/{{totalLabel}}/g, styles.totalLabel)
      .replace(/{{totalAmount}}/g, styles.totalAmount)
      .replace(/{{infoBgClass}}/g, styles.infoBgClass)
      .replace(/{{infoBorderClass}}/g, styles.infoBorderClass)
      .replace(/{{infoIconClass}}/g, styles.infoIconClass)
      .replace(/{{infoIconPath}}/g, styles.infoIconPath)
      .replace(/{{infoTextClass}}/g, styles.infoTextClass)
      .replace(/{{paymentStatusTitle}}/g, styles.paymentStatusTitle);

    return html;
  }

  /**
   * Générer un PDF à partir du HTML
   */
  private async generatePDF(html: string): Promise<Buffer> {
    let browser;

    try {
      browser = await puppeteer.launch({
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

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw new Error('Failed to generate invoice PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Sauvegarder le fichier de facture
   */
  private async saveInvoiceFile(
    pdfBuffer: Buffer,
    transactionId: string,
    userId: string
  ): Promise<string> {
    // Créer le répertoire s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'uploads', userId);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const { v4: uuidv4 } = await import('uuid');
    const filename = `${uuidv4()}.pdf`;
    const filePath = join(uploadsDir, filename);

    try {
      // Écrire le fichier
      writeFileSync(filePath, pdfBuffer);

      // Créer l'entrée en base de données
      const fileEntity = this.fileRepository.create({
        filename,
        relatedTo: 'Transaction',
        relatedBy: transactionId,
        purpose: 'invoice',
        index: 0,
        userId,
        oldFilename: `facture-${transactionId.slice(-8)}.pdf`,
        mimetype: 'application/pdf',
        extension: 'pdf',
        size: pdfBuffer.length,
        allowedSystemRoles: [],
        allowedAssociationRoles: [],
      });

      await this.fileRepository.save(fileEntity);
      this.logger.log(`Invoice saved: ${filename} for transaction ${transactionId}`);

      return filename;
    } catch (error) {
      this.logger.error(`Failed to save invoice file: ${filename}`, error);
      throw new Error('Failed to save invoice file');
    }
  }
}
