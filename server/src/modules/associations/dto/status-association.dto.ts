import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Status } from '../../../common/enums/status';

export class StatusAssociationDto {
  @ApiProperty({
    enum: Status,
    example: 'accepted',
    description: "Statut de l'association",
  })
  @IsEnum(Status, {
    message:
      "Le statut doit être l'un des suivants : accepted, pending, rejected, draft, additional_request",
  })
  status: Status;

  @ApiProperty({
    example:
      "Besoin de plus d'informations sur les activités de l'association, venant de l'administrateur ou d'un gestionnaire.",
  })
  @IsOptional()
  @IsString({
    message: "La demande d'informations supplémentaires doit être une chaîne de caractères",
  })
  @Length(5, 1000, {
    message: "La demande d'informations supplémentaires doit contenir entre 5 et 1000 caractères",
  })
  additionalRequest?: string;
}
