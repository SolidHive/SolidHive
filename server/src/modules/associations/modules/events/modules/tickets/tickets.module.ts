import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventRegister } from '../registers/entities/event-register.entity';
import { Event } from '../../entities/event.entity';
import { EventPricing } from '../pricings/entities/event-pricing.entity';
import { File } from '../../../../../files/entities/file.entity';
import { Transaction } from '../../../../../transactions/entities/transaction.entity';
import { FilesModule } from '../../../../../files/files.module';
import { EmailModule } from '../../../../../../common/utils/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventRegister, Event, EventPricing, File, Transaction]),
    FilesModule,
    EmailModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
