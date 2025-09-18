import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { Association } from 'src/modules/associations/entities/association.entity';
import { UserAssociation } from 'src/modules/users-associations/entities/user-association.entity';
import { Favorite } from 'src/modules/favorites/entities/favorite.entity';
import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';

@Entity()
export class User {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Doe', description: 'Nom de famille' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ example: 'John', description: 'Prénom' })
  @Column({ length: 50 })
  firstname: string;

  @ApiProperty({ example: 'contact@entreprise.com', description: 'User email' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ example: '0612345678', description: 'Numéro de téléphone' })
  @Column({ length: 10, nullable: true })
  phone: string;

  @Column({ length: 255 })
  password: string;

  @Column()
  salt: string;

  @ApiProperty({ example: '12345678901234', description: 'Numéro SIRET' })
  @Column({ length: 14 })
  siret: string;

  @ApiProperty({
    example: false,
    description: 'Statut de vérification du compte',
  })
  @Column({ default: false })
  isVerified: boolean;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    type: [Announcement],
    description: "Annonces créées par l'utilisateur",
  })
  @OneToMany(() => Announcement, (announcement) => announcement.createdBy)
  announcements: Announcement[];

  @ApiProperty({
    type: [Role],
    description: "Rôles de l'utilisateur",
  })
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];

  @ApiProperty({
    type: [Association],
    description: "Associations de l'utilisateur",
  })
  @OneToMany(() => UserAssociation, (userAssociation) => userAssociation.user)
  associations: UserAssociation[];

  @ApiProperty({
    type: [Favorite],
    description: "Favoris de l'utilisateur",
  })
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @ApiProperty({
    type: [Association],
    description: "Associations créées par l'utilisateur",
  })
  @OneToMany(() => Association, (association) => association.createdBy)
  createdAssociations: Association[];
}
