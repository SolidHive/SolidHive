import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStripeAccountDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: "ID de l'association pour laquelle créer le compte Stripe",
  })
  @IsString()
  @IsNotEmpty()
  associationId: string;
}
