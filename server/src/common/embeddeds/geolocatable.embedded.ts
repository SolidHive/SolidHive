import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from './address.embedded';

export class Geolocatable {
  @Column(() => Address)
  address: Address;

  @ApiProperty({ example: 48.8566, description: 'Latitude de l adresse' })
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @ApiProperty({ example: 2.3522, description: 'Longitude de l adresse' })
  @Column({ type: 'float', nullable: true })
  longitude?: number;
}
