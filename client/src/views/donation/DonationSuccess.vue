<template>
  <PaymentSuccess
    :loading="loading"
    :success="!loading && !error"
    :error="!!error"
    :error-message="error"
    loading-message="Récupération des détails du paiement..."
    success-title="Don effectué avec succès ! 🎉"
    success-message="Merci pour votre générosité. Votre don a été traité et l'association va pouvoir continuer ses actions."
    primary-button-text="Voir mon profil"
    @primary-action="goToProfile"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PaymentSuccess from '@/components/payment/PaymentSuccess.vue';
  import Database from '@/utils/database.utils';

  const route = useRoute();
  const router = useRouter();
  const loading = ref(true);
  const error = ref('');

  onMounted(async () => {
    const sessionId = route.query.session_id as string;

    if (!sessionId) {
      error.value = 'Session ID manquant';
      loading.value = false;
      return;
    }

    try {
      // Vérifier que la session existe
      const session = await Database.getOne('payments/session', sessionId);

      if (session.payment_status !== 'paid') {
        error.value = "Le paiement n'a pas été complété";
        loading.value = false;
        return;
      }

      await Database.create(`payments/donate/${sessionId}/finalize`, {});
    } catch (err) {
      console.error('Erreur lors de la finalisation du don:', err);
      error.value = 'Erreur lors de la finalisation du don';
    } finally {
      loading.value = false;
    }
  });

  const goToProfile = () => {
    router.push('/profile');
  };
</script>
