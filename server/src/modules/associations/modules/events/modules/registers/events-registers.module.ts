import { Module } from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { EventsRegistersController } from './events-registers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegister } from './entities/event-register.entity';
import { User } from '../../../../../users/entities/user.entity';
import { EventPricing } from '../pricings/entities/event-pricing.entity';
import { Event } from '../../entities/event.entity';
import { PaymentsModule } from '../../../../../payments/payments.module';
import { Transaction } from '../../../../../transactions/entities/transaction.entity';
import { TransactionsModule } from '../../../../../transactions/transactions.module';
import { EmailModule } from '../../../../../../common/utils/email/email.module';
import { InvoicesModule } from '../../../../../invoices/invoices.module';
import { File } from '../../../../../files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRegister, User, EventPricing, Event, Transaction, File]),
    PaymentsModule,
    TransactionsModule,
    EmailModule,
    InvoicesModule,
  ],
  controllers: [EventsRegistersController],
  providers: [EventsRegistersService],
})
export class EventsRegistersModule {}
