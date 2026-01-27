<template>
  <div class="bg-card rounded-xl p-4 shadow-xl sm:p-6">
    <div class="bg-secondary mb-4 rounded-xl p-2 text-center sm:mb-6 sm:p-3">
      <div class="flex items-center justify-center gap-2">
        <HandHeart class="text-secondary-foreground h-5 w-5 sm:h-6 sm:w-6" />
        <h2 class="font-title text-secondary-foreground text-base font-black sm:text-lg">
          Participations
        </h2>
      </div>
    </div>

    <!-- Types de billets -->
    <div class="space-y-3">
      <div
        v-for="pricing in pricings"
        :key="pricing.id"
        class="border-b border-gray-200 py-2 last:border-b-0"
      >
        <div class="font-paragraph text-secondary text-lg font-medium">
          {{ pricing.title }} : {{ formatCurrency(pricing.amount) }}
        </div>
        <div
          class="font-paragraph mt-1 text-sm font-bold"
          :class="getCapacityColor(pricing.availableCapacity ?? 0)"
        >
          <span
            v-if="
              pricing.maxCapacity !== undefined &&
              pricing.maxCapacity !== null &&
              (pricing.availableCapacity ?? 0) === 0
            "
          >
            Complet
          </span>
          <span v-else-if="pricing.maxCapacity !== undefined && pricing.maxCapacity !== null">
            {{ pricing.availableCapacity }} place{{
              (pricing.availableCapacity ?? 0) > 1 ? 's' : ''
            }}
            disponible{{ (pricing.availableCapacity ?? 0) > 1 ? 's' : '' }}
          </span>
          <span v-else class="font-medium text-green-600">Illimité</span>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row xl:flex-row">
      <Button
        class="bg-accent hover:bg-accent/90 flex-1 text-white"
        :disabled="!authStore.isAuthenticated()"
        @click="participer"
      >
        {{ authStore.isAuthenticated() ? 'Participer' : 'Se connecter pour participer' }}
      </Button>
      <Button
        variant="outline"
        class="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground flex-1 border-2"
        @click="partagerEvent"
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
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Check, HandHeart } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { useAuthStore } from '@/stores/auth';
  import type { EventPricing } from '@/interfaces';

  defineProps<{
    pricings?: EventPricing[];
  }>();

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const shareButtonText = ref<string>('Partager');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getCapacityColor = (availableCapacity: number) => {
    if (availableCapacity === 0) return 'text-red-600';
    if (availableCapacity <= 10) return 'text-orange-500';
    return 'text-green-600';
  };

  const participer = () => {
    router.push({
      name: 'EventRegistration',
      params: {
        id: route.params.associationId,
        eventId: route.params.id,
      },
    });
  };

  const partagerEvent = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      shareButtonText.value = 'Copié';
      setTimeout(() => {
        shareButtonText.value = 'Partager';
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
    }
  };
</script>
