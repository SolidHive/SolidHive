import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: "S'inscrire à la newsletter" })
  @ApiResponse({ status: 201, description: 'Inscription réussie' })
  async subscribe(@Body() dto: CreateNewsletterSubscriberDto) {
    return await this.newsletterService.subscribe(dto.email);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Se désinscrire de la newsletter' })
  @ApiResponse({ status: 200, description: 'Désinscription réussie' })
  async unsubscribe(@Body() dto: CreateNewsletterSubscriberDto) {
    await this.newsletterService.unsubscribe(dto.email);
    return { message: 'Désinscription effectuée' };
  }
}
