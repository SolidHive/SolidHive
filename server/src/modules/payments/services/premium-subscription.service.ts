import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Association } from '../../associations/entities/association.entity';
import { TransactionsService } from '../../transactions/transactions.service';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { CreatePremiumSubscriptionDto } from '../dto/create-premium-subscription.dto';
import { Categories } from '../../../common/enums/categories';
import { AssociationNotFoundException } from '../exceptions/payment.exceptions';
import { StripeSessionBuilder } from '../helpers/stripe-session.builder';
import { PaymentValidationService } from './payment-validation.service';

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

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly validationService: PaymentValidationService,
    @InjectRepository(Association)
    private associationsRepository: Repository<Association>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
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
    const transaction = this.transactionsRepository.create({
      amount: totalAmount,
      relatedTo: Categories.PREMIUM,
      relatedBy: associationId,
      invoicePath: '', // À générer plus tard si nécessaire
      solidHiveAmount: totalAmount, // Tout l'argent va à SolidHive
      user: userId !== 'anonymous' ? { id: userId } : null,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(`Transaction premium créée: ${transaction.id}`);
  }
}
