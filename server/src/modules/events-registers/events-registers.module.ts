import { Module } from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { EventsRegistersController } from './events-registers.controller';

@Module({
  controllers: [EventsRegistersController],
  providers: [EventsRegistersService],
})
export class EventsRegistersModule {}
