<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300"
    role="dialog"
    aria-live="polite"
  >
    <!-- Spinner simple -->
    <div
      class="h-16 w-16 animate-spin rounded-full border-4 border-gray-400/50 border-t-green-500"
    ></div>

    <!-- Message (optionnel) -->
    <div v-if="message" class="mt-6 text-lg font-medium tracking-wide text-white">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: 'Chargement en cours...',
    },
  });
</script>
