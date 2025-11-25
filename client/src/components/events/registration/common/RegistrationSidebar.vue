<template>
  <div class="w-full space-y-6 rounded-xl p-4 shadow-lg">
    <!-- Total Header -->
    <div class="bg-secondary rounded-lg p-3 text-center text-white sm:p-4">
      <h3 class="font-title text-base font-bold sm:text-lg">Total</h3>
    </div>

    <!-- Selected Tickets -->
    <div class="space-y-3">
      <div
        v-for="[pricingId, quantity] in Object.entries(selectedTickets)"
        :key="pricingId"
        class="flex items-center justify-between"
      >
        <span class="text-md text-secondary font-semibold">
          {{ quantity }} - {{ getPricingName(pricingId) }}
        </span>
        <span class="text-secondary font-medium">
          {{ formatPrice(getPricingPrice(pricingId) * quantity) }}
        </span>
      </div>

      <!-- Separator -->
      <div class="my-3 border-t border-gray-300"></div>

      <!-- Total Amount -->
      <div class="flex items-center justify-between text-xl font-bold">
        <span class="text-secondary">Total</span>
        <span class="text-secondary">{{ formatPrice(totalAmount) }}</span>
      </div>

      <!-- Next/Submit Button -->
      <Button
        v-if="currentStep < 3"
        class="w-full py-2 text-white transition-opacity sm:py-3"
        :class="
          canProceed ? 'bg-accent hover:bg-accent/90' : 'cursor-not-allowed bg-gray-400 opacity-50'
        "
        :disabled="!canProceed"
        @click="$emit('next-step')"
      >
        Suivant
      </Button>

      <Button
        v-else
        class="w-full py-2 text-white transition-opacity sm:py-3"
        :class="
          !isSubmitting
            ? 'bg-primary hover:bg-primary/90'
            : 'cursor-not-allowed bg-gray-400 opacity-50'
        "
        :disabled="isSubmitting"
        @click="$emit('submit-registration')"
      >
        <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        {{ isSubmitting ? 'Paiement en cours...' : 'Payer' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Loader2 } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { formatCurrency, getPricingInfo } from '@/utils/eventRegistration.utils';
  import type { EventPricing } from '@/interfaces';

  const props = defineProps<{
    selectedTickets: Record<string, number>;
    pricings?: EventPricing[];
    canProceed: boolean;
    currentStep: number;
    isSubmitting: boolean;
  }>();

  defineEmits<{
    'next-step': [];
    'submit-registration': [];
  }>();

  const getPricingName = (pricingId: string) => {
    return getPricingInfo(props.pricings, pricingId).title;
  };

  const getPricingPrice = (pricingId: string) => {
    return getPricingInfo(props.pricings, pricingId).amount;
  };

  const totalAmount = computed(() => {
    return Object.entries(props.selectedTickets).reduce((total, [pricingId, quantity]) => {
      return total + getPricingPrice(pricingId) * quantity;
    }, 0);
  });

  const formatPrice = formatCurrency;
</script>
