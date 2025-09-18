import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Favorite {
  @ApiProperty({
    example: 'Association',
    description:
      "Type de l'élément favori (e.g., 'Association', 'Announcement')",
  })
  @PrimaryColumn()
  relatedTo: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'élément favori (UUID)",
  })
  @PrimaryColumn()
  relatedBy: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant de l'utilisateur (UUID)",
  })
  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: User;
}
