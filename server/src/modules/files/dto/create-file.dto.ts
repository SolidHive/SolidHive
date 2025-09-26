import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
    description:
      "Type de l'élément lié au fichier (e.g., 'Association', 'Announcement')",
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
    example: true,
    description: 'Indique si le fichier est privé ou non',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => ((value as string) === 'true' ? true : false))
  isPrivate?: boolean;

  @ApiProperty({
    format: 'binary',
    type: 'string',
    description: 'Fichier à uploader',
  })
  file: any;
}
