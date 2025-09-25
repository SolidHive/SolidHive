import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserAssociation } from '../users/entities/user-association.entity';
import { EventsPricingsModule } from './modules/pricings/events-pricings.module';
import { EventsRegistersModule } from './modules/registers/events-registers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, UserAssociation]),
    EventsPricingsModule,
    EventsRegistersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
