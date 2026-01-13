import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { Permissions } from 'src/common/enums/permissions';

export class CreatePermissionAccessDto {
  @ApiProperty({
    example: Permissions.ANNOUNCEMENTS_CREATE,
    description: 'Permission associée',
  })
  @IsNotEmpty({ message: 'La permission est requise' })
  @IsEnum(Permissions, { message: 'La permission doit être une valeur valide' })
  permission: Permissions;

  @ApiProperty({
    example: true,
    description: 'Indique si la permission requiert un abonnement aux fonctionnalités payantes',
  })
  @IsBoolean({ message: "Le champ 'requiresSubscription' doit être un booléen" })
  requiresSubscription: boolean;
}
