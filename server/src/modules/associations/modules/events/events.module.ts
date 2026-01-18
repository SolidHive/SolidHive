import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserAssociation } from '../users/entities/user-association.entity';
import { EventsPricingsModule } from './modules/pricings/events-pricings.module';
import { EventsRegistersModule } from './modules/registers/events-registers.module';
import { File } from '../../../files/entities/file.entity';
import { PermissionAccess } from 'src/modules/permissions-access/entities/permission-access.entity';
import { EventPricing } from './modules/pricings/entities/event-pricing.entity';
import { EventRegister } from './modules/registers/entities/event-register.entity';
import { FilesModule } from '../../../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      UserAssociation,
      File,
      EventPricing,
      PermissionAccess,
      EventRegister,
    ]),
    EventsPricingsModule,
    EventsRegistersModule,
    FilesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
