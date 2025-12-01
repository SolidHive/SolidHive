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
  private async generateEventInvoiceLinesFromDatabase(eventId: string): Promise<InvoiceLineItem[]> {
    const eventRegisters = await this.eventRegisterRepository.find({
      where: { eventPricing: { event: { id: eventId } } },
      relations: ['eventPricing'],
    });

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
        invoiceLines = await this.generateEventInvoiceLinesFromDatabase(transaction.relatedBy);
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
      Number(amounts.solidHive) > 0
        ? `
      <tr class="border-b border-gray-200">
        <td class="py-4 text-sm text-gray-600">Contribution SolidHive (frais de plateforme)</td>
        <td class="text-right py-4 text-sm text-gray-600">${amounts.solidHive} €</td>
      </tr>`
        : '';

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
      .replace(/{{solidHiveAmountRow}}/g, solidHiveRow);

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
