import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { FilesModule } from '../files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Association } from '../associations/entities/association.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { EventPricing } from '../associations/modules/events/modules/pricings/entities/event-pricing.entity';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { File } from '../files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Association,
      Event,
      Fundraising,
      EventPricing,
      EventRegister,
      File,
    ]),
    FilesModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
