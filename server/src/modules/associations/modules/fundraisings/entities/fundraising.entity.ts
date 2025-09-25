import { ApiProperty } from '@nestjs/swagger';
import { Timestamps } from '../../../../../common/embeddeds/timestamps.embedded';
import { Association } from '../../../../../modules/associations/entities/association.entity';
import { UserAssociation } from '../../../modules/users/entities/user-association.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Fundraising {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Aide pour les enfants', description: 'Titre' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: 'Collecte de fonds pour aider les enfants défavorisés.',
    description: 'Description',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 1000, description: 'Montant actuel' })
  @Column({ type: 'float', default: 0 })
  amount: number;

  @ApiProperty({ example: 5000, description: 'Montant souhaité' })
  @Column({ type: 'float', default: 0 })
  wantedAmount: number;

  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: 'Date de début de la collecte',
  })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @ApiProperty({
    example: '2023-04-15T12:00:00Z',
    description: 'Date de fin de la collecte',
  })
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  endDate?: Date;

  @ApiProperty({
    type: UserAssociation,
    description: 'Utilisateur ayant créé la collecte',
  })
  @ManyToOne(() => UserAssociation, (userAssociation) => userAssociation.fundraisings)
  createdBy: UserAssociation;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    type: Association,
    description: 'Association liée à la collecte',
  })
  @ManyToOne(() => Association, (association) => association.fundraisings)
  association: Association;
}
