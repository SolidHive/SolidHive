import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAddressDto } from '../../../../../common/dto/update-address.dto';

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['address']),
) {
  @ApiProperty({ type: () => UpdateAddressDto })
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;
}
