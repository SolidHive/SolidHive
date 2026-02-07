import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({
    example: "Je souhaite supprimer mon compte car je ne l'utilise plus.",
    description: 'Raison de la suppression du compte',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La raison ne peut pas dépasser 500 caractères' })
  reason?: string;

  @ApiProperty({
    example: 'motdepasse123',
    description: 'Mot de passe actuel pour confirmation',
    required: true,
  })
  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis' })
  password: string;
}
