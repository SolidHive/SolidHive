import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('donate')
  @ApiOperation({ summary: 'Créer une session de don Stripe' })
  @ApiResponse({ status: 201, description: 'Session de paiement créée' })
  async createDonation(@Body() createDonationDto: CreateDonationDto, @User('id') userId?: string) {
    return this.paymentsService.createDonationSession(createDonationDto, userId);
  }
}
