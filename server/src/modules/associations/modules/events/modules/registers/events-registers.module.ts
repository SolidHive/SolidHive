import { Module } from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { EventsRegistersController } from './events-registers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegister } from './entities/event-register.entity';
import { User } from '../../../../../users/entities/user.entity';
import { EventPricing } from '../pricings/entities/event-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventRegister, User, EventPricing])],
  controllers: [EventsRegistersController],
  providers: [EventsRegistersService],
})
export class EventsRegistersModule {}
