import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class File {
  @ApiProperty({
    example: 'mon-image',
    description: "Nom du fichier fournie par l'utilisateur",
  })
  @Column({ length: 255 })
  oldFileName: string;

  @ApiProperty({
    example: '4313-3424-zdadzlzal',
    description: 'Nom du fichier stocké sur le serveur',
  })
  @Column({ length: 255 })
  fileName: string;

  @ApiProperty({
    example: 'pdf',
    description: 'Extension du fichier',
  })
  @Column({ length: 10 })
  extension: string;

  @ApiProperty({
    example: 'uploads',
    description: "Chemin d'accès au fichier",
  })
  @Column({ length: 255 })
  path: string;

  get fullPath(): string {
    return `${this.path}/${this.fileName}.${this.extension}`;
  }
}
