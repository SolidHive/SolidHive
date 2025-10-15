<template>
  <Carousel
    :items="items"
    title="Nos dernières annonces"
    itemClass="relative snap-start flex-shrink-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[38%] xl:w-[32%] 2xl:w-[28%] rounded-xl overflow-hidden shadow-md"
  >
    <template #item="{ item }">
      <div
        class="relative h-56 w-full bg-gray-200 bg-cover bg-center md:h-64 xl:h-72 2xl:h-96"
        :style="{ backgroundImage: `url(${item.image})` }"
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
        <div class="absolute bottom-0 left-0 right-0 z-20 p-4">
          <h3 class="font-title text-lg leading-tight text-white">{{ item.title }}</h3>
          <p class="font-paragraph mt-1 line-clamp-2 text-sm text-white">{{ item.description }}</p>
        </div>
      </div>
    </template>
  </Carousel>
</template>

<script setup lang="ts">
  import { toRef } from 'vue';
  import Carousel from '@/components/ui/Carousel.vue';

  const props = defineProps<{
    items?: Array<{ title: string; description: string; image: string }>;
    color?: string;
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
