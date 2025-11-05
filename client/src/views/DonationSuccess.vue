<template>
  <PageContainer>
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
      <div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <!-- Success Icon -->
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <!-- Title -->
        <h1 class="mb-2 text-2xl font-bold text-gray-900">Don effectué avec succès ! 🎉</h1>

        <!-- Subtitle -->
        <p class="mb-8 text-gray-600">
          Merci pour votre générosité. Votre don a été traité et l'association va pouvoir continuer
          ses actions.
        </p>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p class="text-sm text-gray-500">Récupération des détails du paiement...</p>
        </div>

        <!-- Donation Details -->
        <div v-else-if="donationDetails" class="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 text-left">
          <div class="flex justify-between">
            <span class="text-gray-600">Montant du don :</span>
            <span class="font-semibold">{{ donationDetails.amount }}€</span>
          </div>
          <div class="flex justify-between border-t pt-2">
            <span class="font-medium text-gray-600">Reçu par l'association :</span>
            <span class="font-semibold text-green-600">{{ donationDetails.amount }}€</span>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            100% de votre don est versé directement à l'association
          </p>
          <div v-if="donationDetails.message" class="mt-4">
            <span class="text-gray-600">Votre message :</span>
            <p class="mt-1 text-sm text-gray-700 italic">{{ donationDetails.message }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <router-link
            :to="`/association/${donationDetails?.associationId || ''}`"
            class="block w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            Retour à l'association
          </router-link>

          <router-link
            to="/associations"
            class="block w-full rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Voir d'autres associations
          </router-link>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import api from '@/utils/api.utils';

  interface DonationDetails {
    amount: number;
    message?: string;
    associationId: string;
  }

  const route = useRoute();
  const loading = ref(true);
  const error = ref('');
  const donationDetails = ref<DonationDetails | null>(null);

  onMounted(async () => {
    const sessionId = route.query.session_id as string;

    if (!sessionId) {
      error.value = 'Session ID manquant';
      loading.value = false;
      return;
    }

    try {
      // Récupérer les détails de la session Stripe
      const response = await api.get(`/payments/session/${sessionId}`);
      const session = response.data;

      // Extraire les informations du don depuis les métadonnées
      const amount = parseFloat(session.metadata.amount);

      donationDetails.value = {
        amount,
        message: session.metadata.message || undefined,
        associationId: session.metadata.associationId,
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des détails du don:', err);
      error.value = 'Impossible de récupérer les détails du paiement';
    } finally {
      loading.value = false;
    }
  });
</script>
