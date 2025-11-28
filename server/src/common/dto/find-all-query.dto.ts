import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class FindOptionsDto {
  @ApiPropertyOptional({
    type: 'object',
    properties: {
      where: {
        type: 'object',
        properties: {},
      },
    },
  })
  @IsOptional()
  @Transform(({ value }): { [key: string]: any } =>
    typeof value === 'string'
      ? (JSON.parse(value) as Record<string, any>)
      : (value as Record<string, any>)
  )
  where?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Ordre de tri (ex: {"createdAt":"DESC"})',
    type: 'object',
    properties: {
      order: {
        type: 'object',
        properties: {},
      },
    },
  })
  @IsOptional()
  @Transform(({ value }): Record<string, 'ASC' | 'DESC'> => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  order?: Record<string, 'ASC' | 'DESC'>;

  @ApiPropertyOptional({
    description: 'Nombre de résultats à ignorer (offset)',
    type: Number,
  })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({
    description: 'Nombre de résultats à retourner (limit)',
    type: Number,
  })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({
    description: 'Filtre par nom',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri par nom',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderBy?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Relations à charger (ex: ["association", "fundraising"])',
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }): string[] => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  relations?: string[];
}
