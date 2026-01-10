import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '../../../../common/enums/status';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssociationStatusDto {
  @ApiProperty({
    description: "Nouveau statut de l'association",
    enum: Status,
    example: Status.ACCEPTED,
  })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: "Message optionnel pour l'utilisateur",
    required: false,
    example: 'Votre association a été acceptée avec succès.',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
