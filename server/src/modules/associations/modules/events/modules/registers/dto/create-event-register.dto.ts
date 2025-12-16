import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @ApiProperty({
    example: 'Doe',
    description: 'Nom du participant (optionnel pour les invités)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  participantLastName?: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom du participant (optionnel pour les invités)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  participantFirstName?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email du participant (optionnel pour les invités)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: "L'email doit être valide" })
  participantEmail?: string;
}
