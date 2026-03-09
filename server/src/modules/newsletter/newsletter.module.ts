import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { EmailService } from '../../common/utils/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscriber])],
  providers: [NewsletterService, EmailService],
  controllers: [NewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
