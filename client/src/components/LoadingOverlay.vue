<template>
  <div class="flex flex-col items-center justify-center py-8">
    <!-- Spinner -->
    <div class="relative h-12 w-12">
      <div
        class="border-t-primary absolute inset-0 animate-spin rounded-full border-4 border-gray-200"
      ></div>
    </div>

    <!-- Message -->
    <p v-if="message" class="mt-4 text-sm font-medium text-gray-600">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    message: {
      type: String,
      default: '',
    },
  });
</script>
