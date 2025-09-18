import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../../../common/embeddeds/address.embedded';
import { Image } from '../../../common/embeddeds/image.embedded';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Beach Cleanup',
    description: "Titre de l'événement",
  })
  @IsString({
    message: "Le titre de l'événement doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "Le titre de l'événement est requis" })
  @Length(3, 100, {
    message: "Le titre de l'événement doit contenir entre 3 et 100 caractères",
  })
  title: string;

  @ApiProperty({
    example: 'Rejoignez-nous pour nettoyer la plage locale.',
    description: "Description de l'événement",
    required: false,
  })
  @IsString({
    message: "La description de l'événement doit être une chaîne de caractères",
  })
  @IsOptional()
  @Length(5, 500, {
    message:
      "La description de l'événement doit contenir entre 5 et 500 caractères",
  })
  description?: string;

  @ApiProperty({
    example: 100,
    description: "Montant de l'événement",
  })
  @IsNotEmpty({ message: "Le montant de l'événement est requis" })
  @IsNumber({}, { message: "Le montant de l'événement doit être un nombre" })
  amount: number;

  @ApiProperty({
    type: Image,
    description: "Image de l'événement",
  })
  image: Image;

  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: "Date de début de l'événement",
  })
  @IsNotEmpty({ message: "La date de début de l'événement est requise" })
  @IsDate({ message: "La date de début de l'événement doit être une date" })
  startDate: Date;

  @ApiProperty({
    example: '2023-03-15T14:00:00Z',
    description: "Date de fin de l'événement",
  })
  @IsDate({ message: "La date de fin de l'événement doit être une date" })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    type: Address,
    description: "Adresse de l'événement",
  })
  address: Address;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: "ID de l'association organisatrice de l'événement",
  })
  @IsUUID('4', { message: "L'ID de l'association doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID de l'association est requis" })
  associationId: string;
}
