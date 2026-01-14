import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, IsNumberString, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Dupont', description: 'Nom de famille' })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Le nom doit contenir entre 1 et 50 caractères' })
  name?: string;

  @ApiPropertyOptional({ example: 'Jean', description: 'Prénom' })
  @IsOptional()
  @IsString()
  @Length(1, 50, {
    message: 'Le prénom doit contenir entre 1 et 50 caractères',
  })
  firstname?: string;

  @ApiPropertyOptional({
    example: 'contact@entreprise.com',
    description: "Email de l'utilisateur",
  })
  @IsOptional()
  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  email?: string;

  @ApiPropertyOptional({
    example: '0612345678',
    description: 'Numéro de téléphone (10 chiffres)',
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Le numéro de téléphone doit contenir uniquement des chiffres' })
  @Length(10, 10, {
    message: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
  })
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Format de numéro de téléphone français invalide',
  })
  phone?: string;
}
