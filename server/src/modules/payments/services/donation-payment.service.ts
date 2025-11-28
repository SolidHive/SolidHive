import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { AssociationsService } from '../../associations/associations.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { Fundraising } from '../../associations/modules/fundraisings/entities/fundraising.entity';
import { CreateDonationDto } from '../dto/create-donation.dto';
import { Categories } from '../../../common/enums/categories';
import {
  AssociationNotFoundException,
  StripeAccountNotConfiguredException,
} from '../exceptions/payment.exceptions';
import { StripeSessionBuilder } from '../helpers/stripe-session.builder';
import { PaymentValidationService } from './payment-validation.service';

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

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly associationsService: AssociationsService,
    private readonly transactionsService: TransactionsService,
    private readonly validationService: PaymentValidationService,
    @InjectRepository(Fundraising)
    private fundraisingsRepository: Repository<Fundraising>
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
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

    // Créer la transaction de traçabilité
    await this.createTransactionRecord(
      createDonationDto,
      totalAmount,
      solidHiveAmount,
      solidHivePercentage,
      session.id,
      userId
    );

    // Mettre à jour le montant de la cagnotte si c'est un don pour une cagnotte
    if (createDonationDto.fundraisingId) {
      await this.updateFundraisingAmount(createDonationDto.fundraisingId, associationAmount);
    }

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
   * Mettre à jour le montant récolté d'une cagnotte
   */
  private async updateFundraisingAmount(fundraisingId: string, amount: number): Promise<void> {
    try {
      const fundraising = await this.fundraisingsRepository.findOne({
        where: { id: fundraisingId },
      });

      if (!fundraising) {
        this.logger.error(`Cagnotte non trouvée: ${fundraisingId}`);
        return;
      }

      // Mettre à jour le montant actuel
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
