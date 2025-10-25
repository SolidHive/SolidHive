import { IsOptional, IsBoolean, IsString, IsDateString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterEventsDto {
  @ApiPropertyOptional({
    description: 'Nombre de résultats à ignorer (offset)',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({
    description: 'Nombre de résultats à retourner (limit)',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;

  @ApiPropertyOptional({
    description: "Rechercher dans le titre de l'événement",
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par événements payants (true) ou gratuits (false)',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par date de début (format ISO)',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par date de fin (format ISO)',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
