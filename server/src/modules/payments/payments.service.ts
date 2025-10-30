import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssociationsService } from '../associations/associations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private configService: ConfigService,
    private associationsService: AssociationsService
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

    // Créer la session Stripe Checkout
    const session = await this.stripe.checkout.sessions.create({
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
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }
}
