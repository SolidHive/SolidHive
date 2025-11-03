import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsOptional } from 'class-validator';

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
}
