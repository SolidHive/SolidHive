import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { CreatePremiumSubscriptionDto } from './dto/create-premium-subscription.dto';
import { User } from '../../common/decorators/user.decorator';

/**
 * Contrôleur pour la gestion des paiements et donations
 */
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('donate')
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

  @Post('event-registration')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer une session de paiement pour l'inscription à un événement" })
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
  @ApiResponse({ status: 400, description: "Données d'inscription invalides" })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé' })
  async createEventRegistration(
    @Body() createEventRegistrationDto: CreateEventRegistrationDto,
    @User('id') userId: string
  ) {
    if (!userId) {
      throw new Error("Authentification requise pour s'inscrire à un événement");
    }

    return await this.paymentsService.createEventRegistrationSession(
      createEventRegistrationDto,
      userId
    );
  }

  @Post('event-registration/:sessionId/finalize')
  @ApiOperation({ summary: "Finaliser l'inscription à un événement après paiement réussi" })
  @ApiResponse({ status: 200, description: 'Inscription finalisée avec succès' })
  @ApiResponse({ status: 400, description: 'Paiement non complété ou données invalides' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async finalizeEventRegistration(@Param('sessionId') sessionId: string) {
    await this.paymentsService.finalizeEventRegistration(sessionId);
    return { message: 'Inscription finalisée avec succès' };
  }

  @Post('donate/:sessionId/finalize')
  @ApiOperation({ summary: 'Finaliser le don après paiement réussi' })
  @ApiResponse({ status: 200, description: 'Don finalisé avec succès' })
  @ApiResponse({ status: 400, description: 'Paiement non complété ou données invalides' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async finalizeDonation(@Param('sessionId') sessionId: string) {
    await this.paymentsService.finalizeDonation(sessionId);
    return { message: 'Don finalisé avec succès' };
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: "Récupérer les détails d'une session Stripe Checkout" })
  @ApiResponse({ status: 200, description: 'Détails de la session récupérés avec succès' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async getSession(@Param('sessionId') sessionId: string) {
    return await this.paymentsService.getSession(sessionId);
  }

  @Post('premium')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une session de paiement pour un abonnement premium' })
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
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async createPremiumSubscription(
    @Body() createPremiumDto: CreatePremiumSubscriptionDto,
    @User('id') userId: string
  ) {
    return await this.paymentsService.createPremiumSession(createPremiumDto, userId);
  }

  @Post('premium/:sessionId/finalize')
  @ApiOperation({ summary: "Finaliser l'abonnement premium après paiement réussi" })
  @ApiResponse({ status: 200, description: 'Abonnement finalisé avec succès' })
  @ApiResponse({ status: 400, description: 'Paiement non complété ou données invalides' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async finalizePremium(@Param('sessionId') sessionId: string) {
    await this.paymentsService.finalizePremium(sessionId);
    return { message: 'Abonnement premium finalisé avec succès' };
  }
}
