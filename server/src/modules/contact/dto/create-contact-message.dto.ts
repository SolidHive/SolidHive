import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ description: "Prénom de l'expéditeur", example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "Nom de l'expéditeur", example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: "Adresse e-mail de l'expéditeur",
    example: 'jean.dupont@exemple.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Sujet du message', example: 'support' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  @MinLength(10)
  message: string;
}
