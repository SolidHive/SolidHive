import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateEventPricingDto {
  @ApiProperty({
    example: 'Tarif Adhérent',
    description: 'Titre du tarif',
  })
  @IsNotEmpty({ message: 'Le titre du tarif est requis' })
  @IsString({ message: 'Le titre du tarif doit être une chaîne de caractères' })
  @Length(3, 100, {
    message: 'Le titre du tarif doit contenir entre 3 et 100 caractères',
  })
  title: string;

  @ApiProperty({
    example: 'Description du tarif',
    description: 'Description du tarif',
    required: false,
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  @Length(5, 200, {
    message: 'La description doit contenir entre 5 et 200 caractères',
  })
  description?: string;

  @ApiProperty({
    example: 100,
    description: 'Nombre maximum de places disponibles pour ce tarif',
    required: false,
  })
  @IsNumber({}, { message: 'Le nombre maximum de places doit être un nombre' })
  @IsOptional()
  maxCapacity?: number;

  @ApiProperty({
    example: 50.0,
    description: 'Montant du tarif en euros',
  })
  @IsNumber({}, { message: 'Le montant du tarif doit être un nombre' })
  amount: number;
}
