import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { TransactionsService } from '../../transactions/transactions.service';
import { Event } from '../../associations/modules/events/entities/event.entity';
import { EventPricing } from '../../associations/modules/events/modules/pricings/entities/event-pricing.entity';
import { EventRegister } from '../../associations/modules/events/modules/registers/entities/event-register.entity';
import { CreateEventRegistrationDto } from '../dto/create-event-registration.dto';
import { Categories } from '../../../common/enums/categories';
import { StripeAccountNotConfiguredException } from '../exceptions/payment.exceptions';
import { StripeSessionBuilder } from '../helpers/stripe-session.builder';
import { PaymentValidationService } from './payment-validation.service';
import { TicketsService } from '../../associations/modules/events/modules/tickets/tickets.service';
import { InvoicesService } from '../../invoices/invoices.service';

export interface EventRegistrationSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Service de gestion des paiements pour les inscriptions aux événements
 */
@Injectable()
export class EventPaymentService {
  private readonly logger = new Logger(EventPaymentService.name);
  private readonly isMockMode: boolean;

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
    private readonly validationService: PaymentValidationService,
    private readonly ticketsService: TicketsService,
    private readonly invoicesService: InvoicesService,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventPricing)
    private eventPricingsRepository: Repository<EventPricing>
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
  }

  /**
   * Créer une session de paiement pour une inscription à un événement
   */
  async createEventRegistrationSession(
    createEventRegistrationDto: CreateEventRegistrationDto,
    userId?: string
  ): Promise<EventRegistrationSessionResult> {
    // Récupérer l'événement avec l'association et les tarifs
    const event = await this.eventsRepository.findOne({
      where: { id: createEventRegistrationDto.eventId },
      relations: ['association', 'pricings'],
    });

    if (!event) {
      throw new Error(`Événement non trouvé: ${createEventRegistrationDto.eventId}`);
    }

    // Vérifier que l'association a un compte Stripe
    if (!event.association.stripeAccountId) {
      throw new StripeAccountNotConfiguredException(event.association.name);
    }

    // Valider le compte Stripe
    await this.validationService.validateStripeAccount(
      event.association.stripeAccountId,
      event.association.name,
      this.isMockMode
    );

    // Calculer le montant total et vérifier les capacités
    const { totalAmount } = await this.calculateAmountAndValidateCapacity(
      event,
      createEventRegistrationDto.participants,
      userId
    );

    this.logger.log(
      `Création d'une session d'inscription pour l'événement ${event.title} (${createEventRegistrationDto.participants.length} participants, ${totalAmount}€)`
    );

    // Construire la session Stripe
    const sessionConfig = this.buildStripeSession(
      event,
      createEventRegistrationDto,
      totalAmount,
      userId
    );

    // Créer la session
    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    this.logger.log(`Session d'inscription créée avec succès: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Finaliser l'inscription à un événement après paiement réussi
   */
  async finalizeEventRegistration(sessionId: string): Promise<void> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error("Le paiement n'a pas été complété");
    }

    // Récupérer l'eventId depuis les métadonnées
    const eventId = session.metadata?.eventId;

    if (!eventId) {
      this.logger.error(`EventId manquant pour la session ${sessionId}`);
      throw new Error("Métadonnées d'inscription manquantes");
    }

    // Récupérer les données complètes depuis les métadonnées
    const { participants } = this.parseSessionMetadata(session);

    if (!participants || participants.length === 0) {
      this.logger.error(`Participants manquants pour la session ${sessionId}`);
      throw new Error('Données des participants manquantes');
    }

    // Récupérer l'événement
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['pricings'],
    });

    if (!event) {
      throw new Error(`Événement non trouvé: ${eventId}`);
    }

    let transactionId: string | undefined;
    if (session.metadata?.userId) {
      transactionId = await this.createTransactionRecord(
        eventId,
        session.metadata.userId,
        Number(session.amount_total) / 100,
        sessionId
      );

      // Parser les données de contact et participants depuis les métadonnées
      const { contact, participants: sessionParticipants } = this.parseSessionMetadata(session);

      await this.invoicesService.getInvoiceStream(
        transactionId,
        session.metadata.userId,
        contact,
        sessionParticipants
      );
    }

    // Créer les inscriptions pour chaque participant
    const registrationIds = await this.createRegistrations(
      event,
      participants,
      session.metadata?.userId
    );

    if (registrationIds.length > 0 && session.metadata?.userId && transactionId) {
      try {
        await this.ticketsService.generateAndSendAllTickets(registrationIds, transactionId);
        this.logger.log(
          `Email envoyé avec ${registrationIds.length} billet(s) pour l'événement ${event.title}`
        );
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email groupé`, error);
      }
    }

    this.logger.log(
      `Inscription finalisée avec succès pour l'événement ${event.title} (session: ${sessionId})`
    );
  }

  /**
   * Calculer le montant total et valider les capacités
   */
  private async calculateAmountAndValidateCapacity(
    event: any,
    participants: any[]
  ): Promise<{ totalAmount: number; pricingCounts: Map<string, number> }> {
    let totalAmount = 0;
    const pricingCounts = new Map<string, number>();

    for (const participant of participants) {
      const pricing = event.pricings?.find((p: any) => p.id === participant.pricingId);
      if (!pricing) {
        throw new Error(`Tarif non trouvé: ${participant.pricingId}`);
      }

      totalAmount += Number(pricing.amount);
      pricingCounts.set(participant.pricingId, (pricingCounts.get(participant.pricingId) || 0) + 1);
    }

    for (const [pricingId, requestedCount] of pricingCounts.entries()) {
      const pricing = await this.eventPricingsRepository.findOne({
        where: { id: pricingId },
        relations: ['registers'],
      });

      if (pricing && pricing.maxCapacity) {
        const currentRegistrations = pricing.registers?.length || 0;
        const availableCapacity = pricing.maxCapacity - currentRegistrations;

        if (requestedCount > availableCapacity) {
          throw new Error(
            `Capacité insuffisante pour le tarif "${pricing.title}". Disponible: ${availableCapacity}, Demandé: ${requestedCount}`
          );
        }
      }
    }

    return { totalAmount, pricingCounts };
  }

  /**
   * Construire la configuration de la session Stripe pour un événement
   */
  private buildStripeSession(
    event: any,
    registrationDto: CreateEventRegistrationDto,
    totalAmount: number,
    userId?: string
  ): Stripe.Checkout.SessionCreateParams {
    const sessionBuilder = new StripeSessionBuilder().setMockMode(this.isMockMode).setUrls({
      successUrl: `${this.configService.get('FRONTEND_URL')}/event/${event.id}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${this.configService.get('FRONTEND_URL')}/event/${event.id}/registration`,
    });

    // Ajouter les line items pour chaque participant
    for (const participant of registrationDto.participants) {
      const pricing = event.pricings?.find((p: any) => p.id === participant.pricingId);
      if (pricing) {
        sessionBuilder.addLineItem({
          name: `${event.title} - ${pricing.title}`,
          description: `Billet pour ${participant.firstName} ${participant.lastName}`,
          amount: Number(pricing.amount),
        });
      }
    }

    // Stocker les données dans les métadonnées Stripe (chaque clé peut avoir 500 caractères)
    const config: Stripe.Checkout.SessionCreateParams = sessionBuilder.build();
    config.metadata = {
      type: 'event_registration',
      eventId: event.id,
      associationId: event.association.id,
      userId: userId || '',
      participantCount: registrationDto.participants.length.toString(),
      totalAmount: totalAmount.toString(),
      // Stocker les participants de façon compacte (limite: 500 caractères par clé)
      participants: JSON.stringify(
        registrationDto.participants.map((p) => ({
          fn: p.firstName,
          ln: p.lastName,
          e: p.email,
          p: p.phone || '',
          pid: p.pricingId,
        }))
      ).substring(0, 490),
      // Stocker le contact de façon compacte
      contact: JSON.stringify({
        fn: registrationDto.contact.firstName,
        ln: registrationDto.contact.lastName,
        e: registrationDto.contact.email,
        p: registrationDto.contact.phone,
        a: registrationDto.contact.address,
        pc: registrationDto.contact.postcode,
        c: registrationDto.contact.city,
      }).substring(0, 490),
    };

    // Configurer le transfer vers le compte de l'association (sans commission)
    if (!this.isMockMode) {
      config.payment_intent_data = {
        transfer_data: {
          destination: event.association.stripeAccountId,
        },
      };
    }

    return config;
  }

  /**
   * Parser les métadonnées de la session Stripe
   */
  private parseSessionMetadata(session: Stripe.Checkout.Session): {
    participants: any[];
    contact: any;
  } {
    try {
      // Parser les participants depuis metadata
      const participantsData = JSON.parse(session.metadata?.participants || '[]');
      const participants = participantsData.map((p: any) => ({
        firstName: p.fn,
        lastName: p.ln,
        email: p.e,
        phone: p.p,
        pricingId: p.pid,
      }));

      // Parser le contact depuis metadata
      const contactData = JSON.parse(session.metadata?.contact || '{}');
      const contact = {
        firstName: contactData.fn,
        lastName: contactData.ln,
        email: contactData.e,
        phone: contactData.p,
        address: contactData.a,
        postcode: contactData.pc,
        city: contactData.c,
      };

      return { participants, contact };
    } catch (error) {
      this.logger.error(`Erreur lors du parsing des données pour la session ${session.id}`, error);
      throw new Error("Impossible de récupérer les données d'inscription");
    }
  }

  /**
   * Créer les inscriptions pour les participants
   */
  private async createRegistrations(
    event: any,
    participants: any[],
    userId?: string
  ): Promise<string[]> {
    const registrationIds: string[] = [];

    for (const participant of participants) {
      const pricing = event.pricings?.find((p: any) => p.id === participant.pricingId);

      if (pricing) {
        // Vérifier à nouveau la capacité avant d'enregistrer
        const currentPricing = await this.eventPricingsRepository.findOne({
          where: { id: participant.pricingId },
          relations: ['registers'],
        });

        if (currentPricing && currentPricing.maxCapacity) {
          const currentRegistrations = currentPricing.registers?.length || 0;

          if (currentRegistrations >= currentPricing.maxCapacity) {
            this.logger.error(
              `Capacité dépassée pour le tarif ${pricing.title} de l'événement ${event.title}`
            );
            throw new Error(`Capacité dépassée pour le tarif "${pricing.title}"`);
          }
        }

        // Créer l'inscription avec les infos du participant
        const register = this.eventsRepository.manager.create(EventRegister, {
          eventPricing: { id: participant.pricingId },
          user: userId ? { id: userId } : null,
          participantFirstName: participant.firstName,
          participantLastName: participant.lastName,
          participantEmail: participant.email,
        });

        const savedRegister = await this.eventsRepository.manager.save(EventRegister, register);

        registrationIds.push(savedRegister.id);

        this.logger.log(
          `Inscription créée pour ${participant.firstName} ${participant.lastName} à l'événement ${event.title}`
        );
      }
    }

    return registrationIds;
  }

  /**
   * Créer une transaction de traçabilité
   */
  private async createTransactionRecord(
    eventId: string,
    userId: string,
    totalAmount: number,
    sessionId: string
  ): Promise<string> {
    try {
      const transaction = await this.transactionsService.create(
        {
          amount: totalAmount,
          relatedTo: Categories.EVENT,
          relatedBy: eventId,
          invoicePath: `/invoices/event-registration-${sessionId}.pdf`,
        },
        userId
      );

      this.logger.debug(`Transaction créée pour la session ${sessionId}`);
      return transaction.id;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la transaction pour la session ${sessionId}`,
        error
      );
      throw error;
    }
  }
}
