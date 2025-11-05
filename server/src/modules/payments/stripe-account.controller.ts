import { Body, Controller, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeAccountService } from './stripe-account.service';
import { CreateStripeAccountDto } from './dto/create-stripe-account.dto';

/**
 * Contrôleur dédié à la gestion des comptes Stripe Connect des associations
 */
@ApiTags('stripe-accounts')
@Controller('stripe-accounts')
export class StripeAccountController {
  constructor(private readonly stripeAccountService: StripeAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un compte Stripe Connect pour une association' })
  @ApiResponse({ status: 201, description: 'Compte Stripe créé avec succès' })
  async createStripeAccount(@Body() createStripeAccountDto: CreateStripeAccountDto) {
    return await this.stripeAccountService.createAccountForAssociation(
      createStripeAccountDto.associationId
    );
  }

  @Put(':associationId/check-status')
  @ApiOperation({
    summary: 'Vérifier et mettre à jour le statut de réception des dons pour une association',
  })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  async checkStripeAccountStatus(@Param('associationId') associationId: string) {
    return await this.stripeAccountService.checkAndUpdateAccountStatus(associationId);
  }
}
