import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateFundraisingDto {
  @ApiProperty({ example: 'Aide pour les enfants', description: 'Titre' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @Length(3, 100, {
    message: 'Le titre doit contenir entre 3 et 100 caractères',
  })
  title: string;

  @ApiProperty({
    example: 'Collecte de fonds pour aider les enfants défavorisés.',
    description: 'Description',
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  @Length(5, 2000, {
    message: 'La description doit contenir entre 5 et 2000 caractères',
  })
  description?: string;

  @ApiProperty({ example: 1000, description: 'Montant actuel' })
  @IsNotEmpty({ message: 'Le montant actuel est requis' })
  @IsNumber({}, { message: 'Le montant actuel doit être un nombre' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 5000, description: 'Montant souhaité' })
  @IsNotEmpty({ message: 'Le montant souhaité est requis' })
  @IsNumber({}, { message: 'Le montant souhaité doit être un nombre' })
  @Type(() => Number)
  wantedAmount: number;

  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: 'Date de début de la collecte',
  })
  @IsNotEmpty({ message: 'La date de début est requise' })
  @IsDate({ message: 'La date de début doit être une date' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2023-04-15T12:00:00Z',
    description: 'Date de fin de la collecte',
  })
  @IsOptional()
  @IsDate({ message: 'La date de fin doit être une date' })
  @Type(() => Date)
  endDate?: Date;
}
