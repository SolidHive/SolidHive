import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssociationsService } from '../associations/associations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { Categories } from '../../common/enums/categories';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private configService: ConfigService,
    private associationsService: AssociationsService,
    private transactionsService: TransactionsService,
    private stripeService: StripeService
  ) {
    console.log('PaymentsService constructor called');
    console.log(
      'STRIPE_SECRET_KEY:',
      this.configService.get<string>('STRIPE_SECRET_KEY') ? 'SET' : 'NOT SET'
    );
  }

  async createDonationSession(createDonationDto: CreateDonationDto, userId?: string) {
    // Vérifier que l'association existe
    const association = await this.associationsService.findOne(createDonationDto.associationId);

    if (!association) {
      throw new Error('Association not found');
    }

    console.log(
      `Tentative de don pour l'association ${association.name} avec le compte Stripe: ${association.stripeAccountId}`
    );

    // Vérifier que l'association peut recevoir des dons
    // En mode développement/test, forcer la création d'un compte Stripe
    if (!association.stripeAccountId) {
      throw new Error(
        "Cette association n'accepte pas encore les dons en ligne. Veuillez créer un compte Stripe Connect."
      );
    }

    // Vérifier que le compte Stripe existe et peut recevoir des paiements
    const isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
    if (!isMockMode) {
      // En mode production seulement, vérifier que le compte Stripe existe et peut recevoir des paiements
      const canReceivePayments = await this.stripeService.canAccountReceivePayments(
        association.stripeAccountId
      );
      if (!canReceivePayments) {
        throw new Error(
          "Le compte Stripe de cette association n'est pas configuré pour recevoir des dons. " +
            "L'association doit compléter l'onboarding Stripe Connect."
        );
      }
    }

    // Créer la session Stripe Checkout
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Don à ${association.name}`,
              description:
                createDonationDto.message || `Soutien aux actions de ${association.name}`,
            },
            unit_amount: Math.round(createDonationDto.amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>('FRONTEND_URL')}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/association/${createDonationDto.associationId}`,
      metadata: {
        associationId: createDonationDto.associationId,
        fundraisingId: createDonationDto.fundraisingId || '',
        userId: userId || '',
        amount: createDonationDto.amount.toString(),
        message: createDonationDto.message || '',
      },
    };

    // En mode production seulement, ajouter le transfert vers le compte Stripe de l'association
    // En mode mock, pas de transfert (les comptes mock n'existent pas vraiment)
    if (!isMockMode) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: association.stripeAccountId!,
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    // Créer une transaction pour tracer le don
    if (userId) {
      try {
        const transactionData = {
          amount: createDonationDto.amount,
          relatedTo: createDonationDto.fundraisingId
            ? Categories.FUNDRAISING
            : Categories.ASSOCIATION,
          relatedBy: createDonationDto.fundraisingId || createDonationDto.associationId,
          invoicePath: `/invoices/donation-${session.id}.pdf`, // Chemin temporaire, sera mis à jour lors de la génération de la facture
        };

        await this.transactionsService.create(transactionData, userId);
      } catch (error) {
        console.error('Erreur lors de la création de la transaction:', error);
        // Ne pas bloquer le don si la transaction ne peut pas être créée
      }
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async getSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session;
  }
}
