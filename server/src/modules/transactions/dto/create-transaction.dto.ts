import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Length } from 'class-validator';
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
  relatedTo: Categories;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément lié à la transaction (UUID)",
  })
  @IsNotEmpty({ message: "L'identifiant de l'élément lié est requis" })
  @IsUUID('4', {
    message: "L'identifiant de l'élément lié doit être un UUID valide",
  })
  relatedBy: string;

  @ApiProperty({
    example: '/invoices/12345.pdf',
    description: "Chemin d'accès au fichier de la facture",
  })
  @IsString({
    message: 'Le chemin de la facture doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le chemin de la facture est requis' })
  @Length(5, 255, {
    message: 'Le chemin de la facture doit contenir entre 5 et 255 caractères',
  })
  invoicePath: string;
}
