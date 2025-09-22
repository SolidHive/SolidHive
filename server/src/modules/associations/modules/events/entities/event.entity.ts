import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../../../../../common/embeddeds/address.embedded';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventPricing } from '../modules/pricings/entities/event-pricing.entity';
import { Association } from '../../../../../modules/associations/entities/association.entity';
import { UserAssociation } from '../../../modules/users/entities/user-association.entity';

@Entity()
export class Event {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Beach Cleanup',
    description: "Titre de l'événement",
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: 'Rejoignez-nous pour nettoyer la plage locale.',
    description: "Description de l'événement",
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: 100,
    description: "Montant de l'événement",
  })
  @Column({ type: 'float', default: 0 })
  amount: number;

  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: "Date de début de l'événement",
  })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @ApiProperty({
    example: '2023-03-15T14:00:00Z',
    description: "Date de fin de l'événement",
  })
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  endDate?: Date;

  @Column(() => Address)
  address: Address;

  @OneToMany(() => EventPricing, (pricing) => pricing.event)
  pricings: EventPricing[];

  @ApiProperty({
    type: UserAssociation,
    description: "Utilisateur ayant créé l'événement",
  })
  @ManyToOne(() => UserAssociation, (userAssociation) => userAssociation.events)
  createdBy: UserAssociation;

  @ApiProperty({
    type: Association,
    description: "Association organisatrice de l'événement",
  })
  @ManyToOne(() => Association, (association) => association.events)
  association: Association;
}
