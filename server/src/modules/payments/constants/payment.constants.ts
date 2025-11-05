/**
 * Constantes pour la configuration des paiements
 */
export const PAYMENT_CONSTANTS = {
  /**
   * Montant minimum pour un don (en euros)
   */
  MIN_DONATION_AMOUNT: 1,

  /**
   * Devise utilisée pour les paiements
   */
  CURRENCY: 'eur',

  /**
   * Version de l'API Stripe utilisée
   */
  STRIPE_API_VERSION: '2025-10-29.clover',

  /**
   * Facteur de conversion euros -> centimes
   */
  CENTS_CONVERSION_FACTOR: 100,
} as const;

/**
 * Messages d'erreur standardisés
 */
export const PAYMENT_ERROR_MESSAGES = {
  ASSOCIATION_NOT_FOUND: 'Association non trouvée',
  STRIPE_ACCOUNT_NOT_CONFIGURED: (associationName: string) =>
    `L'association "${associationName}" n'a pas encore configuré son compte Stripe Connect`,
  STRIPE_ACCOUNT_NOT_READY: (associationName: string) =>
    `Le compte Stripe de l'association "${associationName}" n'est pas encore prêt`,
  INVALID_AMOUNT: 'Le montant du don doit être supérieur ou égal à 1€',
  NO_STRIPE_ACCOUNT: "Cette association n'a pas de compte Stripe",
} as const;

/**
 * Messages de succès standardisés
 */
export const PAYMENT_SUCCESS_MESSAGES = {
  ACCOUNT_CREATED:
    "Compte Stripe Connect créé. Complétez l'onboarding pour commencer à recevoir des dons.",
  ACCOUNT_REPLACED:
    "Compte Stripe Connect remplacé. Complétez l'onboarding pour commencer à recevoir des dons.",
  ACCOUNT_READY: "L'association peut maintenant recevoir des dons.",
  ONBOARDING_PENDING: "L'onboarding Stripe n'est pas encore terminé.",
} as const;
