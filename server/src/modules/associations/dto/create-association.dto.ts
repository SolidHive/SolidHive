import { ApiProperty } from '@nestjs/swagger';
import { Image } from '../../../common/embeddeds/image.embedded';
import { Colors } from '../../../common/enums/colors';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAssociationDto {
  @ApiProperty({
    example: 'Mon association',
    description: "Nom de l'association",
  })
  @IsNotEmpty({ message: "Le nom de l'association est requis" })
  @IsString({
    message: "Le nom de l'association doit être une chaîne de caractères",
  })
  @Length(3, 100, {
    message: "Le nom de l'association doit contenir entre 3 et 100 caractères",
  })
  name: string;

  @ApiProperty({
    example: 'Une description de mon association.',
    description: "Description de l'association",
  })
  @IsOptional()
  @IsString({
    message:
      "La description de l'association doit être une chaîne de caractères",
  })
  @Length(5, 1000, {
    message:
      "La description de l'association doit contenir entre 5 et 1000 caractères",
  })
  description?: string;

  @ApiProperty({
    description: "Logo de l'association",
    required: false,
  })
  @IsOptional()
  logo?: Image;

  @ApiProperty({
    description: "Image de fond de l'association",
    required: false,
  })
  @IsOptional()
  background?: Image;

  @ApiProperty({
    example: '#000000',
    description: "Couleur primaire de l'association",
    required: false,
  })
  @IsEnum(Colors, {
    message: 'La couleur primaire doit être une couleur valide',
  })
  @IsOptional()
  primaryColor?: Colors;

  @IsEnum(Colors, {
    message: 'La couleur secondaire doit être une couleur valide',
  })
  @IsOptional()
  secondaryColor?: Colors;

  @ApiProperty({
    example: 'contact@example.com',
    description: "Contact de l'association",
  })
  @IsEmail({}, { message: "L'email de contact doit être valide" })
  @Length(5, 100, {
    message: "L'email de contact doit contenir entre 5 et 100 caractères",
  })
  contact: string;
}
