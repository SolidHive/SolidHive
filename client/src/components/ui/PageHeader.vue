<template>
  <header class="text-center">
    <h1 class="font-title text-secondary mb-4 text-2xl md:text-4xl">{{ title }}</h1>
    <p v-if="subtitle" class="text-lg text-gray-600">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue';

  defineProps<{
    title: string;
    subtitle?: string;
  }>();
</script>
