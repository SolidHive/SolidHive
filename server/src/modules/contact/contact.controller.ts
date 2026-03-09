import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message de contact' })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  async send(@Body() dto: CreateContactMessageDto): Promise<void> {
    return await this.contactService.send(dto);
  }
}
