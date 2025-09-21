import { Module } from '@nestjs/common';
import { EventsPricingsService } from './events-pricings.service';
import { EventsPricingsController } from './events-pricings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { EventPricing } from './entities/event-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventPricing, Event])],
  controllers: [EventsPricingsController],
  providers: [EventsPricingsService],
})
export class EventsPricingsModule {}
