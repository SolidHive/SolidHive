import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserAssociationDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant du rôle dans l'association (UUID)",
  })
  @IsUUID('4', {
    message: "L'identifiant du rôle doit être un UUID valide",
  })
  @IsNotEmpty({ message: "L'identifiant du rôle est requis" })
  roleId: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur dans l'association (UUID)",
  })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide" })
  @IsNotEmpty({ message: "L'adresse e-mail est requise" })
  email: string;
}
