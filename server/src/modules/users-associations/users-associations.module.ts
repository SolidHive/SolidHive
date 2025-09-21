import { Module } from '@nestjs/common';
import { UsersAssociationsService } from './users-associations.service';
import { UsersAssociationsController } from './users-associations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAssociation } from './entities/user-association.entity';
import { User } from '../users/entities/user.entity';
import { Association } from '../associations/entities/association.entity';
import { AssociationRole } from '../associations-roles/entities/association-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAssociation,
      User,
      Association,
      AssociationRole,
    ]),
  ],
  controllers: [UsersAssociationsController],
  providers: [UsersAssociationsService],
})
export class UsersAssociationsModule {}
