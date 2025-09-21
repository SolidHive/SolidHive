import { Module } from '@nestjs/common';
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { AssociationsAnnouncementsController } from './associations-announcements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { UserAssociation } from '../users-associations/entities/user-association.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssociationAnnouncement, UserAssociation]),
  ],
  controllers: [AssociationsAnnouncementsController],
  providers: [AssociationsAnnouncementsService],
})
export class AssociationsAnnouncementsModule {}
