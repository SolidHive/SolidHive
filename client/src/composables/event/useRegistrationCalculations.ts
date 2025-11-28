import { computed, type Ref } from 'vue';
import type { EventPricing } from '@/interfaces';

export function useRegistrationCalculations(
  selectedTickets: Ref<Record<string, number>>,
  pricings: Ref<EventPricing[] | undefined>
) {
  const totalTickets = computed(() => {
    return Object.values(selectedTickets.value).reduce((sum, qty) => sum + qty, 0);
  });

  const totalAmount = computed(() => {
    if (!pricings.value) return 0;
    return Object.entries(selectedTickets.value).reduce((total, [pricingId, quantity]) => {
      const pricing = pricings.value?.find((p) => p.id === pricingId);
      return total + (pricing ? Number(pricing.amount) * quantity : 0);
    }, 0);
  });

  const getTicketName = (pricingId: string): string => {
    const pricing = pricings.value?.find((p) => p.id === pricingId);
    return pricing?.title || 'Billet';
  };

  const getTicketPrice = (pricingId: string): number => {
    const pricing = pricings.value?.find((p) => p.id === pricingId);
    return pricing ? Number(pricing.amount) : 0;
  };

  return {
    totalTickets,
    totalAmount,
    getTicketName,
    getTicketPrice,
  };
}
