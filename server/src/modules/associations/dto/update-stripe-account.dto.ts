import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateStripeAccountDto {
  @ApiProperty({
    example: 'acct_1234567890',
    description: "ID du compte Stripe Connect de l'association",
  })
  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @ApiProperty({
    example: true,
    description: "Si l'association peut recevoir des dons via Stripe",
  })
  @IsBoolean()
  @IsOptional()
  canReceiveDonations?: boolean;
}
