import { ApiProperty } from '@nestjs/swagger';
import { Permissions } from '../../../common/enums/permissions';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAssociationRoleDto {
  @ApiProperty({ example: 'Gestionnaire', description: 'Nom du rôle' })
  @IsString({ message: 'Le nom du rôle doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom du rôle est requis' })
  @Length(3, 12, {
    message: 'Le nom du rôle doit contenir entre 3 et 12 caractères',
  })
  name: string;

  @ApiProperty({
    example: "Rôle de gestionnaire d'association",
    description: 'Description du rôle',
  })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  @Length(5, 100, {
    message: 'La description doit contenir entre 5 et 100 caractères',
  })
  description?: string;

  @ApiProperty({
    example: [Permissions.MANAGE_ASSOCIATION, Permissions.MANAGE_USERS],
    description: 'Liste des permissions associées au rôle',
  })
  @IsNotEmpty({ message: 'Les permissions sont requises' })
  @IsEnum(Permissions, {
    each: true,
    message: 'Chaque permission doit être une permission valide',
  })
  permissions: Permissions[];

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: "Identifiant unique (UUID) de l'association",
  })
  @IsString({
    message:
      "L'identifiant de l'association doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "L'identifiant de l'association est requis" })
  associationId: string;
}
