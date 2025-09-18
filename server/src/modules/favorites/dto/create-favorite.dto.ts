import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Categories } from '../../../common/enums/categories';

export class CreateFavoriteDto {
  @ApiProperty({
    example: 'Association',
    description:
      "Type de l'élément favori (e.g., 'Association', 'Announcement')",
  })
  @IsEnum(Categories, {
    message: "Le type de l'élément favori doit être valide",
  })
  @IsNotEmpty({ message: "Le type de l'élément favori est requis" })
  relatedTo: Categories;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      "Identifiant de l'élément favori (UUID de l'association, de l'annonce, etc.)",
  })
  @IsUUID('4', {
    message: "L'identifiant du type d'élément doit être un UUID valide",
  })
  @IsNotEmpty({ message: "L'identifiant de l'élément favori est requis" })
  relatedBy: string;
}
