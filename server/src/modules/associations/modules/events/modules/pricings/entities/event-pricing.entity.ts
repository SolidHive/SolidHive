import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../../entities/event.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventRegister } from '../../registers/entities/event-register.entity';

@Entity()
export class EventPricing {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Ticket premium',
    description: 'Nom du tarif',
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: 'Accès à tous les événements premium',
    description: 'Description du tarif',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: 50.0,
    description: 'Prix du tarif en euros',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    example: 100,
    description: 'Nombre maximum de places disponibles pour ce tarif',
  })
  @Column({ type: 'int', nullable: true })
  maxCapacity?: number;

  @ApiProperty({
    type: Event,
    description: 'Événement associé à ce tarif',
  })
  @ManyToOne(() => Event, (event) => event.pricings)
  event: Event;

  @ApiProperty({
    type: () => [EventRegister],
    description: 'Inscriptions associées à ce tarif',
  })
  @OneToMany(() => EventRegister, (eventRegister) => eventRegister.eventPricing)
  registers: EventRegister[];
}
