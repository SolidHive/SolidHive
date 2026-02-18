<template>
  <PaymentSuccess
    :loading="loading"
    :success="!loading && !error"
    :error="!!error"
    :error-message="error"
    loading-message="Récupération des détails du paiement..."
    success-title="Abonnement Premium activé ! 🎉"
    success-message="Merci ! Votre association a maintenant accès à toutes les fonctionnalités premium."
    primary-button-text="Retour à la page premium"
    @primary-action="goToPremium"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PaymentSuccess from '@/components/payment/PaymentSuccess.vue';
  import Database from '@/utils/database.utils';
  import { useCrmStore } from '@/stores/crm';

  const route = useRoute();
  const router = useRouter();
  const crmStore = useCrmStore();
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

      await Database.create(`payments/premium/${sessionId}/finalize`, {});

      // Rafraîchir les données de l'association dans le store CRM
      const associationId = session.metadata?.associationId;
      if (associationId && crmStore.currentAssociationId === associationId) {
        await crmStore.refreshAssociationData(associationId);
      }
    } catch (err) {
      console.error("Erreur lors de la finalisation de l'abonnement premium:", err);
      error.value = "Erreur lors de la finalisation de l'abonnement premium";
    } finally {
      loading.value = false;
    }
  });

  const goToPremium = () => {
    router.push('/about-premium');
  };
</script>
