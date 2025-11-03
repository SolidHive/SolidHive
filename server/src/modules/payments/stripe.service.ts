import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-10-29.clover',
    });
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
    // En mode mock, on considère que tous les comptes sont valides
    // pour éviter les expirations de comptes mock
    const isMockMode = process.env.USE_STRIPE_MOCK === 'true';
    if (isMockMode) {
      console.log(`[MOCK] Compte Stripe ${accountId} considéré comme valide`);
      return true;
    }

    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      // Vérifier que le compte existe et peut recevoir des paiements
      return account.details_submitted && account.charges_enabled;
    } catch (error: any) {
      // Si le compte n'existe pas (en mode production)
      if (error.type === 'StripePermissionError' && error.code === 'account_invalid') {
        console.warn(`Le compte Stripe ${accountId} n'existe plus ou l'accès a été révoqué`);
        return false;
      }
      if (error.type === 'StripeInvalidRequestError' && error.rawType === 'invalid_request_error') {
        console.warn(`Le compte Stripe ${accountId} n'existe pas ou est invalide`);
        return false;
      }
      console.error('Erreur lors de la vérification du compte Stripe:', error);
      return false;
    }
  }

  /**
   * Supprimer un compte de test
   */
  async deleteAccount(accountId: string) {
    return await this.stripe.accounts.del(accountId);
  }
}
