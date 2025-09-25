import { Module } from '@nestjs/common';
import { FundraisingsService } from './fundraisings.service';
import { FundraisingsController } from './fundraisings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Fundraising } from './entities/fundraising.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fundraising, UserAssociation])],
  controllers: [FundraisingsController],
  providers: [FundraisingsService],
})
export class FundraisingsModule {}
