import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { StripeAccountService } from './stripe-account.service';
import { PaymentsController } from './payments.controller';
import { StripeAccountController } from './stripe-account.controller';
import { AssociationsModule } from '../associations/associations.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { FundraisingsModule } from '../associations/modules/fundraisings/fundraisings.module';

/**
 * Module pour la gestion des paiements et des comptes Stripe Connect
 */
@Module({
  imports: [ConfigModule, AssociationsModule, TransactionsModule, FundraisingsModule],
  providers: [
    PaymentsService,
    StripeService,
    StripeAccountService,
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
          throw new Error('STRIPE_SECRET_KEY must be defined in environment variables');
        }
        return new Stripe(secretKey, {
          apiVersion: '2025-10-29.clover',
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [PaymentsController, StripeAccountController],
  exports: [PaymentsService, StripeService, StripeAccountService],
})
export class PaymentsModule {}
