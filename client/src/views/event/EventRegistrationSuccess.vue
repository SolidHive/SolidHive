<template>
  <PaymentSuccess
    :loading="loading"
    :success="success"
    :error="error"
    :error-message="errorMessage"
    loading-message="Finalisation de votre inscription..."
    success-title="Inscription confirmée !"
    success-message="Votre paiement a été effectué avec succès et votre inscription à l'événement est confirmée."
    success-sub-message="Vous allez recevoir un email de confirmation avec tous les détails de votre inscription."
    primary-button-text="Voir mon profil"
    :retry-url="eventId ? `/event/${eventId}/registration` : ''"
    @primary-action="goToProfile"
    @retry="retryRegistration"
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
  const success = ref(false);
  const error = ref(false);
  const errorMessage = ref('');
  const eventId = ref('');

  onMounted(async () => {
    const sessionId = route.query.session_id as string;

    if (!sessionId) {
      error.value = true;
      errorMessage.value = 'Session de paiement non trouvée';
      loading.value = false;
      return;
    }

    try {
      // Vérifier que le paiement est complété
      const session = await Database.getOne('payments/session', sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error("Le paiement n'a pas été complété");
      }

      // Récupérer l'eventId depuis les métadonnées
      eventId.value = session.metadata?.eventId || (route.params.eventId as string);

      // Finaliser l'inscription
      await Database.create(`payments/event-registration/${sessionId}/finalize`, {});

      success.value = true;
      loading.value = false;
    } catch (err: any) {
      console.error('Erreur lors de la finalisation:', err);
      error.value = true;
      errorMessage.value =
        err.message || 'Une erreur est survenue lors de la finalisation de votre inscription';
      loading.value = false;
    }
  });

  const goToProfile = () => {
    router.push('/profile');
  };

  const retryRegistration = () => {
    if (eventId.value) {
      router.push(`/event/${eventId.value}/registration`);
    } else {
      goToEvents();
    }
  };
</script>
