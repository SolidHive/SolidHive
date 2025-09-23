import { PartialType } from '@nestjs/swagger';
import { CreateAssociationRoleDto } from './create-association-role.dto';

export class UpdateAssociationRoleDto extends PartialType(
  CreateAssociationRoleDto,
) {}
