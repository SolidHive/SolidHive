import { Body, Controller, Post, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';
import { User } from '../../common/decorators/user.decorator';
import { AssociationsService } from '../associations/associations.service';
import { UpdateStripeAccountDto } from '../associations/dto/update-stripe-account.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
    private readonly associationsService: AssociationsService,
    private readonly configService: ConfigService
  ) {}

  @Post('donate')
  @UseGuards(RateLimitGuard, AuthenticatedGuard)
  @ApiOperation({ summary: 'Créer une session de don Stripe' })
  @ApiResponse({ status: 201, description: 'Session de paiement créée' })
  async createDonation(@Body() createDonationDto: CreateDonationDto, @User('id') userId: string) {
    return this.paymentsService.createDonationSession(createDonationDto, userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: "Récupérer les détails d'une session Stripe" })
  @ApiResponse({ status: 200, description: 'Détails de la session' })
  async getSession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.getSession(sessionId);
  }

  // === ROUTES DE TEST POUR STRIPE CONNECT ===

  @Post('stripe-account')
  @ApiOperation({ summary: 'Créer un compte Stripe Connect pour une association' })
  @ApiResponse({ status: 201, description: 'Compte Stripe créé avec succès' })
  async createStripeAccount(@Body() body: CreateStripeAccountDto) {
    // Récupérer l'association
    const association = await this.associationsService.findOne(body.associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    // Si l'association a déjà un compte Stripe, on le remplace
    if (association.stripeAccountId) {
      console.log(
        `Remplacement du compte Stripe existant ${association.stripeAccountId} pour l'association ${association.name}`
      );
    }

    // Créer le compte Stripe Express
    const account = await this.stripeService.createExpressAccount(
      association.contact,
      association.name
    );

    // Créer le lien d'onboarding
    const accountLink = await this.stripeService.createAccountLink(account.id);

    // Mettre à jour l'association avec le compte Stripe
    // En mode développement avec mocks, on peut recevoir des dons immédiatement
    // En production, il faut attendre la fin de l'onboarding
    const isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
    const updateDto: UpdateStripeAccountDto = {
      stripeAccountId: account.id,
      canReceiveDonations: isMockMode, // true en mode mock, false en production
    };
    await this.associationsService.updateStripeAccount(body.associationId, updateDto);

    // Vérifier que la mise à jour a bien été faite
    const updatedAssociation = await this.associationsService.findOne(body.associationId);
    console.log(
      `Association mise à jour - Nouveau compte Stripe: ${updatedAssociation?.stripeAccountId}`
    );

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
      message: association.stripeAccountId
        ? "Compte Stripe Connect remplacé. Complétez l'onboarding pour commencer à recevoir des dons."
        : "Compte Stripe Connect créé. Complétez l'onboarding pour commencer à recevoir des dons.",
    };
  }

  @Put('stripe-account/:associationId/check-status')
  @ApiOperation({
    summary: 'Vérifier et mettre à jour le statut de réception des dons pour une association',
  })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  async checkStripeAccountStatus(@Param('associationId') associationId: string) {
    // Récupérer l'association
    const association = await this.associationsService.findOne(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    if (!association.stripeAccountId) {
      throw new Error("Cette association n'a pas de compte Stripe");
    }

    // Vérifier si le compte peut recevoir des paiements
    const canReceivePayments = await this.stripeService.canAccountReceivePayments(
      association.stripeAccountId
    );

    // Mettre à jour le statut
    const updateDto: UpdateStripeAccountDto = {
      canReceiveDonations: canReceivePayments,
    };
    await this.associationsService.updateStripeAccount(associationId, updateDto);

    return {
      canReceiveDonations: canReceivePayments,
      message: canReceivePayments
        ? "L'association peut maintenant recevoir des dons."
        : "L'onboarding Stripe n'est pas encore terminé.",
    };
  }
}
