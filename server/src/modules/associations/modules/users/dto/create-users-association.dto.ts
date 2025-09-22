import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUsersAssociationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: "Identifiant de l'association (UUID)",
  })
  @IsUUID('4', {
    message: "L'identifiant de l'association doit être un UUID valide",
  })
  @IsNotEmpty({ message: "L'identifiant de l'association est requis" })
  associationId: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant du rôle dans l'association (UUID)",
  })
  @IsUUID('4', {
    message: "L'identifiant du rôle doit être un UUID valide",
  })
  @IsNotEmpty({ message: "L'identifiant du rôle est requis" })
  roleId: string;
}
