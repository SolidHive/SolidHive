<template>
  <PaymentSuccess
    :loading="loading"
    :success="!loading && !error"
    :error="!!error"
    :error-message="error"
    loading-message="Récupération des détails du paiement..."
    success-title="Don effectué avec succès ! 🎉"
    success-message="Merci pour votre générosité. Votre don a été traité et l'association va pouvoir continuer ses actions."
    primary-button-text="Retour à l'association"
    secondary-button-text="Voir d'autres associations"
    :payment-details="donationDetails"
    @primary-action="goToAssociation"
    @secondary-action="goToAssociations"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PaymentSuccess from '@/components/payment/PaymentSuccess.vue';
  import api from '@/utils/api.utils';

  interface DonationDetails {
    amount: number;
    message?: string;
    associationId: string;
  }

  const route = useRoute();
  const router = useRouter();
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

  const goToAssociation = () => {
    if (donationDetails.value?.associationId) {
      router.push(`/association/${donationDetails.value.associationId}`);
    } else {
      goToAssociations();
    }
  };

  const goToAssociations = () => {
    router.push('/associations');
  };
</script>
