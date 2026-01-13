import { ApiProperty } from '@nestjs/swagger';
import { Permissions } from 'src/common/enums/permissions';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PermissionAccess {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identifiant unique (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: Permissions.ANNOUNCEMENTS_CREATE,
    description: 'Permission associée',
  })
  @Column({ type: 'enum', enum: Permissions, unique: true })
  permission: Permissions;

  @ApiProperty({
    example: true,
    description: 'Indique si la permission requiert un abonnement aux fonctionnalités payantes',
  })
  @Column({ default: false })
  requiresSubscription: boolean;
}
