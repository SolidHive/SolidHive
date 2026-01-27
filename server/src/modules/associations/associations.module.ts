import { Module } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { User } from '../users/entities/user.entity';
import { EventsModule } from './modules/events/events.module';
import { FundraisingsModule } from './modules/fundraisings/fundraisings.module';
import { AssociationsRolesModule } from './modules/roles/associations-roles.module';
import { AssociationsAnnouncementsModule } from './modules/announcements/associations-announcements.module';
import { UsersAssociationsModule } from './modules/users/users-associations.module';
import { UserAssociation } from './modules/users/entities/user-association.entity';
import { PermissionAccessModule } from '../admin/permissions-access/permission-access.module';
import { FilesModule } from '../files/files.module';
import { EmailModule } from '../../common/utils/email/email.module';
import { AssociationStatisticsService } from './modules/statistics/association-statistics.service';
import { AssociationStatisticsController } from './modules/statistics/association-statistics.controller';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Fundraising } from './modules/fundraisings/entities/fundraising.entity';
import { Event } from './modules/events/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Association, User, UserAssociation, Transaction, Fundraising, Event]),
    EventsModule,
    AssociationsAnnouncementsModule,
    FundraisingsModule,
    AssociationsRolesModule,
    UsersAssociationsModule,
    PermissionAccessModule,
    FilesModule,
    EmailModule,
  ],
  controllers: [AssociationsController, AssociationStatisticsController],
  providers: [AssociationsService, AssociationStatisticsService],
  exports: [AssociationsService],
})
export class AssociationsModule {}
