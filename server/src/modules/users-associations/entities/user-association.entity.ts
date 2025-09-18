import { ApiProperty } from '@nestjs/swagger';
import { AssociationAnnouncement } from '../../../modules/associations-announcements/entities/association-announcement.entity';
import { AssociationRole } from '../../../modules/associations-roles/entities/association-role.entity';
import { Association } from '../../../modules/associations/entities/association.entity';
import { Fundraising } from '../../../modules/fundraisings/entities/fundraising.entity';
import { User } from '../../../modules/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class UserAssociation {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur (UUID)",
  })
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    type: User,
    description: "Utilisateur lié à l'association",
  })
  @ManyToOne(() => User, (user) => user.associations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'association (UUID)",
  })
  @PrimaryColumn({ type: 'uuid' })
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
    description:
      "Collectes de fonds créées par l'utilisateur dans cette association",
  })
  @OneToMany(() => Fundraising, (fundraising) => fundraising.createdBy)
  fundraisings: Fundraising[];

  @ApiProperty({
    type: [AssociationAnnouncement],
    description: "Annonces créées par l'utilisateur dans cette association",
  })
  @OneToMany(
    () => AssociationAnnouncement,
    (announcement) => announcement.createdBy,
  )
  announcements: AssociationAnnouncement[];

  @ApiProperty({
    type: [AssociationRole],
    description: 'Rôles créés par l’utilisateur dans cette association',
  })
  @OneToMany(() => AssociationRole, (role) => role.createdBy)
  roles: AssociationRole[];
}
