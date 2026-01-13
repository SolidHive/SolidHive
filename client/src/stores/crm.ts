import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Database from '../utils/database.utils';
import type { AxiosError } from 'axios';
import { useAuthStore } from './auth';
import type { Member } from '@/interfaces/member.interface';

export const useCrmStore = defineStore('crm', () => {
  const currentAssociationId = ref<string | null>(null);
  const currentRoute = ref<string | null>(null);
  const associationPremiumUntil = ref<string | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const member = ref<Member | null>(null);

  const isInCrm = computed(() => !!currentAssociationId.value);

  function setCurrentRoute(route: string) {
    currentRoute.value = route;
  }

  function setCurrentAssociation(associationId: string | null) {
    currentAssociationId.value = associationId;
  }

  async function hasAccessToAssociation(associationId: string): Promise<boolean> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated()) {
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await Database.getAll(`users/me/association/${associationId}`);
      const hasAccess = result && result.status === 'accepted';
      if (hasAccess) {
        member.value = result;
        associationPremiumUntil.value = result.association?.paymentServiceValidUntil || null;
      }
      return hasAccess;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value =
        axiosError.response?.data?.message || "Erreur lors de la vérification de l'accès";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function getMember(): Member {
    if (!member.value) {
      throw new Error('No member available');
    }
    return member.value;
  }

  function reset() {
    currentAssociationId.value = null;
    currentRoute.value = null;
    error.value = null;
    isLoading.value = false;
    member.value = null;
    associationPremiumUntil.value = null;
  }

  return {
    getMember,
    currentAssociationId,
    currentRoute,
    error,
    isLoading,
    associationPremiumUntil,

    isInCrm,

    setCurrentRoute,
    setCurrentAssociation,
    hasAccessToAssociation,
    reset,
  };
});
