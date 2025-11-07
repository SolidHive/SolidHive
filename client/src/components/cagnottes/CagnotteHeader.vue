<template>
  <!-- Image -->
  <div class="relative aspect-4/2 w-full overflow-hidden rounded-xl bg-gray-200">
    <img v-if="image" :src="image" :alt="title" class="h-full w-full object-cover" />
    <div
      v-else
      class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
    >
      <Heart class="h-12 w-12 text-gray-400" />
    </div>
  </div>

  <!-- Titre de la cagnotte -->
  <h1 class="font-title text-secondary text-xl uppercase sm:text-2xl lg:text-3xl">
    {{ title }}
  </h1>

  <!-- Description complète -->
  <div>
    <p class="text-sm leading-relaxed sm:text-base">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { Heart } from 'lucide-vue-next';

  defineProps<{
    title: string;
    description: string;
    image?: string | null;
  }>();
</script>
