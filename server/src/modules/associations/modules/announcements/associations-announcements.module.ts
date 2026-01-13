import { Module } from '@nestjs/common';
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { AssociationsAnnouncementsController } from './associations-announcements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { UserAssociation } from '../users/entities/user-association.entity';
import { File } from '../../../files/entities/file.entity';
import { PermissionAccess } from 'src/modules/permissions-access/entities/permission-access.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssociationAnnouncement, UserAssociation, File, PermissionAccess]),
  ],
  controllers: [AssociationsAnnouncementsController],
  providers: [AssociationsAnnouncementsService],
})
export class AssociationsAnnouncementsModule {}
