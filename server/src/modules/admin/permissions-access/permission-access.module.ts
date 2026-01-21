import { Module } from '@nestjs/common';
import { PermissionAccessService } from './permission-access.service';
import { PermissionAccessController } from './permission-access.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { PermissionAccess } from './entities/permission-access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PermissionAccess])],
  controllers: [PermissionAccessController],
  providers: [PermissionAccessService],
})
export class PermissionAccessModule {}
