<template>
  <div class="bg-card rounded-xl p-4 shadow-xl sm:p-6">
    <!-- Montant récolté -->
    <div class="text-secondary font-title text-2xl sm:text-3xl">
      {{ formatCurrency(currentAmount) }} récoltés
    </div>

    <!-- Objectif -->
    <div class="font-paragraph mt-2 text-sm text-gray-700 sm:text-lg">
      Objectif : {{ formatCurrency(targetAmount) }}
    </div>

    <!-- Barre de progression -->
    <div class="mt-4 space-y-2 sm:mt-6">
      <div class="h-3 w-full rounded-full bg-gray-200">
        <div
          class="h-3 rounded-full bg-[#009B77] transition-all duration-300"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="text-sm text-gray-600">
        {{ Math.round(progressPercentage) }}% de l'objectif atteint
      </div>
    </div>

    <!-- Header centré avec fond secondary -->
    <div class="bg-secondary mt-4 mb-4 rounded-xl p-2 text-center sm:mb-6 sm:p-3">
      <div class="flex items-center justify-center gap-2">
        <HandHeart class="text-secondary-foreground h-5 w-5 sm:h-6 sm:w-6" />
        <h2 class="font-title text-secondary-foreground text-base font-black sm:text-lg">
          Mon don
        </h2>
      </div>
    </div>

    <!-- Montant du don -->
    <div>
      <div class="relative">
        <InputForm
          :model-value="donationAmount.toString()"
          type="number"
          input-name="donation-amount"
          placeholder="Montant"
          :input-class="'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring font-paragraph w-full rounded-lg border px-3 py-2 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base'"
          @update:model-value="onDonationAmountInput"
        />
        <span
          class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium sm:right-4 sm:text-base"
        >
          €
        </span>
      </div>
    </div>

    <!-- Pourcentage pour SolidHive -->
    <div class="mt-3 space-y-2 sm:mt-4">
      <label
        for="solidhive-percentage"
        class="font-paragraph text-foreground block text-sm font-medium"
      >
        Pourcentage pour SolidHive (modifiable)
      </label>
      <div class="relative">
        <InputForm
          :model-value="solidHivePercentage.toString()"
          type="number"
          input-name="solidhive-percentage"
          placeholder="5"
          :input-class="'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring font-paragraph w-full rounded-lg border px-3 py-2 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base'"
          @update:model-value="onSolidHivePercentageInput"
        />
        <span
          class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium sm:right-4 sm:text-base"
        >
          %
        </span>
      </div>
      <p class="text-muted-foreground text-xs sm:text-sm">
        Montant : {{ computedSolidHiveAmount.toFixed(2) }}€
      </p>
    </div>

    <!-- Boutons -->
    <div class="mt-4 flex flex-col gap-3 sm:mt-6 xl:flex-row">
      <Button
        class="bg-accent hover:bg-accent/90 flex-1 text-white"
        :disabled="!authStore.isAuthenticated() || isLoading"
        @click="faireUnDon"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
        <span v-if="isLoading" class="hidden sm:inline">Traitement en cours...</span>
        <span v-if="isLoading" class="sm:hidden">Traitement...</span>
        <span v-else>
          {{ authStore.isAuthenticated() ? 'Faire un don' : 'Se connecter pour donner' }}
        </span>
      </Button>
      <Button
        variant="outline"
        class="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground flex-1 border-2"
        @click="partagerCagnotte"
      >
        <div class="flex items-center gap-2">
          <Check v-if="shareButtonText === 'Copié'" class="h-4 w-4" />
          {{ shareButtonText }}
        </div>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { HandHeart, Check, Loader2 } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import InputForm from '@/components/form/InputForm.vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  interface Props {
    currentAmount: number;
    targetAmount: number;
    donationAmount?: number;
    solidHivePercentage?: number;
    fundraisingId: string;
    associationId: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    donationAmount: 0,
    solidHivePercentage: 5,
  });

  const emit = defineEmits<{
    'update:donationAmount': [value: number];
    'update:solidHivePercentage': [value: number];
  }>();

  // Auth store
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  // Reactive data
  const solidHivePercentage = ref<number>(props.solidHivePercentage);
  const shareButtonText = ref<string>('Partagé');
  const isLoading = ref<boolean>(false);

  // Computed
  const progressPercentage = computed(() => {
    if (!props.targetAmount) return 0;
    return Math.min((props.currentAmount / props.targetAmount) * 100, 100);
  });

  const computedSolidHiveAmount = computed(() => {
    return (props.donationAmount * solidHivePercentage.value) / 100;
  });

  // Methods
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const onDonationAmountInput = (value: string) => {
    let numValue = parseFloat(value) || 0;

    // Limiter entre 1 et 100000
    numValue = Math.max(1, Math.min(100000, numValue));

    emit('update:donationAmount', numValue);
  };

  const onSolidHivePercentageInput = (value: string) => {
    let numValue = parseFloat(value) || 0;

    // Limiter entre 0 et 100
    numValue = Math.max(0, Math.min(100, numValue));

    solidHivePercentage.value = numValue;
    emit('update:solidHivePercentage', numValue);
  };

  const faireUnDon = async () => {
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!props.donationAmount || props.donationAmount <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }

    isLoading.value = true;

    try {
      const response = await Database.create('payments/donate', {
        amount: props.donationAmount,
        associationId: props.associationId,
        fundraisingId: props.fundraisingId,
        message: '', // Pas de message pour les cagnottes
        supportSolidHive: solidHivePercentage.value > 0,
        solidHivePercentage: solidHivePercentage.value,
      });

      // Rediriger vers Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      console.error('Error creating donation:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création du paiement');
    } finally {
      isLoading.value = false;
    }
  };

  const partagerCagnotte = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      shareButtonText.value = 'Copié';
      setTimeout(() => {
        shareButtonText.value = 'Partagé';
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
    }
  };
</script>
