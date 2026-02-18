import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreatePremiumSubscriptionDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "ID de l'association",
  })
  @IsUUID()
  @IsNotEmpty()
  associationId: string;

  @ApiProperty({
    example: 1,
    description: "Nombre de mois d'abonnement (1 mois = 15€)",
    minimum: 1,
    maximum: 24,
  })
  @IsNumber()
  @Min(1)
  @Max(24)
  months: number;
}
