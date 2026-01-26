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
      <p class="font-paragraph mt-1 line-clamp-2 text-sm text-white">{{ item.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Announcement } from '@/interfaces';

  defineProps<{
    item: Announcement;
    color?: string;
  }>();

  defineEmits<{
    'view-details': [announcement: Announcement];
  }>();
</script>
