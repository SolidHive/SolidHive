import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

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
      : (value as Record<string, any>),
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
}
