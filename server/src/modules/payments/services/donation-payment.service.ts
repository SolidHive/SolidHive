import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { AssociationsService } from '../../associations/associations.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Fundraising } from '../../associations/modules/fundraisings/entities/fundraising.entity';
import { CreateDonationDto } from '../dto/create-donation.dto';
import { Categories } from '../../../common/enums/categories';
import {
  AssociationNotFoundException,
  StripeAccountNotConfiguredException,
} from '../exceptions/payment.exceptions';
import { StripeSessionBuilder } from '../helpers/stripe-session.builder';
import { PaymentValidationService } from './payment-validation.service';
import { InvoicesService } from '../../invoices/invoices.service';
import { EmailService } from '../../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface DonationSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Service de gestion des paiements pour les dons
 */
@Injectable()
export class DonationPaymentService {
  private readonly logger = new Logger(DonationPaymentService.name);
  private readonly isMockMode: boolean;
  private donationReceiptTemplate: handlebars.TemplateDelegate;

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly associationsService: AssociationsService,
    private readonly transactionsService: TransactionsService,
    private readonly validationService: PaymentValidationService,
    private readonly invoicesService: InvoicesService,
    private readonly emailService: EmailService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Fundraising)
    private fundraisingsRepository: Repository<Fundraising>
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';

    // Load donation receipt template
    try {
      const templatePath = path.join(
        process.cwd(),
        'src/common/utils/email/templates/donation-receipt.html'
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      handlebars.registerHelper('gt', (a, b) => a > b);
      this.donationReceiptTemplate = handlebars.compile(templateSource);
    } catch (error) {
      this.logger.error('Erreur lors du chargement du template donation-receipt.html', error);
    }
  }

  /**
   * Créer une session de don Stripe Checkout
   */
  async createDonationSession(
    createDonationDto: CreateDonationDto,
    userId?: string
  ): Promise<DonationSessionResult> {
    // Valider le montant
    this.validationService.validateAmount(createDonationDto.amount);

    // Récupérer et valider l'association
    const association = await this.associationsService.findOne(createDonationDto.associationId);
    if (!association) {
      throw new AssociationNotFoundException(createDonationDto.associationId);
    }

    // Vérifier que l'association a un compte Stripe
    if (!association.stripeAccountId) {
      throw new StripeAccountNotConfiguredException(association.name);
    }

    // Vérifier que le compte Stripe peut recevoir des paiements (sauf en mode mock)
    await this.validationService.validateStripeAccount(
      association.stripeAccountId,
      association.name,
      this.isMockMode
    );

    this.logger.log(
      `Création d'une session de don pour l'association ${association.name} (${createDonationDto.amount}€)`
    );

    // Calculer les montants
    const totalAmount = createDonationDto.amount;
    const solidHivePercentage = createDonationDto.supportSolidHive
      ? (createDonationDto.solidHivePercentage ?? 5)
      : 0;
    const solidHiveAmount = (totalAmount * solidHivePercentage) / 100;
    const associationAmount = totalAmount - solidHiveAmount;

    // Valider le montant total
    this.validationService.validateAmount(totalAmount);

    // Construire la session Stripe
    const sessionConfig = this.buildStripeSession(
      association,
      createDonationDto,
      associationAmount,
      solidHiveAmount,
      solidHivePercentage,
      totalAmount,
      userId
    );

    // Créer la session
    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    this.logger.log(`Session de don créée avec succès: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Construire la configuration de la session Stripe
   */
  private buildStripeSession(
    association: any,
    donationDto: CreateDonationDto,
    associationAmount: number,
    solidHiveAmount: number,
    solidHivePercentage: number,
    totalAmount: number,
    userId?: string
  ): Stripe.Checkout.SessionCreateParams {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;

    const sessionBuilder = new StripeSessionBuilder()
      .setMockMode(this.isMockMode)
      .addAssociationDonation(association.name, associationAmount, donationDto.message)
      .addSolidHiveDonation(solidHiveAmount)
      .setMetadata({
        associationId: donationDto.associationId,
        fundraisingId: donationDto.fundraisingId,
        userId,
        associationAmount,
        solidHiveAmount,
        solidHivePercentage,
        totalAmount,
        message: donationDto.message,
      })
      .setUrls({
        successUrl: `${frontendUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/association/${donationDto.associationId}`,
      })
      .setTransferConfig({
        stripeAccountId: association.stripeAccountId!,
        associationAmount,
        supportSolidHive: donationDto.supportSolidHive || false,
        solidHiveAmount,
      });

    return sessionBuilder.build();
  }

  /**
   * Finaliser le don après paiement réussi
   */
  async finalizeDonation(sessionId: string): Promise<void> {
    this.logger.log(`Finalisation du don pour la session ${sessionId}`);

    // Vérifier si une transaction existe déjà pour cette session
    const existingTransaction = await this.transactionsRepository.findOne({
      where: { invoicePath: `/invoices/donation-${sessionId}.pdf` },
    });

    if (existingTransaction) {
      this.logger.log(`Session ${sessionId} déjà finalisée, aucune action nécessaire`);
      return;
    }

    // Récupérer la session pour vérifier le paiement
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error(`Le paiement n'est pas complété pour la session ${sessionId}`);
    }

    const metadata = session.metadata;
    if (!metadata) {
      throw new Error(`Métadonnées manquantes pour la session ${sessionId}`);
    }

    const {
      associationId,
      fundraisingId,
      userId,
      associationAmount,
      solidHiveAmount,
      solidHivePercentage,
      totalAmount,
      message,
    } = metadata;

    // Créer la transaction
    const transactionId = await this.createTransactionRecord(
      {
        associationId,
        fundraisingId,
        amount: parseFloat(totalAmount),
        message,
        supportSolidHive: parseFloat(solidHiveAmount) > 0,
        solidHivePercentage: parseFloat(solidHivePercentage),
      } as CreateDonationDto,
      parseFloat(totalAmount),
      parseFloat(solidHiveAmount),
      parseFloat(solidHivePercentage),
      sessionId,
      userId
    );

    // Générer et envoyer la facture
    if (transactionId && userId) {
      await this.invoicesService.getInvoiceStream(transactionId, userId);

      const association = await this.associationsService.findOne(associationId);
      await this.sendDonationReceiptEmail(
        userId,
        transactionId,
        association,
        {
          associationId,
          fundraisingId,
          amount: parseFloat(totalAmount),
          message,
        } as CreateDonationDto,
        parseFloat(totalAmount),
        parseFloat(solidHiveAmount)
      );
    }

    // Mettre à jour le montant de la cagnotte
    if (fundraisingId) {
      await this.updateFundraisingAmount(fundraisingId, parseFloat(associationAmount));
    }

    this.logger.log(`Don finalisé avec succès pour la session ${sessionId}`);
  }

  /**
   * Créer un enregistrement de transaction pour la traçabilité
   */
  private async createTransactionRecord(
    donationDto: CreateDonationDto,
    totalAmount: number,
    solidHiveAmount: number,
    solidHivePercentage: number,
    sessionId: string,
    userId?: string
  ): Promise<string | undefined> {
    if (!userId) {
      return undefined;
    }

    try {
      const transactionData = {
        amount: totalAmount,
        relatedTo: donationDto.fundraisingId ? Categories.FUNDRAISING : Categories.ASSOCIATION,
        relatedBy: donationDto.fundraisingId || donationDto.associationId,
        invoicePath: `/invoices/donation-${sessionId}.pdf`,
        solidHiveAmount: solidHiveAmount > 0 ? solidHiveAmount : undefined,
      };

      const transaction = await this.transactionsService.create(transactionData, userId);
      this.logger.debug(`Transaction enregistrée pour la session ${sessionId}`);
      return transaction.id;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la transaction pour la session ${sessionId}`,
        error
      );
      return undefined;
    }
  }

  private async sendDonationReceiptEmail(
    userId: string,
    transactionId: string,
    association: any,
    donationDto: CreateDonationDto,
    totalAmount: number,
    solidHiveAmount: number
  ): Promise<void> {
    try {
      const user = await this.associationsService['usersRepository'].findOne({
        where: { id: userId },
      });

      if (!user) return;

      const invoiceFile = await this.invoicesService['fileRepository'].findOne({
        where: { relatedTo: 'Transaction', relatedBy: transactionId },
      });

      if (!invoiceFile) {
        this.logger.error(`Facture non trouvée pour la transaction ${transactionId}`);
        return;
      }

      const { join } = await import('path');
      const { existsSync } = await import('fs');

      const invoicePath = join(process.cwd(), 'uploads', userId, invoiceFile.filename);

      if (!existsSync(invoicePath)) {
        this.logger.error(`Fichier facture introuvable: ${invoicePath}`);
        return;
      }

      let recipientName = association.name;
      if (donationDto.fundraisingId) {
        const fundraising = await this.fundraisingsRepository.findOne({
          where: { id: donationDto.fundraisingId },
        });
        if (fundraising) {
          recipientName = `${fundraising.title} (${association.name})`;
        }
      }

      const htmlContent = this.donationReceiptTemplate({
        userName: user.name,
        recipientName,
        amount: totalAmount.toFixed(2),
        supportedSolidHive: solidHiveAmount > 0,
        solidHiveAmount: solidHiveAmount.toFixed(2),
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: `Facture pour votre don à ${recipientName}`,
        html: htmlContent,
        attachments: [
          {
            filename: invoiceFile.oldFilename || 'recu-fiscal.pdf',
            path: invoicePath,
          },
        ],
      });

      this.logger.log(`Email de facture envoyé à ${user.email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de facture`, error);
    }
  }

  private async updateFundraisingAmount(fundraisingId: string, amount: number): Promise<void> {
    try {
      const fundraising = await this.fundraisingsRepository.findOne({
        where: { id: fundraisingId },
      });

      if (!fundraising) {
        this.logger.error(`Cagnotte non trouvée: ${fundraisingId}`);
        return;
      }

      const newAmount = fundraising.amount + amount;
      await this.fundraisingsRepository.update(fundraisingId, { amount: newAmount });

      this.logger.log(
        `Montant de la cagnotte ${fundraising.title} mis à jour: ${fundraising.amount}€ → ${newAmount}€`
      );
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la cagnotte ${fundraisingId}`, error);
    }
  }
}
