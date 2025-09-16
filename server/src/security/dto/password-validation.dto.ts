import { ApiProperty } from '@nestjs/swagger';
import { Matches, MinLength } from 'class-validator';

export class PasswordValidationDto {
  @ApiProperty({
    description: 'Mot de passe à valider',
    minLength: 10,
  })
  @MinLength(10, {
    message: 'Le mot de passe doit contenir au moins 10 caractères',
  })
  @Matches(/[a-z]/, {
    message: 'Le mot de passe doit contenir au moins une lettre minuscule',
  })
  @Matches(/[A-Z]/, {
    message: 'Le mot de passe doit contenir au moins une lettre majuscule',
  })
  @Matches(/[0-9]/, {
    message: 'Le mot de passe doit contenir au moins un chiffre',
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Le mot de passe doit contenir au moins un symbole',
  })
  password: string;
}
