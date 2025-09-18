import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEventRegisterDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: "ID du tarif de l'événement",
  })
  @IsUUID('4', {
    message: "L'ID du tarif de l'événement doit être un UUID valide",
  })
  @IsNotEmpty({ message: "L'ID du tarif de l'événement est requis" })
  eventPricingId: string;
}
