import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SecurityActionType } from '../enums/security-action-type.enum';

export class SecurityActionRequestDto {
  @ApiProperty({
    enum: SecurityActionType,
    description: "Type d'action de sécurité à effectuer",
  })
  @IsEnum(SecurityActionType)
  actionType: SecurityActionType;

  @ApiProperty({
    description: 'Token de sécurité pour vérification ou réinitialisation',
    required: false,
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiProperty({
    description: 'Email pour demander une réinitialisation de mot de passe',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nouveau mot de passe pour finaliser la réinitialisation',
    required: false,
  })
  @IsString()
  @IsOptional()
  newPassword?: string;
}

export interface SecurityTokenPayload {
  userId: string;
  actionType: SecurityActionType;
}
