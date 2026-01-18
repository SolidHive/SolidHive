import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class AssociationContactDto {
  @ApiProperty({ example: 'Dupont', description: 'Nom de l’expéditeur' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caractères' })
  name: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom de l’expéditeur' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @Length(2, 100, { message: 'Le prénom doit contenir entre 2 et 100 caractères' })
  firstname: string;

  @ApiProperty({ example: 'jean.dupont@email.com', description: 'Email de l’expéditeur' })
  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être valide" })
  @Length(5, 100, { message: "L'email doit contenir entre 5 et 100 caractères" })
  email: string;

  @ApiProperty({
    example: '0612345678',
    required: false,
    description: 'Numéro de téléphone (optionnel)',
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le téléphone doit être au format français (ex: 0612345678)',
  })
  phone?: string;

  @ApiProperty({
    example: 'Bonjour, je souhaite avoir des informations...',
    description: 'Message envoyé',
  })
  @IsNotEmpty({ message: 'Le message est requis' })
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  @Length(5, 2000, { message: 'Le message doit contenir entre 5 et 2000 caractères' })
  message: string;
}
