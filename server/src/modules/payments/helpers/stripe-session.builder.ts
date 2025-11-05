import Stripe from 'stripe';
import { PaymentCalculationHelper } from './payment-calculation.helper';

interface SessionLineItem {
  name: string;
  description: string;
  amount: number;
}

interface SessionMetadata {
  associationId: string;
  fundraisingId?: string;
  userId?: string;
  associationAmount: number;
  solidHiveAmount: number;
  solidHivePercentage?: number;
  totalAmount: number;
  message?: string;
}

interface SessionUrls {
  successUrl: string;
  cancelUrl: string;
}

interface TransferConfig {
  stripeAccountId: string;
  associationAmount: number;
  supportSolidHive: boolean;
  solidHiveAmount: number;
}

/**
 * Builder pour créer des sessions Stripe Checkout de manière fluide et lisible
 */
export class StripeSessionBuilder {
  private lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  private metadata: Record<string, string> = {};
  private urls: SessionUrls | null = null;
  private transferConfig: TransferConfig | null = null;
  private isMockMode = false;

  /**
   * Définir le mode mock
   */
  setMockMode(isMockMode: boolean): this {
    this.isMockMode = isMockMode;
    return this;
  }

  /**
   * Ajouter un line item à la session
   */
  addLineItem(item: SessionLineItem): this {
    this.lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: PaymentCalculationHelper.toStripeAmount(item.amount),
      },
      quantity: 1,
    });
    return this;
  }

  /**
   * Ajouter le line item pour le don à l'association
   */
  addAssociationDonation(associationName: string, amount: number, message?: string): this {
    return this.addLineItem({
      name: `Don à ${associationName}`,
      description: message || `Soutien aux actions de ${associationName}`,
      amount,
    });
  }

  /**
   * Ajouter le line item pour le don à SolidHive
   */
  addSolidHiveDonation(amount: number): this {
    if (amount > 0) {
      return this.addLineItem({
        name: 'Don à SolidHive',
        description: 'Soutien à la plateforme SolidHive',
        amount,
      });
    }
    return this;
  }

  /**
   * Définir les métadonnées de la session
   */
  setMetadata(metadata: SessionMetadata): this {
    this.metadata = {
      associationId: metadata.associationId,
      fundraisingId: metadata.fundraisingId || '',
      userId: metadata.userId || '',
      associationAmount: metadata.associationAmount.toString(),
      solidHiveAmount: metadata.solidHiveAmount.toString(),
      solidHivePercentage: metadata.solidHivePercentage?.toString() || '',
      totalAmount: metadata.totalAmount.toString(),
      message: metadata.message || '',
    };
    return this;
  }

  /**
   * Définir les URLs de redirection
   */
  setUrls(urls: SessionUrls): this {
    this.urls = urls;
    return this;
  }

  /**
   * Configurer les transferts Stripe Connect
   */
  setTransferConfig(config: TransferConfig): this {
    this.transferConfig = config;
    return this;
  }

  /**
   * Construire la configuration de la session Stripe
   */
  build(): Stripe.Checkout.SessionCreateParams {
    if (!this.urls) {
      throw new Error('URLs de redirection non définies');
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: this.lineItems,
      mode: 'payment',
      success_url: this.urls.successUrl,
      cancel_url: this.urls.cancelUrl,
      metadata: this.metadata,
    };

    // Ajouter la configuration des transferts uniquement en mode production
    if (!this.isMockMode && this.transferConfig) {
      sessionConfig.payment_intent_data = this.buildPaymentIntentData(this.transferConfig);
    }

    return sessionConfig;
  }

  /**
   * Construire la configuration du PaymentIntent pour les transferts
   */
  private buildPaymentIntentData(
    config: TransferConfig
  ): Stripe.Checkout.SessionCreateParams.PaymentIntentData {
    const baseConfig: Stripe.Checkout.SessionCreateParams.PaymentIntentData = {
      transfer_data: {
        destination: config.stripeAccountId,
      },
    };

    // Si don à SolidHive, configurer les transferts multiples
    if (config.supportSolidHive && config.solidHiveAmount > 0) {
      baseConfig.transfer_data!.amount = PaymentCalculationHelper.toStripeAmount(
        config.associationAmount
      );
      baseConfig.on_behalf_of = config.stripeAccountId;
      baseConfig.transfer_group = `donation_${Date.now()}`;
    }

    return baseConfig;
  }
}
