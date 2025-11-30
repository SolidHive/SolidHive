<template>
  <PageContainer>
    <div class="flex min-h-[60vh] items-center justify-center">
      <div class="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <Loader2 class="text-primary mx-auto h-16 w-16 animate-spin" />
          <h2 class="font-title text-secondary text-2xl font-bold">{{ loadingMessage }}</h2>
          <p class="text-gray-600">Veuillez patienter pendant que nous traitons votre paiement.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="space-y-6">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle class="h-12 w-12 text-green-600" />
          </div>
          <h1 class="font-title text-secondary text-3xl font-bold">{{ successTitle }}</h1>
          <p class="text-lg text-gray-700">{{ successMessage }}</p>
          <p v-if="successSubMessage" class="text-gray-600">{{ successSubMessage }}</p>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 pt-4">
            <Button class="bg-primary hover:bg-primary/90" @click="handlePrimaryAction">
              {{ primaryButtonText }}
            </Button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-6">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle class="h-12 w-12 text-red-600" />
          </div>
          <h1 class="font-title text-secondary text-3xl font-bold">Erreur lors du paiement</h1>
          <p class="text-lg text-red-600">{{ errorMessage }}</p>
          <p class="text-gray-600">
            Si le problème persiste, veuillez contacter notre support avec votre numéro de session.
          </p>
          <div class="flex justify-center gap-4 pt-4">
            <Button v-if="retryUrl" class="bg-primary hover:bg-primary/90" @click="handleRetry">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { Loader2, CheckCircle, XCircle } from 'lucide-vue-next';
  import PageContainer from '@/components/PageContainer.vue';
  import { Button } from '@/components/ui/button';

  interface Props {
    loading: boolean;
    success: boolean;
    error: boolean;
    errorMessage?: string;
    loadingMessage?: string;
    successTitle?: string;
    successMessage?: string;
    successSubMessage?: string;
    primaryButtonText?: string;
    retryUrl?: string;
  }

  withDefaults(defineProps<Props>(), {
    errorMessage: 'Une erreur est survenue lors du traitement de votre paiement',
    loadingMessage: 'Traitement de votre paiement...',
    successTitle: 'Paiement confirmé !',
    successMessage: 'Votre paiement a été effectué avec succès.',
    successSubMessage: 'Vous allez recevoir un email de confirmation.',
    primaryButtonText: 'Retour',
    retryUrl: '',
  });

  const emit = defineEmits<{
    primaryAction: [];
    retry: [];
  }>();

  const handlePrimaryAction = () => {
    emit('primaryAction');
  };

  const handleRetry = () => {
    emit('retry');
  };
</script>
