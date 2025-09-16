import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  Matches,
  Length,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Length(1, 50, { message: 'Le nom doit contenir entre 1 et 50 caractères' })
  name: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @Length(1, 50, {
    message: 'Le prénom doit contenir entre 1 et 50 caractères',
  })
  firstname: string;

  @ApiProperty({
    example: 'contact@entreprise.com',
    description: "Email de l'utilisateur",
  })
  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Mot de passe (min 10 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 symbole)',
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

  @ApiProperty({
    example: '0612345678',
    description: 'Numéro de téléphone (10 chiffres)',
  })
  @IsOptional()
  @IsNumberString(
    {},
    { message: 'Le numéro de téléphone doit contenir uniquement des chiffres' },
  )
  @Length(10, 10, {
    message: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
  })
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Format de numéro de téléphone français invalide',
  })
  phone?: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'Numéro SIRET (14 chiffres)',
  })
  @IsNotEmpty({ message: 'Le numéro SIRET est requis' })
  @IsNumberString(
    {},
    { message: 'Le SIRET doit contenir uniquement des chiffres' },
  )
  @Length(14, 14, { message: 'Le SIRET doit contenir exactement 14 chiffres' })
  siret: string;
}
