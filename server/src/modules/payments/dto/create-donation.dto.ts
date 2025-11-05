import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  IsOptional,
  IsBoolean,
  Max,
} from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({
    example: 25.5,
    description: 'Montant du don en euros',
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "ID de l'association bénéficiaire",
  })
  @IsUUID()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'ID du fundraising (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  fundraisingId?: string;

  @ApiProperty({
    example: "Don pour soutenir les actions de l'association",
    description: 'Message optionnel du donateur',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: true,
    description: 'Inclure un don à SolidHive',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  supportSolidHive?: boolean;

  @ApiProperty({
    example: 5.0,
    description: 'Pourcentage du don à SolidHive (optionnel, défaut 5%)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  solidHivePercentage?: number;
}
