import { ApiProperty } from '@nestjs/swagger';
import { EventPricing } from '../../../modules/events-pricings/entities/event-pricing.entity';
import { User } from '../../../modules/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['user', 'eventPricing'])
export class EventRegister {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: User,
    description: "Utilisateur inscrit à l'événement",
  })
  @ManyToOne(() => User, (user) => user.eventRegisters, { nullable: true })
  user: User | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: "Date d'inscription à l'événement",
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;

  @ApiProperty({
    type: EventPricing,
    description: "Tarif de l'événement",
  })
  @ManyToOne(() => EventPricing, (eventPricing) => eventPricing.registers)
  eventPricing: EventPricing;
}
