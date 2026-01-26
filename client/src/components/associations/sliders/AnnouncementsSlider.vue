<template>
  <Carousel
    :items="items"
    title="Nos dernières annonces"
    item-class="relative snap-start flex-shrink-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[38%] xl:w-[32%] 2xl:w-[28%]"
  >
    <template #item="{ item }">
      <AnnouncementCard :item="item" :color="color" @view-details="$emit('view-details', $event)" />
    </template>
    <template #empty-message>Aucune annonce n'a été publiée pour le moment.</template>
  </Carousel>
</template>

<script setup lang="ts">
  import { toRef } from 'vue';
  import Carousel from '@/components/ui/Carousel.vue';
  import AnnouncementCard from '../AnnouncementCard.vue';
  import type { Announcement } from '@/interfaces';

  const props = defineProps<{
    items?: Announcement[];
    color?: string;
  }>();

  defineEmits<{
    'view-details': [announcement: Announcement];
  }>();

  const items = toRef(props, 'items');
  const color = toRef(props, 'color');
</script>

<style scoped>
  .scroll-smooth {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .scroll-smooth::-webkit-scrollbar {
    display: none;
  }
</style>
