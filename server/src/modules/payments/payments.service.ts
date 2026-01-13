import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateDonationDto } from './dto/create-donation.dto';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { DonationPaymentService } from './services/donation-payment.service';
import { EventPaymentService } from './services/event-payment.service';

export interface DonationSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Service principal pour la gestion des paiements - Orchestrateur
 * Délègue aux services spécialisés pour chaque type de paiement
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly donationPaymentService: DonationPaymentService,
    private readonly eventPaymentService: EventPaymentService
  ) {
    this.logger.log('PaymentsService initialisé');
  }

  /**
   * Crée une session de paiement pour une donation
   * Délègue au service spécialisé DonationPaymentService
   */
  async createDonationSession(
    createDonationDto: CreateDonationDto,
    userId?: string
  ): Promise<DonationSessionResult> {
    this.logger.log('Création session donation', { dto: createDonationDto, userId });
    return this.donationPaymentService.createDonationSession(createDonationDto, userId);
  }

  /**
   * Crée une session de paiement pour une inscription à un événement
   * Délègue au service spécialisé EventPaymentService
   */
  async createEventRegistrationSession(
    createEventRegistrationDto: CreateEventRegistrationDto,
    userId?: string
  ): Promise<DonationSessionResult> {
    this.logger.log('Création session inscription événement', {
      dto: createEventRegistrationDto,
      userId,
    });
    return this.eventPaymentService.createEventRegistrationSession(
      createEventRegistrationDto,
      userId
    );
  }

  /**
   * Finalise l'inscription à un événement après paiement réussi
   * Délègue au service spécialisé EventPaymentService
   */
  async finalizeEventRegistration(sessionId: string): Promise<void> {
    this.logger.log('Finalisation inscription événement', { sessionId });
    return this.eventPaymentService.finalizeEventRegistration(sessionId);
  }

  /**
   * Finalise un don après paiement réussi
   * Délègue au service spécialisé DonationPaymentService
   */
  async finalizeDonation(sessionId: string): Promise<void> {
    this.logger.log('Finalisation don', { sessionId });
    return this.donationPaymentService.finalizeDonation(sessionId);
  }

  /**
   * Récupère les détails d'une session Stripe
   * Méthode commune utilisée par les différents flux de paiement
   */
  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    this.logger.debug(`Récupération de la session ${sessionId}`);
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }
}
