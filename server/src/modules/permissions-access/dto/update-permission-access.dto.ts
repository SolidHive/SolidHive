import { OmitType } from '@nestjs/swagger';
import { CreatePermissionAccessDto } from './create-permission-access.dto';

export class UpdatePermissionAccessDto extends OmitType(CreatePermissionAccessDto, [
  'permission',
]) {}
