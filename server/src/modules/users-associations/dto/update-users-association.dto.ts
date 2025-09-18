import { PartialType } from '@nestjs/swagger';
import { CreateUsersAssociationDto } from './create-users-association.dto';

export class UpdateUsersAssociationDto extends PartialType(
  CreateUsersAssociationDto,
) {}
