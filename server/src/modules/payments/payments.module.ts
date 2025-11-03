import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { AssociationsModule } from '../associations/associations.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { FundraisingsModule } from '../associations/modules/fundraisings/fundraisings.module';
import Stripe from 'stripe';

@Module({
  imports: [ConfigModule, AssociationsModule, TransactionsModule, FundraisingsModule],
  providers: [
    PaymentsService,
    StripeService,
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2025-10-29.clover',
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
