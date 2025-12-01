import { ApiProperty } from '@nestjs/swagger';
import { AssociationAnnouncement } from '../modules/announcements/entities/association-announcement.entity';
import { AssociationRole } from '../modules/roles/entities/association-role.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserAssociation } from '../modules/users/entities/user-association.entity';
import { Fundraising } from '../modules/fundraisings/entities/fundraising.entity';
import { Timestamps } from '../../../common/embeddeds/timestamps.embedded';
import { User } from '../../../modules/users/entities/user.entity';
import { Event } from '../modules/events/entities/event.entity';
import { Status } from '../../../common/enums/status';

@Entity()
export class Association {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Association Solidaire',
    description: "Nom de l'association",
  })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    example: 'Une association dédiée à la solidarité locale.',
    description: "Description de l'association",
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: 'Texte détaillé sur l\'association pour la page "À propos".',
    description: "Texte détaillé sur l'association",
  })
  @Column({ type: 'text', nullable: true })
  aboutText?: string;

  @ApiProperty({
    example: '#000000',
    description: "Couleur primaire de l'association",
  })
  @Column({ length: 7, nullable: true })
  primaryColor?: string;

  @ApiProperty({
    example: 'contact@example.com',
    description: "Contact de l'association",
  })
  @Column({ length: 100, nullable: true })
  contact: string;

  @ApiProperty({
    example: '12345678901234',
    description: "Numéro SIRET de l'association (14 chiffres)",
    required: true,
  })
  @Column({ length: 14, unique: true })
  siret: string;

  @ApiProperty({
    type: [AssociationAnnouncement],
    description: "Annonces de l'association",
  })
  @OneToMany(() => AssociationAnnouncement, (announcement) => announcement.association)
  announcements: AssociationAnnouncement[];

  @ApiProperty({
    type: [AssociationRole],
    description: "Rôles de l'association",
  })
  @OneToMany(() => AssociationRole, (role) => role.association)
  roles: AssociationRole[];

  @ApiProperty({
    type: [Association],
    description: "Associations de l'utilisateur",
  })
  @OneToMany(() => UserAssociation, (userAssociation) => userAssociation.association)
  users: UserAssociation[];

  @ApiProperty({
    type: [Fundraising],
    description: "Collectes de l'association",
  })
  @OneToMany(() => Fundraising, (fundraising) => fundraising.association)
  fundraisings: Fundraising[];

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    type: User,
    description: "Administrateur ayant créé l'association",
  })
  @ManyToOne(() => User, (user) => user.createdAssociations)
  createdBy: User;

  @ApiProperty({
    type: [Event],
    description: "Événements organisés par l'association",
  })
  @OneToMany(() => Event, (event) => event.association)
  events: Event[];

  @ApiProperty({
    enum: Status,
    example: 'accepted',
    description: "Statut de l'association, géré par un administrateur ou un gestionnaire.",
  })
  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @ApiProperty({
    example:
      "Besoin de plus d'informations sur les activités de l'association, venant de l'administrateur ou d'un gestionnaire.",
    description: "Demande d'informations supplémentaires si le statut est en 'additional_request'",
  })
  @Column({ type: 'text', nullable: true })
  additionalRequest?: string;

  // Informations de paiement Stripe Connect
  @ApiProperty({
    example: 'acct_1234567890',
    description: "ID du compte Stripe Connect de l'association",
  })
  @Column({ length: 100, nullable: true })
  stripeAccountId?: string;

  @ApiProperty({
    example: true,
    description: "Si l'association peut recevoir des dons via Stripe",
  })
  @Column({ default: false })
  canReceiveDonations: boolean;
}
