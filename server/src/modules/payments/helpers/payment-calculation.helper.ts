/**
 * Helper pour les calculs liés aux paiements
 */
export class PaymentCalculationHelper {
  /**
   * Convertir un montant en euros vers les centimes (pour Stripe)
   */
  static toStripeAmount(amountInEuros: number): number {
    return Math.round(amountInEuros * 100);
  }

  /**
   * Convertir un montant en centimes vers les euros
   */
  static fromStripeAmount(amountInCents: number): number {
    return amountInCents / 100;
  }

  /**
   * Calculer le montant total d'un don
   */
  static calculateTotalAmount(
    associationAmount: number,
    supportSolidHive: boolean,
    solidHiveAmount?: number
  ): number {
    const solidHiveContribution = supportSolidHive && solidHiveAmount ? solidHiveAmount : 0;
    return associationAmount + solidHiveContribution;
  }

  /**
   * Valider un montant de don
   */
  static validateAmount(amount: number): boolean {
    return amount >= 1 && amount <= 100000 && Number.isFinite(amount);
  }
}
