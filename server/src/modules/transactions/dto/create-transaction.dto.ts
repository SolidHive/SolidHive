import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Categories } from '../../../common/enums/categories';

export class CreateTransactionDto {
  @ApiProperty({
    example: 100.5,
    description: 'Montant de la transaction',
  })
  @IsNotEmpty({ message: 'Le montant est requis' })
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  amount: number;

  @ApiProperty({
    example: 'Fundraising',
    description: 'Catégorie de la transaction',
  })
  @IsNotEmpty({ message: 'La catégorie est requise' })
  @IsEnum(Categories, { message: 'La catégorie doit être valide' })
  category: Categories;
}
