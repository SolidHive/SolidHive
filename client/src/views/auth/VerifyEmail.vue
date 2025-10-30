<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-6">
    <div
      class="bg-card border-border relative w-full max-w-md rounded-[20px] border p-8 text-center shadow-xl"
    >
      <div class="relative z-10">
        <!-- Icônes d'état avec transition fluide -->
        <div class="relative mb-8 mt-2 h-24">
          <!-- Spinner avec animation avancée pour chargement -->
          <transition name="fade" mode="out-in">
            <div
              v-if="loading"
              key="loading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 class="text-accent h-20 w-20 animate-spin" />
            </div>

            <!-- Succès avec animation à l'entrée -->
            <div
              v-else-if="success || alreadyVerified"
              key="success"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="bg-accent/10 animate-pop-in transform rounded-full p-6 shadow-sm transition-all duration-500"
              >
                <Check class="text-accent h-12 w-12" :stroke-width="2.5" />
              </div>
            </div>

            <!-- Erreur avec animation à l'entrée -->
            <div v-else key="error" class="absolute inset-0 flex items-center justify-center">
              <div
                class="bg-destructive/10 animate-pop-in transform rounded-full p-6 shadow-sm transition-all duration-500"
              >
                <X class="text-destructive h-12 w-12" :stroke-width="2" />
              </div>
            </div>
          </transition>
        </div>

        <!-- Contenu textuel avec animation -->
        <div class="space-y-4">
          <transition name="fade-slide-down" mode="out-in">
            <h1 :key="currentTitle" class="font-title text-foreground mb-2 text-center text-3xl">
              {{ currentTitle }}
            </h1>
          </transition>

          <transition name="fade-slide-up" mode="out-in">
            <p
              :key="currentMessage"
              class="font-paragraph text-muted-foreground mb-8 leading-relaxed"
            >
              {{ currentMessage }}
            </p>
          </transition>

          <!-- Contact support pour liens expirés -->
          <transition name="fade">
            <div v-if="isExpired" class="mb-6">
              <div class="bg-accent/5 border-border flex items-center rounded-[12px] border p-4">
                <div class="bg-accent/10 mr-3 rounded-full p-2">
                  <Info class="text-accent h-5 w-5" />
                </div>
                <div class="text-left">
                  <div class="font-subtitle text-foreground text-sm font-semibold">
                    Besoin d'aide?
                  </div>
                  <a
                    href="mailto:support@solidhive.com"
                    class="text-secondary hover:text-secondary/80 font-paragraph text-sm transition-colors"
                  >
                    Contactez notre support
                  </a>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Bouton d'action -->
        <Button v-if="!loading" variant="default" size="lg" class="w-full" @click="redirectToLogin">
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
  <LoadingOverlay :show="loading" message="Vérification en cours..." />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import Database from '../../utils/database.utils';
  import { verifyEmailMessages } from '../../utils/errors/auth/verifyEmail';
  import LoadingOverlay from '../../components/LoadingOverlay.vue';
  import { Button } from '../../components/ui/button';
  import { Loader2, Check, X, Info } from 'lucide-vue-next';

  // États
  const loading = ref(true);
  const success = ref(false);
  const alreadyVerified = ref(false);
  const isExpired = ref(false);

  // Services
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  // Valeurs calculées
  const currentTitle = computed(() => {
    if (loading.value) return verifyEmailMessages.title.loading;
    if (success.value) return verifyEmailMessages.title.success;
    if (alreadyVerified.value) return verifyEmailMessages.title.alreadyVerified;
    if (isExpired.value) return verifyEmailMessages.title.expired;
    return verifyEmailMessages.title.failure;
  });

  const currentMessage = computed(() => {
    if (loading.value) return verifyEmailMessages.message.loading;
    if (success.value) return verifyEmailMessages.message.success;
    if (alreadyVerified.value) return verifyEmailMessages.message.alreadyVerified;
    if (isExpired.value) return verifyEmailMessages.message.expired;
    return verifyEmailMessages.message.failure;
  });

  const buttonText = computed(() =>
    success.value || alreadyVerified.value
      ? verifyEmailMessages.button.success
      : verifyEmailMessages.button.failure
  );

  // Redirection
  function redirectToLogin() {
    router.push('/login');
  }

  // Traitement du token
  onMounted(async () => {
    const token = route.query.token as string;

    if (!token) {
      loading.value = false;
      success.value = false;
      return;
    }

    try {
      const response = await Database.create('security/action', {
        actionType: 'VERIFY_EMAIL',
        token: token,
      });

      // Succès - compte vérifié ou déjà vérifié
      success.value = true;

      // Vérifie si le compte était déjà vérifié
      if (response?.data?.message?.includes('déjà vérifié')) {
        alreadyVerified.value = true;
        toast.info(verifyEmailMessages.toast.alreadyVerified);
      } else {
        toast.success(verifyEmailMessages.toast.success);
      }
    } catch (error: unknown) {
      // Échec - différentes raisons possibles
      success.value = false;

      // Analyse l'erreur
      const apiError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage = apiError.response?.data?.message || '';

      // Détermine le type d'erreur
      if (errorMessage.includes('expiré')) {
        isExpired.value = true;
        toast.error(verifyEmailMessages.toast.expired);
      } else {
        toast.error(errorMessage || verifyEmailMessages.message.failure);
      }
    } finally {
      loading.value = false;
    }
  });
</script>

<style scoped>
  /* Animations pour transitions fluides */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-slide-down-enter-active,
  .fade-slide-down-leave-active {
    transition:
      opacity 0.3s,
      transform 0.4s;
  }

  .fade-slide-down-enter-from,
  .fade-slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .fade-slide-up-enter-active,
  .fade-slide-up-leave-active {
    transition:
      opacity 0.3s,
      transform 0.4s;
  }

  .fade-slide-up-enter-from,
  .fade-slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  @keyframes pulse-width {
    0%,
    100% {
      width: 0%;
    }

    50% {
      width: 100%;
    }
  }

  @keyframes pop-in {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }

    70% {
      transform: scale(1.1);
      opacity: 1;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-pop-in {
    animation: pop-in 0.5s cubic-bezier(0.26, 1.36, 0.68, 1);
  }
</style>
