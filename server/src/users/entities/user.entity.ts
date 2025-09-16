import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

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

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Date de création',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Date de dernière mise à jour',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: [Role],
    description: "Rôles de l'utilisateur",
  })
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
