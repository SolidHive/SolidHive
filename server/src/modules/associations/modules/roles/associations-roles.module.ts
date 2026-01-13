import { Module } from '@nestjs/common';
import { AssociationsRolesService } from './associations-roles.service';
import { AssociationsRolesController } from './associations-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationRole } from './entities/association-role.entity';
import { UserAssociation } from '../users/entities/user-association.entity';
import { PermissionAccess } from 'src/modules/permissions-access/entities/permission-access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssociationRole, UserAssociation, PermissionAccess])],
  controllers: [AssociationsRolesController],
  providers: [AssociationsRolesService],
})
export class AssociationsRolesModule {}
