import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { User } from '../../common/decorators/user.decorator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

/**
 * Contrôleur pour la gestion des paiements et donations
 */
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('donate')
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une session de don Stripe Checkout' })
  @ApiResponse({
    status: 201,
    description: 'Session de paiement créée avec succès',
    schema: {
      properties: {
        sessionId: { type: 'string', example: 'cs_test_...' },
        url: { type: 'string', example: 'https://checkout.stripe.com/...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données de don invalides' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async createDonation(@Body() createDonationDto: CreateDonationDto, @User('id') userId: string) {
    return await this.paymentsService.createDonationSession(createDonationDto, userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: "Récupérer les détails d'une session Stripe Checkout" })
  @ApiResponse({ status: 200, description: 'Détails de la session récupérés avec succès' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.paymentsService.getSession(sessionId);
  }
}
