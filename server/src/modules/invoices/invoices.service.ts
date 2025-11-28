import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Association } from '../associations/entities/association.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { FilesService } from '../files/files.service';
import { File } from '../files/entities/file.entity';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Fundraising)
    private fundraisingRepository: Repository<Fundraising>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private filesService: FilesService
  ) {}

  async getInvoiceStream(transactionId: string, userId: string): Promise<any> {
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
    await this.generateAndSaveInvoice(transactionId, userId);

    // Retourner le stream de la facture nouvellement créée
    return await this.filesService.getFileStream('Transaction', transactionId, 0, 'invoice');
  }

  private async generateAndSaveInvoice(transactionId: string, userId: string): Promise<string> {
    // Récupérer la transaction avec ses relations
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (!transaction.user || transaction.user.id !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    // Récupérer les détails selon le type
    let entityDetails: any;
    let entityName = 'Entité inconnue';

    if (transaction.relatedTo === 'Association') {
      const association = await this.associationRepository.findOne({
        where: { id: transaction.relatedBy },
      });
      entityDetails = association;
      entityName = association?.name || 'Association inconnue';
    } else if (transaction.relatedTo === 'Event') {
      const event = await this.eventRepository.findOne({
        where: { id: transaction.relatedBy },
        relations: ['association'],
      });
      entityDetails = event;
      entityName = event?.title || 'Événement inconnu';
    } else if (transaction.relatedTo === 'Fundraising') {
      const fundraising = await this.fundraisingRepository.findOne({
        where: { id: transaction.relatedBy },
        relations: ['association'],
      });
      entityDetails = fundraising;
      entityName = fundraising?.title || 'Cagnotte inconnue';
    }

    // Générer le HTML de la facture
    const html = this.generateInvoiceHTML(transaction, entityName, entityDetails);

    // Convertir en PDF
    const pdfBuffer = await this.generatePDF(html);

    // Sauvegarder le fichier directement
    const uploadsDir = join(process.cwd(), 'uploads', userId);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique (comme le fait Multer)
    const { v4: uuidv4 } = await import('uuid');
    const filename = uuidv4();
    const filePath = join(uploadsDir, filename);
    writeFileSync(filePath, pdfBuffer);

    // Créer l'entrée de fichier directement en base de données
    const fileEntity = this.fileRepository.create({
      filename: filename,
      relatedTo: 'Transaction',
      relatedBy: transactionId,
      purpose: 'invoice',
      index: 0,
      userId: userId,
      oldFilename: `facture-${transactionId}.pdf`,
      mimetype: 'application/pdf',
      extension: 'pdf',
      size: pdfBuffer.length,
      allowedSystemRoles: [],
      allowedAssociationRoles: [],
    });

    await this.fileRepository.save(fileEntity);

    return filename;
  }

  private generateInvoiceHTML(transaction: any, entityName: string, entityDetails: any): string {
    // Lire le template HTML
    const templatePath = join(
      process.cwd(),
      'src',
      'common',
      'utils',
      'invoice-template',
      'invoice.template.html'
    );
    let html = readFileSync(templatePath, 'utf-8');

    // Formater la date
    const date = new Date(transaction.timestamps.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Calculer les montants (transaction.amount = total payé, solidHiveAmount est inclus dedans)
    const amount = parseFloat(transaction.amount).toFixed(2); // Total payé
    const solidHiveAmount = transaction.solidHiveAmount
      ? parseFloat(transaction.solidHiveAmount).toFixed(2)
      : '0.00';
    const netAmount = (
      parseFloat(transaction.amount) - parseFloat(transaction.solidHiveAmount || 0)
    ).toFixed(2); // Montant net (total - frais)

    // Déterminer le type de transaction et extraire les informations de l'entité
    let transactionType = 'Transaction';
    let transactionDescription = 'Transaction';

    if (transaction.relatedTo === 'Association') {
      transactionType = 'Don à une association';
      transactionDescription = "Don à l'association";
    } else if (transaction.relatedTo === 'Event') {
      transactionType = 'Inscription à un événement';
      transactionDescription = "Inscription à l'événement";
    } else if (transaction.relatedTo === 'Fundraising') {
      transactionType = 'Don à une cagnotte';
      transactionDescription = 'Contribution à la cagnotte';
    }

    // Utiliser entityDetails pour validation (s'assurer que l'entité existe toujours)
    if (!entityDetails) {
      throw new Error(`L'entité ${transaction.relatedTo} n'existe plus`);
    }

    // Ligne SolidHive si applicable
    const solidHiveAmountRow =
      transaction.solidHiveAmount && transaction.solidHiveAmount > 0
        ? `<tr class="border-b border-gray-200">
            <td class="py-4 text-sm text-gray-600">Contribution SolidHive (frais de plateforme)</td>
            <td class="text-right py-4 text-sm text-gray-600">${solidHiveAmount} €</td>
        </tr>`
        : '';

    // Remplacer tous les placeholders
    html = html
      .replace(/{{transactionId}}/g, transaction.id)
      .replace(/{{invoiceNumber}}/g, transaction.id.slice(-8).toUpperCase())
      .replace(/{{formattedDate}}/g, formattedDate)
      .replace(/{{userName}}/g, transaction.user?.name || 'Utilisateur')
      .replace(/{{userFirstname}}/g, transaction.user?.firstname || 'anonyme')
      .replace(/{{userEmail}}/g, transaction.user?.email || 'N/A')
      .replace(/{{entityName}}/g, entityName)
      .replace(/{{transactionType}}/g, transactionType)
      .replace(/{{transactionDescription}}/g, transactionDescription)
      .replace(/{{netAmount}}/g, netAmount)
      .replace(/{{solidHiveAmountRow}}/g, solidHiveAmountRow)
      .replace(/{{amount}}/g, amount);

    return html;
  }

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
}
