import { Module } from '@nestjs/common';
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { AssociationsAnnouncementsController } from './associations-announcements.controller';

@Module({
  controllers: [AssociationsAnnouncementsController],
  providers: [AssociationsAnnouncementsService],
})
export class AssociationsAnnouncementsModule {}
