import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../../../../common/dto/create-address.dto';

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
    example: '2023-03-15T12:00:00Z',
    description: "Date de début de l'événement",
  })
  @IsNotEmpty({ message: "La date de début de l'événement est requise" })
  @IsDate({ message: "La date de début de l'événement doit être une date" })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2023-03-15T14:00:00Z',
    description: "Date de fin de l'événement",
  })
  @IsDate({ message: "La date de fin de l'événement doit être une date" })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    type: () => CreateAddressDto,
    description: "Adresse de l'événement",
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'association de l'utilisateur (UUID)",
  })
  @IsNotEmpty({
    message: "L'identifiant de l'association de l'utilisateur est requis",
  })
  @IsUUID('4', {
    message:
      "L'identifiant de l'association de l'utilisateur doit être un UUID valide",
  })
  userAssociationId: string;
}
