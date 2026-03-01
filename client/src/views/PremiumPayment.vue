<template>
  <PageContainer>
    <div class="container mx-auto max-w-4xl px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8 text-center">
        <h1 class="font-title text-secondary mb-2 text-3xl sm:text-4xl">Abonnement Premium</h1>
        <p class="text-muted-foreground text-lg">
          Débloquez toutes les fonctionnalités pour votre association
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Informations de l'association -->
        <div class="bg-card rounded-xl p-6 shadow-lg">
          <h2 class="font-title text-secondary mb-4 text-xl">Association sélectionnée</h2>
          <div v-if="association" class="space-y-3">
            <div>
              <p class="text-muted-foreground text-sm">Nom</p>
              <p class="font-subtitle text-foreground text-lg">{{ association.name }}</p>
            </div>
            <div v-if="association.description">
              <p class="text-muted-foreground text-sm">Description</p>
              <p class="text-foreground">{{ association.description }}</p>
            </div>
            <div v-if="association.paymentServiceValidUntil">
              <p class="text-muted-foreground text-sm">Premium actif jusqu'au</p>
              <p class="text-foreground font-medium">
                {{ formatDate(association.paymentServiceValidUntil) }}
              </p>
            </div>
            <div v-else>
              <p class="text-muted-foreground text-sm">Statut</p>
              <p class="text-foreground font-medium">Aucun abonnement actif</p>
            </div>
          </div>
        </div>

        <!-- Formulaire de paiement -->
        <div class="bg-card rounded-xl p-6 shadow-xl">
          <!-- Header centré avec fond secondary -->
          <div class="bg-secondary mb-6 rounded-xl p-3 text-center">
            <h2 class="font-title text-secondary-foreground text-lg">Choisir votre durée</h2>
          </div>

          <!-- Sélection des mois -->
          <div class="mb-6">
            <label
              for="months"
              class="font-paragraph text-foreground mb-2 block text-sm font-medium"
            >
              Nombre de mois (1 à 24)
            </label>
            <div class="relative">
              <InputForm
                id="months"
                v-model="months"
                type="number"
                min="1"
                max="24"
                placeholder="Entrez le nombre de mois"
                class="pr-16"
                @update:model-value="onMonthsInput"
              />
              <span
                class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium sm:right-4 sm:text-base"
              >
                mois
              </span>
            </div>
            <p class="text-muted-foreground mt-2 text-xs sm:text-sm">15€ par mois</p>
          </div>

          <!-- Montant total -->
          <div class="bg-tertiary/20 mb-6 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="font-paragraph text-foreground text-lg font-medium">Montant total</span>
              <span class="font-title text-primary text-2xl sm:text-3xl">
                {{ totalAmount.toFixed(2) }}€
              </span>
            </div>
            <p class="text-muted-foreground mt-2 text-sm">
              Votre abonnement sera valide jusqu'au {{ formatFutureDate() }}
            </p>
          </div>

          <!-- Boutons -->
          <div class="flex flex-col gap-3">
            <Button
              class="bg-primary hover:bg-primary/90 text-white"
              :disabled="!canProceed || isLoading"
              @click="proceedToPayment"
            >
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              <span v-if="isLoading" class="hidden sm:inline">Traitement en cours...</span>
              <span v-if="isLoading" class="sm:hidden">Traitement...</span>
              <span v-else>Procéder au paiement</span>
            </Button>
            <Button variant="outline" @click="goBack">Retour</Button>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Loader2 } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import InputForm from '@/components/form/InputForm.vue';
  import PageContainer from '@/components/PageContainer.vue';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  interface Association {
    id: string;
    name: string;
    description?: string;
    paymentServiceValidUntil?: Date;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const associationId = ref<string>('');
  const association = ref<Association | null>(null);
  const months = ref<number>(1);
  const isLoading = ref<boolean>(false);

  const PRICE_PER_MONTH = 15;

  // Computed
  const totalAmount = computed(() => {
    return months.value * PRICE_PER_MONTH;
  });

  const canProceed = computed(() => {
    return months.value >= 1 && months.value <= 24 && association.value !== null;
  });

  // Methods
  const onMonthsInput = (value: string) => {
    let numValue = parseInt(value) || 1;
    numValue = Math.max(1, Math.min(24, numValue));
    months.value = numValue;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatFutureDate = () => {
    const currentDate = association.value?.paymentServiceValidUntil
      ? new Date(association.value.paymentServiceValidUntil)
      : new Date();

    // Si la date actuelle est dans le passé, on part d'aujourd'hui
    if (currentDate < new Date()) {
      currentDate.setTime(new Date().getTime());
    }

    // Ajouter les mois
    const futureDate = new Date(currentDate);
    futureDate.setMonth(futureDate.getMonth() + months.value);

    return formatDate(futureDate);
  };

  const fetchAssociation = async () => {
    try {
      const response = await Database.getOne('association', associationId.value);
      association.value = response;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'association:", error);
      toast.error("Impossible de charger les informations de l'association");
      router.push({ name: 'AboutPremium' });
    }
  };

  const proceedToPayment = async () => {
    if (!canProceed.value) {
      toast.error('Veuillez vérifier les informations saisies');
      return;
    }

    isLoading.value = true;

    try {
      const response = await Database.create('payments/premium', {
        associationId: associationId.value,
        months: months.value,
      });

      // Rediriger vers Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Erreur lors de la création de la session de paiement');
      }
    } catch (err: any) {
      console.error('Error creating premium session:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création du paiement');
    } finally {
      isLoading.value = false;
    }
  };

  const goBack = () => {
    router.push({ name: 'AboutPremium' });
  };

  // Lifecycle
  onMounted(async () => {
    associationId.value = route.params.associationId as string;
    if (!associationId.value) {
      toast.error("Identifiant d'association manquant");
      router.push({ name: 'AboutPremium' });
      return;
    }
    await fetchAssociation();
  });
</script>
