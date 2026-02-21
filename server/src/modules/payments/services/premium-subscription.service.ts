import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Association } from '../../associations/entities/association.entity';
import { AssociationsService } from '../../associations/associations.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { CreatePremiumSubscriptionDto } from '../dto/create-premium-subscription.dto';
import { Categories } from '../../../common/enums/categories';
import { AssociationNotFoundException } from '../exceptions/payment.exceptions';
import { StripeSessionBuilder } from '../helpers/stripe-session.builder';
import { PaymentValidationService } from './payment-validation.service';
import { InvoicesService } from '../../invoices/invoices.service';
import { EmailService } from '../../../common/utils/email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface PremiumSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Service de gestion des paiements pour les abonnements premium
 */
@Injectable()
export class PremiumSubscriptionService {
  private readonly logger = new Logger(PremiumSubscriptionService.name);
  private readonly isMockMode: boolean;
  private readonly PRICE_PER_MONTH = 15; // 15€ par mois
  private premiumTemplate: handlebars.TemplateDelegate;

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly validationService: PaymentValidationService,
    private readonly associationsService: AssociationsService,
    @InjectRepository(Association)
    private associationsRepository: Repository<Association>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly invoicesService: InvoicesService,
    private readonly emailService: EmailService
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';

    // Load premium template
    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'common',
        'utils',
        'email',
        'templates',
        'premium-subscription-confirmation.html'
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.premiumTemplate = handlebars.compile(templateSource);
    } catch (error) {
      this.logger.error(
        'Erreur lors du chargement du template premium-subscription-confirmation.html',
        error
      );
    }
  }

  /**
   * Créer une session d'abonnement premium Stripe Checkout
   */
  async createPremiumSession(
    createPremiumDto: CreatePremiumSubscriptionDto,
    userId?: string
  ): Promise<PremiumSessionResult> {
    // Récupérer et valider l'association
    const association = await this.associationsRepository.findOne({
      where: { id: createPremiumDto.associationId },
    });
    if (!association) {
      throw new AssociationNotFoundException(createPremiumDto.associationId);
    }

    this.logger.log(
      `Création d'une session premium pour l'association ${association.name} (${createPremiumDto.months} mois)`
    );

    // Calculer le montant total
    const totalAmount = createPremiumDto.months * this.PRICE_PER_MONTH;

    // Valider le montant
    this.validationService.validateAmount(totalAmount);

    // Construire la session Stripe
    const sessionConfig = this.buildStripeSession(
      association,
      createPremiumDto,
      totalAmount,
      userId
    );

    // Créer la session
    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    this.logger.log(`Session premium créée avec succès: ${session.id}`);

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
    premiumDto: CreatePremiumSubscriptionDto,
    totalAmount: number,
    userId?: string
  ): Stripe.Checkout.SessionCreateParams {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;

    const sessionBuilder = new StripeSessionBuilder()
      .setMockMode(this.isMockMode)
      .addLineItem({
        name: `Abonnement Premium - ${association.name}`,
        description: `${premiumDto.months} mois d'accès premium (${this.PRICE_PER_MONTH}€/mois)`,
        amount: totalAmount,
      })
      .setMetadata({
        associationId: association.id,
        fundraisingId: '',
        userId: userId || 'anonymous',
        associationAmount: 0,
        solidHiveAmount: totalAmount,
        solidHivePercentage: 0,
        totalAmount: totalAmount,
        message: `premium_${premiumDto.months}`, // Stocker les mois dans le message
      })
      .setUrls({
        successUrl: `${frontendUrl}/payment/premium-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/about-premium`,
      });

    return sessionBuilder.build();
  }

  /**
   * Traiter le webhook de confirmation de paiement
   */
  async handlePremiumPaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata;
    if (!metadata) {
      this.logger.error('Session sans metadata');
      return;
    }

    // éviter retraitement multiple si la transaction existe déjà
    const existingInvoicePath = `/invoices/premium-${session.id}.pdf`;
    const existing = await this.transactionsRepository.findOne({
      where: { invoicePath: existingInvoicePath },
    });
    if (existing) {
      this.logger.log(`Session premium ${session.id} déjà finalisée, ignorer.`);
      return;
    }

    const { associationId, message, userId } = metadata;
    const totalAmount = (session.amount_total ?? 0) / 100;

    // Extraire le nombre de mois du message (format: "premium_X")
    const monthsMatch = message?.match(/premium_(\d+)/);
    if (!monthsMatch) {
      this.logger.error("Impossible d'extraire le nombre de mois des métadonnées");
      return;
    }
    const months = parseInt(monthsMatch[1], 10);

    this.logger.log(
      `Traitement du paiement premium réussi pour l'association ${associationId} (${months} mois)`
    );

    // Récupérer l'association
    const association = await this.associationsRepository.findOne({
      where: { id: associationId },
    });
    if (!association) {
      this.logger.error(`Association ${associationId} introuvable`);
      return;
    }

    // Calculer la nouvelle date de validité
    const currentDate = association.paymentServiceValidUntil
      ? new Date(association.paymentServiceValidUntil)
      : new Date();

    // Si la date actuelle est dans le passé, on part d'aujourd'hui
    if (currentDate < new Date()) {
      currentDate.setTime(new Date().getTime());
    }

    // Ajouter les mois
    currentDate.setMonth(currentDate.getMonth() + months);

    // Mettre à jour l'association directement via le repository
    await this.associationsRepository.update(associationId, {
      paymentServiceValidUntil: currentDate,
      canReceiveDonations: true,
    });

    this.logger.log(
      `Association ${association.name} mise à jour avec la date de validité : ${currentDate.toISOString()}`
    );

    // Créer la transaction
    const invoicePath = `/invoices/premium-${session.id}.pdf`;
    const transaction = this.transactionsRepository.create({
      amount: totalAmount,
      relatedTo: Categories.PREMIUM,
      relatedBy: associationId,
      invoicePath,
      solidHiveAmount: totalAmount, // Tout l'argent va à SolidHive
      user: userId !== 'anonymous' ? { id: userId } : null,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(`Transaction premium créée: ${transaction.id}`);

    // generate invoice and send email
    if (userId && transaction.id) {
      await this.invoicesService.getInvoiceStream(transaction.id, userId);
      await this.sendPremiumConfirmationEmail(
        userId,
        transaction.id,
        association,
        months,
        totalAmount,
        currentDate
      );
    }
  }

  /**
   * Retourne la dernière transaction premium liée à une association (pour l'URL de la facture)
   */
  async getLatestPremiumInvoice(associationId: string): Promise<{ transactionId: string | null }> {
    const tx = await this.transactionsRepository.findOne({
      where: { relatedTo: Categories.PREMIUM, relatedBy: associationId },
      order: { timestamps: { createdAt: 'DESC' } },
    });

    return { transactionId: tx ? tx.id : null };
  }

  private async sendPremiumConfirmationEmail(
    userId: string,
    transactionId: string,
    association: any,
    months: number,
    totalAmount: number,
    validUntil: Date
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

      const invoicePath = path.join(process.cwd(), 'uploads', userId, invoiceFile.filename);
      if (!fs.existsSync(invoicePath)) {
        this.logger.error(`Fichier facture introuvable: ${invoicePath}`);
        return;
      }

      const htmlContent = this.premiumTemplate({
        userName: user.name,
        associationName: association.name,
        months,
        totalAmount: totalAmount.toFixed(2),
        validUntil: validUntil.toLocaleDateString('fr-FR'),
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: `Confirmation d'abonnement Premium - ${association.name}`,
        html: htmlContent,
        attachments: [
          {
            filename: invoiceFile.oldFilename || 'facture.pdf',
            path: invoicePath,
          },
        ],
      });

      this.logger.log(`Email de confirmation premium envoyé à ${user.email}`);
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de confirmation premium", error);
    }
  }
}
