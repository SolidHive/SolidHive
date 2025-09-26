import { Timestamps } from 'src/common/embeddeds/timestamps.embedded';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['relatedTo', 'relatedBy', 'index'])
export class File {
  @ApiProperty({
    example: 'Association',
    description:
      "Type de l'élément lié au fichier (e.g., 'Association', 'Announcement')",
  })
  @PrimaryColumn()
  relatedTo: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément lié au fichier (UUID)",
  })
  @PrimaryColumn()
  relatedBy: string;

  @ApiProperty({
    example: 0,
    description: "Index du fichier parmi les fichiers liés à l'élément",
  })
  @PrimaryColumn({ default: 0 })
  index: number;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur (UUID)",
  })
  @PrimaryColumn()
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
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Nom du fichier stocké',
  })
  @Column()
  filename: string;

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
    example: false,
    description: 'Indique si le fichier est privé',
  })
  @Column({ default: true })
  isPrivate: boolean;

  @Column(() => Timestamps)
  timestamps: Timestamps;

  @ApiProperty({
    example: { description: 'Photo de profil' },
    description: 'Informations additionnelles sur le fichier au format JSON',
  })
  @Column('simple-json', { nullable: true })
  additional?: object;

  fullFilename(): string {
    return `${this.filename}.${this.extension}`;
  }
}
