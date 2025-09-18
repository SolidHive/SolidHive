import { Module } from '@nestjs/common';
import { EventsPricingsService } from './events-pricings.service';
import { EventsPricingsController } from './events-pricings.controller';

@Module({
  controllers: [EventsPricingsController],
  providers: [EventsPricingsService],
})
export class EventsPricingsModule {}
