<template>
  <Carousel
    :items="items"
    title="Nos cagnottes"
    item-class="relative snap-start flex-shrink-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[38%] xl:w-[32%] 2xl:w-[28%]"
  >
    <template #item="{ item }">
      <CagnotteCard :item="item" :color="color" @view-details="$emit('view-details', $event)" />
    </template>
    <template #empty-message>Aucune cagnotte de financement n'est active pour le moment.</template>
  </Carousel>
</template>

<script setup lang="ts">
  import { toRef } from 'vue';
  import Carousel from '@/components/ui/Carousel.vue';
  import CagnotteCard from '../CagnotteCard.vue';
  import type { FundraisingCard } from '@/interfaces/fundraising.interface';

  const props = defineProps<{
    items?: FundraisingCard[];
    color?: string;
  }>();
  const items = toRef(props, 'items') || [];
  const color = toRef(props, 'color');

  // Emits
  defineEmits<{
    'view-details': [fundraising: FundraisingCard];
  }>();
</script>
