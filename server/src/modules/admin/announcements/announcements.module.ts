import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Announcement } from './entities/announcement.entity';
import { File } from '../../files/entities/file.entity';
import { FilesModule } from '../../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Announcement, File]), FilesModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
