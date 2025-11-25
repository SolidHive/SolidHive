<template>
  <Carousel
    :items="items"
    title="Nos événements"
    item-class="relative snap-start flex-shrink-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[38%] xl:w-[32%] 2xl:w-[28%]"
  >
    <template #item="{ item }">
      <EventCard :item="item" :color="color" />
    </template>
    <template #empty-message>Aucun événement n'est prévu pour le moment.</template>
  </Carousel>
</template>

<script setup lang="ts">
  import { toRef } from 'vue';
  import Carousel from '@/components/ui/Carousel.vue';
  import EventCard from '../EventCard.vue';

  const props = defineProps<{
    items?: Array<{ title: string; description: string; image: string | null }>;
    color?: string;
  }>();
  const items = toRef(props, 'items') || [];
  const color = toRef(props, 'color');
</script>
