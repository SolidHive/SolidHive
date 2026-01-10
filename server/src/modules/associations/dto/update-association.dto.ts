import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateAssociationDto } from './create-association.dto';

export class UpdateAssociationDto extends PartialType(
  OmitType(CreateAssociationDto, ['siret'] as const)
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutText?: string;
}
