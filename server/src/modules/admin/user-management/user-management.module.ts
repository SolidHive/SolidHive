import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { EmailModule } from '../../../common/utils/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), EmailModule],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
