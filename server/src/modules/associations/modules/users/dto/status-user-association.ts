import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from '../../../../../common/enums/status';

export class StatusUserAssociationDto {
  @ApiProperty({
    enum: Status,
    example: 'accepted',
    description: "Statut de l'association",
  })
  @IsEnum(Status, {
    message: "Le statut doit être l'un des suivants : accepted, rejected",
  })
  status: Status;
}
