<template>
  <div class="bg-card rounded-xl p-4 shadow-xl sm:p-6">
    <div class="bg-secondary mb-3 rounded-xl p-2 text-center sm:mb-4 sm:p-3">
      <div class="flex items-center justify-center gap-2">
        <CheckCircle class="text-secondary-foreground h-5 w-5 sm:h-6 sm:w-6" />
        <h3 class="font-title text-secondary-foreground text-base font-black sm:text-lg">
          Récapitulatif du don
        </h3>
      </div>
    </div>

    <!-- Version mobile : liste verticale -->
    <div class="mb-4 block space-y-3 sm:hidden">
      <div class="border-secondary/20 flex items-center justify-between border-b py-2">
        <span class="text-secondary text-xs font-medium sm:text-sm">Montant total du don</span>
        <span class="text-foreground text-sm font-semibold">{{ totalAmount.toFixed(2) }}€</span>
      </div>
      <div class="border-secondary/20 flex items-center justify-between border-b py-2">
        <span class="text-secondary text-xs font-medium sm:text-sm">
          Contribution SolidHive ({{ solidHivePercentage }}%)
        </span>
        <span class="text-foreground text-sm font-semibold">{{ solidHiveAmount.toFixed(2) }}€</span>
      </div>
      <div class="border-secondary/20 flex items-center justify-between border-b py-2">
        <span class="text-secondary text-xs font-medium sm:text-sm">
          Montant pour l'association
        </span>
        <span class="text-foreground text-sm font-semibold">
          {{ associationAmount.toFixed(2) }}€
        </span>
      </div>
      <div class="flex items-center justify-between py-3">
        <span class="text-secondary text-sm font-bold">Total</span>
        <span class="text-foreground text-lg font-bold">{{ totalAmount.toFixed(2) }}€</span>
      </div>
    </div>

    <!-- Version desktop : table -->
    <table class="border-secondary mb-4 hidden w-full border-collapse border sm:table">
      <tbody>
        <tr>
          <td class="border-secondary text-secondary border p-3 text-sm">Montant total du don</td>
          <td class="border-secondary text-secondary border p-3 text-center text-sm font-semibold">
            {{ totalAmount.toFixed(2) }}€
          </td>
        </tr>
        <tr>
          <td class="border-secondary text-secondary border p-3 text-sm">
            Contribution SolidHive ({{ solidHivePercentage }}%)
          </td>
          <td class="border-secondary text-secondary border p-3 text-center text-sm font-semibold">
            {{ solidHiveAmount.toFixed(2) }}€
          </td>
        </tr>
        <tr>
          <td class="border-secondary text-secondary border p-3 text-sm">
            Montant pour l'association
          </td>
          <td class="border-secondary text-secondary border p-3 text-center text-sm font-semibold">
            {{ associationAmount.toFixed(2) }}€
          </td>
        </tr>
        <tr>
          <td class="border-secondary text-secondary border p-3 text-base font-bold">Total</td>
          <td class="border-secondary text-secondary border p-3 text-center text-xl font-bold">
            {{ totalAmount.toFixed(2) }}€
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Payment button -->
  <Button
    :disabled="!authStore.isAuthenticated() || !canProceed || isLoading"
    variant="default"
    class="mt-3 w-full text-sm sm:mt-4 sm:text-base"
    @click="handlePayment"
  >
    <CreditCard v-if="!isLoading" class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
    <Loader2 v-else class="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
    <span class="hidden sm:inline">
      {{
        isLoading
          ? 'Traitement en cours...'
          : !authStore.isAuthenticated()
            ? 'Connectez-vous pour payer'
            : 'Payer'
      }}
    </span>
    <span class="sm:hidden">
      {{
        isLoading ? 'Traitement...' : !authStore.isAuthenticated() ? 'Connexion requise' : 'Payer'
      }}
    </span>
  </Button>

  <!-- Security notice -->
  <div class="mt-3 flex flex-col items-start gap-2 sm:mt-4 sm:flex-row sm:items-center sm:gap-4">
    <div class="flex items-center gap-2">
      <Lock class="text-secondary h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      <span class="text-secondary text-xs font-medium sm:text-sm">Paiement sécurisé</span>
    </div>
    <div class="flex items-center gap-2 sm:gap-4">
      <img :src="cbLogo" alt="CB" class="h-6 sm:h-8" />
      <img :src="mastercardLogo" alt="Mastercard" class="h-6 sm:h-8" />
      <img :src="visaLogo" alt="Visa" class="h-6 sm:h-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { CreditCard, Loader2, CheckCircle, Lock } from 'lucide-vue-next';
  import visaLogo from '@/assets/logos/visa.png';
  import mastercardLogo from '@/assets/logos/mastercard.png';
  import cbLogo from '@/assets/logos/cb.png';
  import { Button } from '@/components/ui/button';
  import type { Association } from '@/interfaces/association.interface';
  import { useAuthStore } from '@/stores/auth';

  interface Props {
    association: Association;
    totalAmount: number;
    solidHivePercentage: number;
    isLoading: boolean;
  }

  interface Emits {
    (e: 'payment'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  const authStore = useAuthStore();

  const solidHiveAmount = computed(() => {
    return (props.totalAmount * props.solidHivePercentage) / 100;
  });

  const associationAmount = computed(() => {
    return props.totalAmount - solidHiveAmount.value;
  });

  const canProceed = computed(() => {
    return props.totalAmount >= 1 && props.totalAmount <= 100000;
  });
  const handlePayment = () => {
    if (!authStore.isAuthenticated()) return;
    if (canProceed.value && !props.isLoading) {
      emit('payment');
    }
  };
</script>
