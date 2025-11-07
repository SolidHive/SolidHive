<template>
  <div
    class="mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
  >
    <!-- Image -->
    <div class="p-4 pb-0">
      <div class="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        <img
          v-if="cagnotte.image"
          :src="cagnotte.image"
          :alt="cagnotte.title"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
        >
          <Heart class="h-12 w-12 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Titre -->
      <h3 class="mb-2 line-clamp-2 text-lg font-semibold">
        {{ cagnotte.title }}
      </h3>

      <!-- Description -->
      <p class="mb-2 flex-1 text-sm text-gray-600">
        {{ truncatedDescription }}
      </p>

      <!-- Nom de l'association -->
      <p class="mb-4 text-xs font-medium text-gray-500">Par {{ cagnotte.association.name }}</p>

      <!-- Barre de progression -->
      <div class="mb-4">
        <div class="mb-1 flex justify-between text-sm text-gray-600">
          <span>{{ formatCurrency(cagnotte.amount) }}</span>
          <span>{{ formatCurrency(cagnotte.wantedAmount) }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-gray-200">
          <div
            class="h-2 rounded-full bg-[#009B77] transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <p class="mt-1 text-xs text-gray-500">{{ Math.round(progressPercentage) }}% atteint</p>
      </div>

      <!-- Bouton -->
      <Button
        variant="primary"
        size="sm"
        class="mt-auto w-full"
        @click="$emit('view-details', cagnotte)"
      >
        Voir plus de détails
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Heart } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import type { FundraisingCard } from '@/interfaces/fundraising.interface';

  // Props
  const props = defineProps<{
    cagnotte: FundraisingCard;
  }>();

  // Emits
  defineEmits<{
    'view-details': [fundraising: FundraisingCard];
  }>();

  // Computed
  const progressPercentage = computed(() => {
    if (props.cagnotte.wantedAmount === 0) return 0;
    return Math.min((props.cagnotte.amount / props.cagnotte.wantedAmount) * 100, 100);
  });

  const truncatedDescription = computed(() => {
    if (props.cagnotte.description.length <= 25) {
      return props.cagnotte.description;
    }
    return props.cagnotte.description.substring(0, 25) + '...';
  });

  // Methods
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
