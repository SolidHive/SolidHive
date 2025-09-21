import { ApiProperty } from '@nestjs/swagger';
import { Association } from '../../associations/entities/association.entity';
import { Permissions } from '../../../common/enums/permissions';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserAssociation } from 'src/modules/users-associations/entities/user-association.entity';
import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';

@Entity()
@Unique(['name', 'association'])
export class AssociationRole {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Gestionnaire', description: 'Nom du rôle' })
  @Column({ length: 12 })
  name: string;

  @ApiProperty({
    example: "Gestionnaire de l'association",
    description: 'Description du rôle',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    type: UserAssociation,
    description: 'Utilisateur ayant créé le rôle',
  })
  @ManyToOne(
    () => UserAssociation,
    (userAssociation) => userAssociation.roles,
    { nullable: true },
  )
  createdBy: UserAssociation | null;

  @ApiProperty({
    type: Association,
    description: 'Association liée au rôle',
  })
  @ManyToOne(() => Association, (association) => association.roles)
  association: Association;

  @ApiProperty({
    example: [Permissions.MANAGE_ASSOCIATION, Permissions.MANAGE_USERS],
    description: 'Permissions associées au rôle',
    isArray: true,
  })
  @Column({
    type: 'enum',
    array: true,
    enum: Permissions,
    default: [],
  })
  permissions: Permissions[];

  @ApiProperty({
    type: [UserAssociation],
    description: "Utilisateurs ayant ce rôle dans l'association",
  })
  @OneToMany(() => UserAssociation, (userAssociation) => userAssociation.role)
  users: UserAssociation[];
}
