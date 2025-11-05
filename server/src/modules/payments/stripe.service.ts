import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Service de bas niveau pour les interactions avec l'API Stripe
 */
@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly isMockMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-10-29.clover',
    });
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
  }

  /**
   * Créer un compte Stripe Connect Express pour une association
   */
  async createExpressAccount(email: string, associationName: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'non_profit',
      metadata: {
        association_name: associationName,
      },
    });

    return account;
  }

  /**
   * Créer un lien d'onboarding pour l'association
   */
  async createAccountLink(accountId: string) {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/association/stripe/refresh`,
      return_url: `${this.configService.get('FRONTEND_URL')}/association/stripe/success`,
      type: 'account_onboarding',
    });

    return accountLink;
  }

  /**
   * Récupérer les détails d'un compte
   */
  async getAccount(accountId: string) {
    return await this.stripe.accounts.retrieve(accountId);
  }

  /**
   * Vérifier si un compte Stripe peut recevoir des paiements
   */
  async canAccountReceivePayments(accountId: string): Promise<boolean> {
    // En mode mock, tous les comptes sont considérés comme valides
    if (this.isMockMode) {
      this.logger.debug(`[MOCK] Compte Stripe ${accountId} considéré comme valide`);
      return true;
    }

    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      const canReceive = account.details_submitted && account.charges_enabled;

      this.logger.log(
        `Vérification du compte ${accountId}: ${canReceive ? 'prêt' : 'non prêt'} ` +
          `(details_submitted: ${account.details_submitted}, charges_enabled: ${account.charges_enabled})`
      );

      return canReceive;
    } catch (error: any) {
      this.handleAccountError(accountId, error);
      return false;
    }
  }

  /**
   * Gérer les erreurs liées aux comptes Stripe
   */
  private handleAccountError(accountId: string, error: any): void {
    if (error.type === 'StripePermissionError' && error.code === 'account_invalid') {
      this.logger.warn(`Le compte Stripe ${accountId} n'existe plus ou l'accès a été révoqué`);
    } else if (
      error.type === 'StripeInvalidRequestError' &&
      error.rawType === 'invalid_request_error'
    ) {
      this.logger.warn(`Le compte Stripe ${accountId} n'existe pas ou est invalide`);
    } else {
      this.logger.error(
        `Erreur lors de la vérification du compte Stripe ${accountId}:`,
        error.message
      );
    }
  }

  /**
   * Supprimer un compte de test (utiliser avec précaution)
   */
  async deleteAccount(accountId: string): Promise<Stripe.DeletedAccount> {
    this.logger.warn(`Suppression du compte Stripe ${accountId}`);
    return await this.stripe.accounts.del(accountId);
  }
}
