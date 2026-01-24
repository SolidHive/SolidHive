import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Association } from '../associations/entities/association.entity';
import { EmailModule } from '../../common/utils/email/email.module';
import { AssociationsModule } from '../associations/associations.module';
import { PermissionAccessModule } from './permissions-access/permission-access.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Association]),
    EmailModule,
    AssociationsModule,
    PermissionAccessModule,
    StatisticsModule,
    UserManagementModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
