import { BadRequestException, NotFoundException } from '@nestjs/common';

export class AssociationNotFoundException extends NotFoundException {
  constructor(associationId: string) {
    super(`Association with ID ${associationId} not found`);
  }
}

export class StripeAccountNotConfiguredException extends BadRequestException {
  constructor(associationName: string) {
    super(
      `L'association "${associationName}" n'a pas encore configuré son compte Stripe Connect. ` +
        "Elle doit d'abord créer et configurer son compte pour recevoir des dons."
    );
  }
}

export class StripeAccountNotReadyException extends BadRequestException {
  constructor(associationName: string) {
    super(
      `Le compte Stripe de l'association "${associationName}" n'est pas encore prêt à recevoir des paiements. ` +
        "L'association doit compléter la configuration de son compte Stripe Connect."
    );
  }
}

export class InvalidDonationAmountException extends BadRequestException {
  constructor() {
    super('Le montant du don doit être supérieur ou égal à 1€');
  }
}
