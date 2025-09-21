import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAssociationAnnouncementDto {
  @ApiProperty({
    example: 'Nouvelle fonctionnalité disponible',
    description: "Titre de l'annonce",
  })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: "Le titre de l'annonce est requis" })
  title: string;

  @ApiProperty({
    example: 'Une description de la nouvelle fonctionnalité.',
    description: "Contenu de l'annonce",
    required: false,
  })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: true,
    description: "Statut de l'annonce (active ou inactive)",
  })
  @IsNotEmpty({ message: "Le statut de l'annonce est requis" })
  @IsBoolean({ message: "Le statut de l'annonce doit être un booléen" })
  isActive: boolean;

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
