import { Module } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { User } from '../users/entities/user.entity';
import { UserAssociation } from '../users-associations/entities/user-association.entity';
import { AssociationRole } from '../associations-roles/entities/association-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Association,
      User,
      UserAssociation,
      AssociationRole,
    ]),
  ],
  controllers: [AssociationsController],
  providers: [AssociationsService],
})
export class AssociationsModule {}
