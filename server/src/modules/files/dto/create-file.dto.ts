import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    example: 0,
    description: "Index du fichier parmi les fichiers liés à l'élément",
    type: 'integer',
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value as string, 10))
  index: number;

  @ApiProperty({
    example: 'Association',
    description: "Type de l'élément lié au fichier (e.g., 'Association', 'Announcement')",
  })
  @IsNotEmpty()
  @IsString()
  relatedTo: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément lié au fichier (UUID)",
  })
  @IsNotEmpty()
  @IsUUID()
  relatedBy: string;

  @ApiProperty({
    format: 'binary',
    type: 'string',
    description: 'Fichier à uploader',
  })
  file: any;

  @ApiProperty({
    example: 'profile_picture',
    description: 'But du fichier (e.g., profile_picture, document, logo, background, etc.)',
  })
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @ApiProperty({
    example: [1, 2],
    description: 'IDs des rôles système autorisés à accéder au fichier',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => Number(id.trim()));
    }
    return value;
  })
  allowedSystemRoles?: number[];

  @ApiPropertyOptional({
    example: ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a12bc34d-56ef-7890-1234-567890abcdef'],
    description: "IDs des rôles d'association autorisés à accéder au fichier",
    type: [String],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  allowedAssociationRoles?: string[];
}
