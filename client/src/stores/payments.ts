import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Association } from '@/interfaces/association.interface';
import Database from '@/utils/database.utils';

export interface DonationData {
  amount: number;
  associationId: string;
  fundraisingId?: string;
  message?: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export const usePaymentsStore = defineStore('payments', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Créer une session de don Stripe
  const createDonationSession = async (
    donationData: DonationData
  ): Promise<StripeCheckoutSession> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await Database.create('payments/donate', donationData);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du don';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Vérifier si une association peut recevoir des dons
  const canAssociationReceiveDonations = (association: Association): boolean => {
    return !!(association.stripeAccountId && association.canReceiveDonations);
  };

  // Obtenir le statut Stripe d'une association
  const getAssociationStripeStatus = (association: Association) => {
    if (!association.stripeAccountId) {
      return { status: 'not_configured', message: 'Compte Stripe non configuré' };
    }

    if (!association.canReceiveDonations) {
      return { status: 'pending_setup', message: 'Configuration en cours' };
    }

    return { status: 'ready', message: 'Prêt à recevoir des dons' };
  };

  return {
    isLoading,
    error,
    createDonationSession,
    canAssociationReceiveDonations,
    getAssociationStripeStatus,
  };
});
