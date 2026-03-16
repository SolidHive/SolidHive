import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

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
  @Length(5, 1000, {
    message: 'La description doit contenir entre 5 et 1000 caractères',
  })
  description?: string;

  @ApiProperty({
    example: 100,
    description: 'Nombre maximum de places disponibles pour ce tarif',
    required: false,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le nombre maximum de places doit être un nombre' })
  @Min(1, { message: 'La capacité maximale doit être supérieure à 0' })
  @IsOptional()
  maxCapacity?: number;

  @ApiProperty({
    example: 50.0,
    description: 'Montant du tarif en euros',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le montant du tarif doit être un nombre' })
  @Min(0, { message: 'Le montant doit être supérieur ou égal à 0' })
  amount: number;
}
