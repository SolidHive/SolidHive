import { Module } from '@nestjs/common';
import { UsersAssociationsService } from './users-associations.service';
import { UsersAssociationsController } from './users-associations.controller';

@Module({
  controllers: [UsersAssociationsController],
  providers: [UsersAssociationsService],
})
export class UsersAssociationsModule {}
