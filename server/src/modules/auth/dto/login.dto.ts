import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'contact@entreprise.com',
    description: "Adresse email professionnelle de l'utilisateur",
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      "Mot de passe de l'utilisateur (min 10 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 symbole)",
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
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
