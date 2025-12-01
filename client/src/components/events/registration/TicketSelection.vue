<template>
  <div class="space-y-6">
    <SectionTitle>Billets</SectionTitle>

    <div v-if="errorMessage" class="rounded-lg border-2 border-red-500 bg-red-50 p-4">
      <p class="text-sm font-medium text-red-700">{{ errorMessage }}</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="pricing in pricings"
        :key="pricing.id"
        class="flex flex-col gap-4 rounded-lg border-2 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
        :class="getTicketQuantity(pricing.id) > 0 ? 'border-accent' : 'border-gray-200'"
      >
        <div class="min-w-0 flex-1">
          <h3 class="font-paragraph text-secondary text-base font-bold sm:text-lg">
            {{ pricing.title }}
          </h3>
          <p class="text-secondary text-sm">{{ pricing.description }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
            <span class="font-title text-secondary text-lg font-bold sm:text-xl">
              {{ formatCurrency(pricing.amount) }}
            </span>
            <span
              v-if="pricing.availableCapacity !== undefined"
              class="text-sm font-medium"
              :class="getCapacityColor(pricing.availableCapacity ?? 0)"
            >
              <span v-if="(pricing.availableCapacity ?? 0) === 0">Complet</span>
              <span v-else>
                {{ pricing.availableCapacity }} place{{
                  (pricing.availableCapacity ?? 0) > 1 ? 's' : ''
                }}
                disponible{{ (pricing.availableCapacity ?? 0) > 1 ? 's' : '' }}
              </span>
            </span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3 sm:justify-end">
          <Button
            variant="outline"
            size="icon"
            :disabled="getTicketQuantity(pricing.id) === 0"
            @click="decrementQuantity(pricing.id)"
          >
            <Minus class="h-4 w-4" />
          </Button>
          <span class="font-title text-secondary w-8 text-center text-lg font-bold">
            {{ getTicketQuantity(pricing.id) }}
          </span>
          <Button
            variant="outline"
            size="icon"
            :disabled="
              (pricing.availableCapacity ?? 0) === 0 ||
              getTicketQuantity(pricing.id) >= (pricing.availableCapacity ?? 0)
            "
            @click="incrementQuantity(pricing.id)"
          >
            <Plus class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Minus, Plus } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import SectionTitle from './common/SectionTitle.vue';
  import { formatCurrency } from '@/utils/eventRegistration.utils';
  import type { EventPricing } from '@/interfaces';

  const props = defineProps<{
    pricings?: EventPricing[];
    selectedTickets: Record<string, number>;
    errorMessage?: string;
  }>();

  const emit = defineEmits<{
    'update:selectedTickets': [tickets: Record<string, number>];
  }>();

  const getTicketQuantity = (pricingId: string) => {
    return props.selectedTickets[pricingId] || 0;
  };

  const incrementQuantity = (pricingId: string) => {
    const updated = { ...props.selectedTickets };
    updated[pricingId] = (updated[pricingId] || 0) + 1;
    emit('update:selectedTickets', updated);
  };

  const decrementQuantity = (pricingId: string) => {
    const updated = { ...props.selectedTickets };
    if (updated[pricingId] > 0) {
      updated[pricingId]--;
      if (updated[pricingId] === 0) {
        delete updated[pricingId];
      }
    }
    emit('update:selectedTickets', updated);
  };

  const getCapacityColor = (availableCapacity: number) => {
    if (availableCapacity === 0) return 'text-red-600';
    if (availableCapacity <= 10) return 'text-orange-500';
    return 'text-green-600';
  };
</script>
