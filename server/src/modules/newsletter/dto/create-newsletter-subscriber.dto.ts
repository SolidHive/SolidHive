import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsletterSubscriberDto {
  @ApiProperty({ description: "Adresse e-mail de l'abonné", example: 'user@example.com' })
  @IsEmail()
  email: string;
}
