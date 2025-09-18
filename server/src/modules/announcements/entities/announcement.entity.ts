import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';

@Entity()
export class Announcement {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Nouvelle fonctionnalité disponible',
    description: "Titre de l'annonce",
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: "Nous sommes ravis d'annoncer une nouvelle fonctionnalité...",
    description: "Contenu de l'annonce",
  })
  @Column({ type: 'text' })
  content: string;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    example: true,
    description: "Indique si l'annonce est active",
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: User,
    description: "Administrateur ayant créé l'annonce",
  })
  @ManyToOne(() => User, (user) => user.announcements)
  createdBy: User;
}
