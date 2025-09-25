import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    example: 'Nouvelle fonctionnalité disponible',
    description: "Titre de l'annonce",
  })
  @IsNotEmpty({ message: "Le titre de l'annonce est requis" })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @Length(3, 100, {
    message: 'Le titre doit contenir entre 3 et 100 caractères',
  })
  title: string;

  @ApiProperty({
    example: 'Une description de la nouvelle fonctionnalité.',
    description: "Contenu de l'annonce",
  })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @IsOptional()
  @Length(5, 500, {
    message: 'Le contenu doit contenir entre 5 et 500 caractères',
  })
  content?: string;

  @ApiProperty({
    example: true,
    description: "Statut de l'annonce (active ou inactive)",
  })
  @IsNotEmpty({ message: "Le statut de l'annonce est requis" })
  @IsBoolean({ message: "Le statut de l'annonce doit être un booléen" })
  isActive: boolean;
}
