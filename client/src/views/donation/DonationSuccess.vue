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

    // Simplement vérifier que la session existe
    try {
      await Database.getOne('payments/session', sessionId);
    } catch (err) {
      console.error('Erreur lors de la vérification de la session:', err);
      error.value = 'Session de paiement invalide';
    } finally {
      loading.value = false;
    }
  });

  const goToProfile = () => {
    router.push('/profile');
  };
</script>
