import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categories } from '../../../common/enums/categories';
import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Transaction {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 49.99,
    description: 'Montant de la transaction',
  })
  @Column({ type: 'float' })
  amount: number;

  @ApiProperty({
    example: 'Fundraising',
    description: 'Catégorie de la transaction (Ex: Fundraising ou Event)',
    enum: Categories,
  })
  @Column({ type: 'enum', enum: Categories })
  relatedTo: Categories;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément lié à la transaction (UUID)",
  })
  @Column()
  relatedBy: string;

  @ApiProperty({
    example: '/invoices/12345.pdf',
    description: "Chemin d'accès au fichier de la facture",
  })
  @Column({ length: 255 })
  invoicePath: string;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({ description: "L'utilisateur qui a effectué la transaction" })
  @ManyToOne(() => User, (user) => user.transactions, { nullable: true })
  user: User | null;
}
