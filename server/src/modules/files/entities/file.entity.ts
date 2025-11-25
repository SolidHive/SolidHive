import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/modules/users/entities/role.entity';
import { AssociationRole } from 'src/modules/associations/modules/roles/entities/association-role.entity';

@Entity()
@Unique(['relatedTo', 'relatedBy', 'index', 'purpose'])
export class File {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Nom du fichier stocké',
  })
  @PrimaryColumn()
  filename: string;

  @ApiProperty({
    example: 'Association',
    description: "Type de l'élément lié au fichier (e.g., 'Association', 'Announcement')",
  })
  @Column()
  relatedTo: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément lié au fichier (UUID)",
  })
  @Column()
  relatedBy: string;

  @ApiProperty({
    example: 'profile_picture',
    description: 'But du fichier (e.g., profile_picture, document, logo, background, etc.)',
  })
  @Column()
  purpose: string;

  @ApiProperty({
    example: 0,
    description: "Index du fichier parmi les fichiers liés à l'élément",
  })
  @Column({ default: 0 })
  index: number;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur (UUID)",
  })
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: 'nom_du_fichier.png',
    description: 'Nom du fichier original',
  })
  @Column()
  oldFilename: string;

  @ApiProperty({
    example: 'image/png',
    description: 'Type MIME du fichier',
  })
  @Column()
  mimetype: string;

  @ApiProperty({
    example: 'png',
    description: "Extension du fichier (e.g., 'png', 'jpg')",
  })
  @Column()
  extension: string;

  @ApiProperty({
    example: 204800,
    description: 'Taille du fichier en octets',
  })
  @Column()
  size: number;

  @ApiProperty({
    example: ['ADMIN', 'MODERATOR'],
    description: 'Rôles système autorisés à accéder au fichier',
    isArray: true,
  })
  @ManyToMany(() => Role)
  @JoinTable({ name: 'file_system_roles' })
  allowedSystemRoles: Role[];

  @ApiProperty({
    description: "Rôles d'association autorisés à accéder au fichier",
    isArray: true,
  })
  @ManyToMany(() => AssociationRole)
  @JoinTable({ name: 'file_association_roles' })
  allowedAssociationRoles: AssociationRole[];

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    example: { description: 'Photo de profil' },
    description: 'Informations additionnelles sur le fichier au format JSON',
  })
  @Column('simple-json', { nullable: true })
  additional?: object;
}
