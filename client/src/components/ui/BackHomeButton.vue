<template>
  <button class="mb-6 flex items-center gap-2 text-white hover:underline" @click="$emit('click')">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="h-5 w-5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
    <span>Retour à l'accueil</span>
  </button>
</template>

<script setup lang="ts">
  defineEmits(['click']);
</script>
