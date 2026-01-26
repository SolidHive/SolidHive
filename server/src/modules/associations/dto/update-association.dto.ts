import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateAssociationDto } from './create-association.dto';

export class UpdateAssociationDto extends PartialType(
  OmitType(CreateAssociationDto, ['siret'] as const)
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  aboutText?: string;
}
