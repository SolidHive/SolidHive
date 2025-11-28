import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import {
  InvalidDonationAmountException,
  StripeAccountNotReadyException,
} from '../exceptions/payment.exceptions';
import { PaymentCalculationHelper } from '../helpers/payment-calculation.helper';

/**
 * Service de validation pour les paiements
 */
@Injectable()
export class PaymentValidationService {
  private readonly logger = new Logger(PaymentValidationService.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Valider qu'un montant est correct
   */
  validateAmount(amount: number): void {
    if (!PaymentCalculationHelper.validateAmount(amount)) {
      throw new InvalidDonationAmountException();
    }
  }

  /**
   * Valider qu'un compte Stripe peut recevoir des paiements
   */
  async validateStripeAccount(
    stripeAccountId: string,
    associationName: string,
    isMockMode: boolean
  ): Promise<void> {
    if (isMockMode) {
      this.logger.debug(`Mode mock: compte Stripe ${stripeAccountId} considéré comme valide`);
      return;
    }

    const canReceivePayments = await this.stripeService.canAccountReceivePayments(stripeAccountId);
    if (!canReceivePayments) {
      throw new StripeAccountNotReadyException(associationName);
    }
  }
}
