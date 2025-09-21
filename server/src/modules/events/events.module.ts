import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserAssociation } from '../users-associations/entities/user-association.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, UserAssociation])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
