<template>
  <button class="mb-6 flex items-center gap-2 text-white hover:underline" @click="$emit('click')">
    <ChevronLeft class="h-5 w-5" />
    <span>Retour à l'accueil</span>
  </button>
</template>

<script setup lang="ts">
  import { ChevronLeft } from 'lucide-vue-next';

  defineEmits(['click']);
</script>
