import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Liste des noms de rôles à assigner',
    example: ['USER', 'ADMIN'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Prénom', example: 'Jean', required: false })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({ description: 'Nom', example: 'Dupont', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Téléphone', example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Statut de vérification du compte', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
