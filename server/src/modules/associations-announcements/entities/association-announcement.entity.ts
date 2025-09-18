import { ApiProperty } from '@nestjs/swagger';
import { Association } from '../../associations/entities/association.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../../common/embeddeds/timestamps.embedded';
import { UserAssociation } from 'src/modules/users-associations/entities/user-association.entity';

@Entity()
export class AssociationAnnouncement {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Nouvelle annonce disponible',
    description: "Titre de l'annonce",
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: "Nous sommes ravis d'annoncer une nouvelle annonce...",
    description: "Contenu de l'annonce",
  })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    example: true,
    description: "Indique si l'annonce est active",
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: UserAssociation,
    description: "Utilisateur ayant créé l'annonce",
  })
  @ManyToOne(
    () => UserAssociation,
    (userAssociation) => userAssociation.announcements,
  )
  createdBy: UserAssociation;

  @ApiProperty({
    type: Association,
    description: "Association liée à l'annonce",
  })
  @ManyToOne(() => Association, (association) => association.announcements)
  association: Association;
}
