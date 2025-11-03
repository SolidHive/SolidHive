<template>
  <!-- Overlay -->
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click="$emit('update:open', false)"
  >
    <!-- Modal -->
    <div
      class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl"
      @click.stop
    >
      <!-- Header -->
      <div class="border-b p-6">
        <div class="mb-2 flex items-center gap-3">
          <svg class="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          <h2 class="text-xl font-bold">Faire un don à {{ association?.name }}</h2>
        </div>
        <p class="text-sm text-gray-600">
          Votre don sera directement versé à l'association. SolidHive prélève 5% de frais de
          plateforme.
        </p>
      </div>

      <!-- Content -->
      <div class="space-y-6 p-6">
        <!-- Authentification requise -->
        <div v-if="!isAuthenticated" class="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div class="mb-2 flex items-center gap-2">
            <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <h3 class="font-medium text-blue-800">Connexion requise</h3>
          </div>
          <p class="text-sm text-blue-700">
            Vous devez être connecté pour faire un don. Veuillez vous connecter ou créer un compte.
          </p>
          <div class="mt-3 flex gap-2">
            <router-link
              to="/auth/login"
              class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              @click="$emit('update:open', false)"
            >
              Se connecter
            </router-link>
            <router-link
              to="/auth/register"
              class="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
              @click="$emit('update:open', false)"
            >
              S'inscrire
            </router-link>
          </div>
        </div>

        <!-- Statut Stripe -->
        <div
          v-else-if="!canReceiveDonations"
          class="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
        >
          <div class="mb-2 flex items-center gap-2">
            <svg class="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
            <h3 class="font-medium text-yellow-800">Configuration Stripe requise</h3>
          </div>
          <p class="text-sm text-yellow-700">
            Cette association doit d'abord créer un compte Stripe Connect pour recevoir des dons.
            Contactez l'administrateur de l'association pour configurer les paiements.
          </p>
        </div>

        <!-- Formulaire -->
        <form
          v-if="isAuthenticated && canReceiveDonations"
          class="space-y-4"
          @submit.prevent="handleDonate"
        >
          <!-- Montant -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Montant du don (€)</label>
            <input
              v-model.number="donationData.amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="10.00"
              class="focus:ring-accent w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              :disabled="isLoading"
              required
            />
            <p class="mt-1 text-sm text-gray-500">
              100% de votre don est versé directement à l'association
            </p>
          </div>

          <!-- Message optionnel -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Message (optionnel)</label>
            <textarea
              v-model="donationData.message"
              placeholder="Un petit mot d'encouragement..."
              class="focus:ring-accent w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              :disabled="isLoading"
              rows="3"
            />
          </div>

          <!-- Récapitulatif -->
          <div class="rounded-lg bg-gray-50 p-4">
            <h4 class="mb-3 font-medium">Récapitulatif</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Votre don :</span>
                <span>{{ donationData.amount.toFixed(2) }}€</span>
              </div>
              <div class="flex justify-between font-medium text-green-600">
                <span>Reçu par l'association :</span>
                <span>{{ donationData.amount.toFixed(2) }}€</span>
              </div>
              <p class="mt-2 text-xs text-gray-500">
                100% de votre don est versé directement à l'association
              </p>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div
        v-if="isAuthenticated && canReceiveDonations"
        class="flex gap-3 rounded-b-lg border-t bg-gray-50 p-6"
      >
        <button
          type="button"
          class="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          :disabled="isLoading"
          @click="$emit('update:open', false)"
        >
          Annuler
        </button>
        <button
          :disabled="!canDonate || isLoading"
          class="bg-accent hover:bg-accent/90 focus:ring-accent flex-1 rounded-md px-4 py-2 text-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleDonate"
        >
          <svg
            v-if="isLoading"
            class="mr-2 -ml-1 inline h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isLoading ? 'Traitement...' : 'Faire un don' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { usePaymentsStore } from '@/stores/payments';
  import { useAuthStore } from '@/stores/auth';
  import type { Association } from '@/interfaces/association.interface';

  interface Props {
    open: boolean;
    association: Association | null;
  }

  const props = defineProps<Props>();
  defineEmits<{
    'update:open': [value: boolean];
  }>();

  const paymentsStore = usePaymentsStore();
  const authStore = useAuthStore();

  // État local
  const donationData = ref({
    amount: 10,
    associationId: '',
    message: '',
  });

  // Calculs
  const canReceiveDonations = computed(() =>
    paymentsStore.canAssociationReceiveDonations(props.association!)
  );

  const isAuthenticated = computed(() => authStore.isAuthenticated());

  const canDonate = computed(
    () => donationData.value.amount >= 1 && props.association?.id && isAuthenticated.value
  );

  const isLoading = computed(() => paymentsStore.isLoading);

  // Actions
  const handleDonate = async () => {
    if (!props.association || !canDonate.value) return;

    try {
      const sessionData = {
        ...donationData.value,
        associationId: props.association.id,
      };

      const session = await paymentsStore.createDonationSession(sessionData);

      // Rediriger vers Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Erreur lors de la création du don:', error);
      // TODO: Afficher une notification d'erreur
    }
  };

  // Reset quand la modal s'ouvre
  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        donationData.value = {
          amount: 10,
          associationId: props.association?.id || '',
          message: '',
        };
      }
    }
  );
</script>
