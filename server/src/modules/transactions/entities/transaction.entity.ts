import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../../common/embeddeds/file.embedded';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  })
  @Column({ length: 25 })
  category: string;

  @Column(() => File)
  invoice: File;
}
