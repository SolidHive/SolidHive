import type { EventPricing } from '@/interfaces';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getPricingInfo(pricings: EventPricing[] | undefined, pricingId: string) {
  const pricing = pricings?.find((p) => p.id === pricingId);
  return {
    title: pricing?.title || 'Billet',
    amount: Number(pricing?.amount || 0),
    description: pricing?.description,
  };
}

export function formatDate(date?: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAddress(address?: any): string {
  if (!address) return '';
  return `${address.street}, ${address.postcode} ${address.city}`;
}
