import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { File } from './file.embedded';

export class Image {
  @ApiProperty({
    example: 'Image de démonstration',
    description: "Texte alternatif de l'image",
  })
  @Column({ length: 255, nullable: true })
  alt?: string;

  @ApiProperty({
    example: 'Image de démonstration',
    description: "Titre de l'image",
  })
  @Column({ length: 255, nullable: true })
  title?: string;

  @Column(() => File)
  file: File;
}
