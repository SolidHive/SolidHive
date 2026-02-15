import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { StripeAccountService } from './stripe-account.service';
import { PaymentsController } from './payments.controller';
import { StripeAccountController } from './stripe-account.controller';
import { AssociationsModule } from '../associations/associations.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Transaction } from '../transactions/entities/transaction.entity';
import { FundraisingsModule } from '../associations/modules/fundraisings/fundraisings.module';
import { Event } from '../associations/modules/events/entities/event.entity';
import { EventPricing } from '../associations/modules/events/modules/pricings/entities/event-pricing.entity';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { PaymentValidationService } from './services/payment-validation.service';
import { DonationPaymentService } from './services/donation-payment.service';
import { EventPaymentService } from './services/event-payment.service';
import { TicketsModule } from '../associations/modules/events/modules/tickets/tickets.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { EmailModule } from '../../common/utils/email/email.module';

/**
 * Module pour la gestion des paiements et des comptes Stripe Connect
 */
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AssociationsModule),
    TransactionsModule,
    FundraisingsModule,
    TicketsModule,
    InvoicesModule,
    EmailModule,
    TypeOrmModule.forFeature([Transaction, Event, EventPricing, EventRegister, Fundraising]),
  ],
  providers: [
    PaymentsService,
    StripeService,
    StripeAccountService,
    PaymentValidationService,
    DonationPaymentService,
    EventPaymentService,
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
  exports: [PaymentsService, StripeService, StripeAccountService, EventPaymentService],
})
export class PaymentsModule {}
