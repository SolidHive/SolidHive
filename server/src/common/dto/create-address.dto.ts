// dto/address.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rue de Rivoli' })
  @IsString()
  @Length(1, 100)
  street: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ example: 'Île-de-France' })
  @IsString()
  state: string;

  @ApiProperty({ example: '75001' })
  @IsString()
  postcode: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  country: string;

  @ApiProperty({ example: '32a' })
  @IsOptional()
  @IsString()
  housenumber?: string;
}
