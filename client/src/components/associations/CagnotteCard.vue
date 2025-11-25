<template>
  <div
    class="relative h-56 w-full cursor-pointer overflow-hidden rounded-xl bg-gray-200 bg-cover bg-center shadow-md md:h-64 xl:h-72 2xl:h-96"
    :class="{ 'bg-gray-300': !item.image }"
    :style="item.image ? { backgroundImage: `url(${item.image})` } : {}"
    @click="$emit('view-details', item)"
  >
    <div
      class="absolute inset-0 z-10 h-full w-full"
      :style="
        color
          ? `background: linear-gradient(to top, ${color}CC 0%, ${color}88 35%, rgba(0,0,0,0) 70%)`
          : ''
      "
    ></div>
    <div
      class="absolute inset-0 h-full w-full"
      style="background-color: rgba(0, 0, 0, 0.14); z-index: 11"
    ></div>
    <div class="absolute right-0 bottom-0 left-0 z-20 p-4">
      <h3 class="font-title text-lg leading-tight text-white">{{ item.title }}</h3>

      <!-- Barre de progression -->
      <div class="mt-2">
        <div class="mb-1 flex justify-between text-sm text-white/90">
          <span>{{ formatCurrency(item.amount || 0) }}</span>
          <span>{{ formatCurrency(item.wantedAmount || 0) }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-white/20">
          <div
            class="h-2 rounded-full bg-[#009B77] transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <p class="mt-1 text-xs text-white/80">{{ Math.round(progressPercentage) }}% atteint</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { FundraisingCard } from '@/interfaces/fundraising.interface';

  // Props
  const props = defineProps<{
    item: FundraisingCard;
    color?: string;
  }>();

  // Emits
  defineEmits<{
    'view-details': [fundraising: FundraisingCard];
  }>();

  // Computed
  const progressPercentage = computed(() => {
    if (props.item.wantedAmount === 0) return 0;
    return Math.min((props.item.amount / props.item.wantedAmount) * 100, 100);
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
</style>
