import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateAssociationDto } from './create-association.dto';

export class UpdateAssociationDto extends PartialType(CreateAssociationDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutText?: string;
}
