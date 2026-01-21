import { Module } from '@nestjs/common';
import { EventsPricingsService } from './events-pricings.service';
import { EventsPricingsController } from './events-pricings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../entities/event.entity';
import { EventPricing } from './entities/event-pricing.entity';
import { UserAssociation } from '../../../users/entities/user-association.entity';
import { PermissionAccess } from 'src/modules/admin/permissions-access/entities/permission-access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventPricing, Event, UserAssociation, PermissionAccess])],
  controllers: [EventsPricingsController],
  providers: [EventsPricingsService],
})
export class EventsPricingsModule {}
