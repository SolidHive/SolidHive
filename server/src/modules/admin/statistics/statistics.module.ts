import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from '../../associations/entities/association.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Fundraising } from '../../associations/modules/fundraisings/entities/fundraising.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Association, User, Transaction, Fundraising])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
