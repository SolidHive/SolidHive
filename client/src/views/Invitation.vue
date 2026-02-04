<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-[20px] border p-8 shadow-xl sm:p-10">
        <!-- Header -->
        <div class="mb-10 text-center">
          <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">
            {{ isLoading ? 'Traitement...' : 'Invitation' }}
          </h1>
          <p class="font-paragraph text-muted-foreground text-lg">
            {{ isLoading ? 'Veuillez patienter...' : 'Accepter votre invitation' }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <LoadingOverlay />
          <p class="font-paragraph text-muted-foreground mt-4">Nous traitons votre invitation...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="invitationAccepted" class="text-center">
          <div class="mb-6">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <Check class="h-8 w-8 text-green-600" />
            </div>
            <h2 class="font-title text-primary mb-2 text-2xl">Invitation acceptée !</h2>
            <p class="font-paragraph text-muted-foreground">
              Félicitations ! Vous êtes maintenant membre de l'association.
            </p>
          </div>

          <div class="space-y-4">
            <Button as-child variant="secondary" size="lg" class="w-full">
              <router-link to="/">Retour à l'accueil</router-link>
            </Button>
          </div>
        </div>

        <!-- Rejection Success State -->
        <div v-else-if="invitationRejected" class="text-center">
          <div class="mb-6">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
            >
              <X class="h-8 w-8 text-red-600" />
            </div>
            <h2 class="font-title text-primary mb-2 text-2xl">Invitation refusée</h2>
            <p class="font-paragraph text-muted-foreground">
              Vous avez refusé l'invitation à rejoindre cette association.
            </p>
          </div>

          <div class="space-y-4">
            <Button as-child variant="secondary" size="lg" class="w-full">
              <router-link to="/">Retour à l'accueil</router-link>
            </Button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="mb-6">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
            >
              <X class="h-8 w-8 text-red-600" />
            </div>
            <h2 class="font-title text-primary mb-2 text-2xl">Erreur</h2>
            <p class="font-paragraph text-muted-foreground">
              {{ error }}
            </p>
          </div>

          <div class="space-y-4">
            <Button as-child variant="secondary" size="lg" class="w-full">
              <router-link to="/">Retour à l'accueil</router-link>
            </Button>
          </div>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center">
          <div class="mb-6">
            <div
              class="bg-secondary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            >
              <Mail class="text-secondary h-8 w-8" />
            </div>
            <h2 class="font-title text-primary mb-2 text-2xl">Invitation reçue</h2>
            <p class="font-paragraph text-muted-foreground">
              Cliquez sur le bouton ci-dessous pour accepter votre invitation à rejoindre
              l'association.
            </p>
          </div>

          <div class="space-y-4">
            <Button
              variant="secondary"
              size="lg"
              class="w-full"
              :disabled="isLoading"
              @click="acceptInvitation"
            >
              Accepter l'invitation
            </Button>

            <Button
              variant="destructive"
              size="lg"
              class="w-full"
              :disabled="isLoading"
              @click="rejectInvitation"
            >
              Refuser l'invitation
            </Button>

            <Button
              as-child
              class="bg-accent hover:bg-accent/90 w-full px-8 text-white transition-colors"
            >
              <router-link to="/">Plus tard</router-link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Check, X, Mail } from 'lucide-vue-next';
  import LoadingOverlay from '../components/LoadingOverlay.vue';
  import Button from '../components/ui/button/Button.vue';
  import Database from '../utils/database.utils';
  import { useNotificationsStore } from '../stores/notifications';

  const route = useRoute();
  const notificationsStore = useNotificationsStore();
  const isLoading = ref(false);
  const invitationAccepted = ref(false);
  const invitationRejected = ref(false);
  const error = ref('');

  const acceptInvitation = async () => {
    if (!route.params.invitationId) {
      error.value = "ID d'invitation manquant";
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      await Database.create(`invitations/accept/${route.params.invitationId}`, {});
      invitationAccepted.value = true;
      // Décrémenter le compteur de notifications
      notificationsStore.decrementNotifications();
    } catch (err: any) {
      console.error('Erreur:', err);
      error.value =
        err?.response?.data?.message || err?.message || "Une erreur inattendue s'est produite";
    } finally {
      isLoading.value = false;
    }
  };

  const rejectInvitation = async () => {
    if (!route.params.invitationId) {
      error.value = "ID d'invitation manquant";
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      await Database.create(`invitations/reject/${route.params.invitationId}`, {});
      invitationRejected.value = true;
      // Décrémenter le compteur de notifications
      notificationsStore.decrementNotifications();
    } catch (err: any) {
      console.error('Erreur:', err);
      error.value =
        err?.response?.data?.message || err?.message || "Une erreur inattendue s'est produite";
    } finally {
      isLoading.value = false;
    }
  };
</script>
