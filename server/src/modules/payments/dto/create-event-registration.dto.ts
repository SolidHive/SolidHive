import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantDto {
  @ApiProperty({
    example: 'Jean',
    description: 'Prénom du participant',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  firstName: string;

  @ApiProperty({
    example: 'Dupont',
    description: 'Nom du participant',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  lastName: string;

  @ApiProperty({
    example: 'jean.dupont@example.com',
    description: 'Email du participant',
  })
  @IsEmail({}, { message: "L'email n'est pas valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: '+33 6 12 34 56 78',
    description: 'Téléphone du participant (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  phone?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID du tarif sélectionné pour ce participant',
  })
  @IsUUID('4', { message: "L'ID du tarif doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID du tarif est requis" })
  pricingId: string;
}

export class ContactInfoDto {
  @ApiProperty({
    example: 'Marie',
    description: 'Prénom du contact',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  firstName: string;

  @ApiProperty({
    example: 'Martin',
    description: 'Nom du contact',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  lastName: string;

  @ApiProperty({
    example: 'marie.martin@example.com',
    description: 'Email du contact',
  })
  @IsEmail({}, { message: "L'email n'est pas valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: '+33 6 98 76 54 32',
    description: 'Téléphone du contact',
  })
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  phone: string;

  @ApiProperty({
    example: '10 rue de la République',
    description: 'Adresse du contact',
  })
  @IsString({ message: "L'adresse doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'adresse est requise" })
  @MinLength(5, { message: "L'adresse doit contenir au moins 5 caractères" })
  address: string;

  @ApiProperty({
    example: '75001',
    description: 'Code postal du contact',
  })
  @IsString({ message: 'Le code postal doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code postal est requis' })
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir 5 chiffres' })
  postcode: string;

  @ApiProperty({
    example: 'Paris',
    description: 'Ville du contact',
  })
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La ville est requise' })
  @MinLength(2, { message: 'La ville doit contenir au moins 2 caractères' })
  city: string;
}

export class CreateEventRegistrationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: "ID de l'événement",
  })
  @IsUUID('4', { message: "L'ID de l'événement doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID de l'événement est requis" })
  eventId: string;

  @ApiProperty({
    type: [ParticipantDto],
    description: 'Liste des participants',
  })
  @IsArray({ message: 'Les participants doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @IsNotEmpty({ message: 'Au moins un participant est requis' })
  participants: ParticipantDto[];

  @ApiProperty({
    type: ContactInfoDto,
    description: 'Informations de contact pour la facturation',
  })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsNotEmpty({ message: 'Les informations de contact sont requises' })
  contact: ContactInfoDto;
}
