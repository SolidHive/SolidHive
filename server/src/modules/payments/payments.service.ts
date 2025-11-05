import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AssociationsService } from '../associations/associations.service';
import { TransactionsService } from '../transactions/transactions.service';
import { StripeService } from './stripe.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Categories } from '../../common/enums/categories';
import {
  AssociationNotFoundException,
  StripeAccountNotConfiguredException,
  StripeAccountNotReadyException,
  InvalidDonationAmountException,
} from './exceptions/payment.exceptions';
import { PaymentCalculationHelper } from './helpers/payment-calculation.helper';
import { StripeSessionBuilder } from './helpers/stripe-session.builder';

export interface DonationSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Service principal pour la gestion des paiements et donations
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly isMockMode: boolean;

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly associationsService: AssociationsService,
    private readonly transactionsService: TransactionsService,
    private readonly stripeService: StripeService
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
    this.logger.log(
      `PaymentsService initialisé en mode ${this.isMockMode ? 'MOCK' : 'PRODUCTION'}`
    );
  }

  /**
   * Créer une session de don Stripe Checkout
   */
  async createDonationSession(
    createDonationDto: CreateDonationDto,
    userId?: string
  ): Promise<DonationSessionResult> {
    // Valider le montant
    if (!PaymentCalculationHelper.validateAmount(createDonationDto.amount)) {
      throw new InvalidDonationAmountException();
    }

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
    await this.validateStripeAccount(association.stripeAccountId, association.name);

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
    if (!PaymentCalculationHelper.validateAmount(totalAmount)) {
      throw new InvalidDonationAmountException();
    }

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

    // Créer la transaction de traçabilité
    await this.createTransactionRecord(
      createDonationDto,
      totalAmount,
      solidHiveAmount,
      solidHivePercentage,
      session.id,
      userId
    );

    this.logger.log(`Session de don créée avec succès: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Valider qu'un compte Stripe peut recevoir des paiements
   */
  private async validateStripeAccount(
    stripeAccountId: string,
    associationName: string
  ): Promise<void> {
    if (this.isMockMode) {
      this.logger.debug(`Mode mock: compte Stripe ${stripeAccountId} considéré comme valide`);
      return;
    }

    const canReceivePayments = await this.stripeService.canAccountReceivePayments(stripeAccountId);
    if (!canReceivePayments) {
      throw new StripeAccountNotReadyException(associationName);
    }
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
   * Créer un enregistrement de transaction pour la traçabilité
   */
  private async createTransactionRecord(
    donationDto: CreateDonationDto,
    totalAmount: number,
    solidHiveAmount: number,
    solidHivePercentage: number,
    sessionId: string,
    userId?: string
  ): Promise<void> {
    if (!userId) {
      return;
    }

    try {
      const transactionData = {
        amount: totalAmount,
        relatedTo: donationDto.fundraisingId ? Categories.FUNDRAISING : Categories.ASSOCIATION,
        relatedBy: donationDto.fundraisingId || donationDto.associationId,
        invoicePath: `/invoices/donation-${sessionId}.pdf`,
        solidHiveAmount: solidHiveAmount > 0 ? solidHiveAmount : undefined,
      };

      await this.transactionsService.create(transactionData, userId);
      this.logger.debug(`Transaction enregistrée pour la session ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la transaction pour la session ${sessionId}`,
        error
      );
      // Ne pas bloquer le don si la transaction ne peut pas être créée
    }
  }

  /**
   * Récupérer les détails d'une session Stripe
   */
  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    this.logger.debug(`Récupération de la session ${sessionId}`);
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }
}
