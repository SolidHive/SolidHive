import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {
  @ApiProperty({ example: 1, description: 'Identifiant unique' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'USER', description: 'Nom du rôle' })
  @Column({ length: 10, unique: true })
  name: string;

  @ApiProperty({
    example: 'Administrateur du système',
    description: 'Description du rôle',
  })
  @Column({ length: 255, nullable: true })
  description: string;
}
