import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Event } from '../../../modules/events/entities/event.entity';
import { User } from '../../../../../modules/users/entities/user.entity';
import { Association } from 'src/modules/associations/entities/association.entity';
import { AssociationRole } from '../../roles/entities/association-role.entity';
import { Fundraising } from '../../fundraisings/entities/fundraising.entity';
import { AssociationAnnouncement } from '../../announcements/entities/association-announcement.entity';
import { Status } from '../../../../../common/enums/status';

@Entity()
@Unique(['userId', 'associationId'])
export class UserAssociation {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryColumn({ type: 'uuid', generated: 'uuid' })
  id: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur (UUID)",
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    type: User,
    description: "Utilisateur lié à l'association",
  })
  @ManyToOne(() => User, (user) => user.associations)
  user: User;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'association (UUID)",
  })
  @Column({ type: 'uuid' })
  associationId: string;

  @ApiProperty({
    type: Association,
    description: "Association liée à l'utilisateur",
  })
  @ManyToOne(() => Association, (association) => association.users)
  @JoinColumn({ name: 'associationId' })
  association: Association;

  @ApiProperty({
    type: AssociationRole,
    description: "Rôle de l'utilisateur dans cette association",
  })
  @ManyToOne(() => AssociationRole, (role) => role.users)
  role: AssociationRole;

  @ApiProperty({
    type: [Fundraising],
    description: "Collectes de fonds créées par l'utilisateur dans cette association",
  })
  @OneToMany(() => Fundraising, (fundraising) => fundraising.createdBy)
  fundraisings: Fundraising[];

  @ApiProperty({
    type: [Event],
    description: "Événements créés par l'utilisateur dans cette association",
  })
  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @ApiProperty({
    type: [AssociationAnnouncement],
    description: "Annonces créées par l'utilisateur dans cette association",
  })
  @OneToMany(() => AssociationAnnouncement, (announcement) => announcement.createdBy)
  announcements: AssociationAnnouncement[];

  @ApiProperty({
    type: [AssociationRole],
    description: 'Rôles créés par l’utilisateur dans cette association',
  })
  @OneToMany(() => AssociationRole, (role) => role.createdBy)
  roles: AssociationRole[];

  @ApiProperty({
    enum: Status,
    example: 'accepted',
    description:
      "Statut de l'utilisateur dans cette association, qu'il pourra accepter ou refuser.",
  })
  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Date de création de la relation',
  })
  @CreateDateColumn()
  createdAt: Date;
}
