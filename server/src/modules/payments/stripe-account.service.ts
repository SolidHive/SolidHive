import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { AssociationsService } from '../associations/associations.service';
import { UpdateStripeAccountDto } from '../associations/dto/update-stripe-account.dto';
import { AssociationNotFoundException } from './exceptions/payment.exceptions';

export interface CreateAccountResult {
  accountId: string;
  onboardingUrl: string;
  message: string;
}

export interface CheckStatusResult {
  canReceiveDonations: boolean;
  message: string;
}

/**
 * Service dédié à la gestion des comptes Stripe Connect pour les associations
 */
@Injectable()
export class StripeAccountService {
  private readonly logger = new Logger(StripeAccountService.name);
  private readonly isMockMode: boolean;

  constructor(
    private readonly stripeService: StripeService,
    private readonly associationsService: AssociationsService,
    private readonly configService: ConfigService
  ) {
    this.isMockMode = this.configService.get<string>('USE_STRIPE_MOCK') === 'true';
  }

  /**
   * Créer un compte Stripe Connect pour une association
   */
  async createAccountForAssociation(associationId: string): Promise<CreateAccountResult> {
    // Récupérer l'association
    const association = await this.associationsService.findOne(associationId);
    if (!association) {
      throw new AssociationNotFoundException(associationId);
    }

    // Logger le remplacement si un compte existe déjà
    if (association.stripeAccountId) {
      this.logger.warn(
        `Remplacement du compte Stripe existant ${association.stripeAccountId} pour l'association ${association.name}`
      );
    }

    // Créer le compte Stripe Express
    const account = await this.stripeService.createExpressAccount(
      association.contact,
      association.name
    );

    this.logger.log(`Compte Stripe créé: ${account.id} pour l'association ${association.name}`);

    // Créer le lien d'onboarding
    const accountLink = await this.stripeService.createAccountLink(account.id);

    // Mettre à jour l'association avec le nouveau compte Stripe
    const updateDto: UpdateStripeAccountDto = {
      stripeAccountId: account.id,
      canReceiveDonations: this.isMockMode, // true en mode mock, false en production
    };
    await this.associationsService.updateStripeAccount(associationId, updateDto);

    // Vérifier que la mise à jour a bien été effectuée
    const updatedAssociation = await this.associationsService.findOne(associationId);
    this.logger.log(
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

  /**
   * Vérifier et mettre à jour le statut de réception des dons pour une association
   */
  async checkAndUpdateAccountStatus(associationId: string): Promise<CheckStatusResult> {
    // Récupérer l'association
    const association = await this.associationsService.findOne(associationId);
    if (!association) {
      throw new AssociationNotFoundException(associationId);
    }

    if (!association.stripeAccountId) {
      throw new Error("Cette association n'a pas de compte Stripe");
    }

    // Vérifier si le compte peut recevoir des paiements
    const canReceivePayments = await this.stripeService.canAccountReceivePayments(
      association.stripeAccountId
    );

    this.logger.log(
      `Vérification du compte Stripe ${association.stripeAccountId}: ${canReceivePayments ? 'prêt' : 'non prêt'}`
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

  /**
   * Vérifier si une association peut recevoir des dons
   */
  async canAssociationReceiveDonations(associationId: string): Promise<boolean> {
    const association = await this.associationsService.findOne(associationId);
    if (!association) {
      return false;
    }

    if (!association.stripeAccountId) {
      return false;
    }

    // En mode mock, tous les comptes peuvent recevoir des dons
    if (this.isMockMode) {
      return true;
    }

    // En production, vérifier le statut réel du compte
    return await this.stripeService.canAccountReceivePayments(association.stripeAccountId);
  }
}
