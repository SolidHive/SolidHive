import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class Address {
  @ApiProperty({ example: 'Rue de Rivoli', description: "Rue de l'adresse" })
  @Column({ length: 100 })
  street: string;

  @ApiProperty({ example: 'Paris', description: "Ville de l'adresse" })
  @Column({ length: 100 })
  city: string;

  @ApiProperty({ example: 'Île-de-France', description: "Région de l'adresse" })
  @Column({ length: 100 })
  state: string;

  @ApiProperty({ example: '75001', description: "Code postal de l'adresse" })
  @Column({ length: 20 })
  postcode: string;

  @ApiProperty({ example: 'France', description: 'Pays' })
  @Column({ length: 100 })
  country: string;

  @ApiProperty({ example: '32a', description: 'Numéro de la maison' })
  @Column({ length: 20, nullable: true })
  housenumber?: string;
}
