import { Module } from '@nestjs/common';
import { AssociationsRolesService } from './associations-roles.service';
import { AssociationsRolesController } from './associations-roles.controller';

@Module({
  controllers: [AssociationsRolesController],
  providers: [AssociationsRolesService],
})
export class AssociationsRolesModule {}
