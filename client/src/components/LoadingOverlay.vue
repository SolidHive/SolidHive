<template>
  <div v-if="show" class="flex flex-col items-center justify-center py-8">
    <!-- Spinner -->
    <div class="relative h-12 w-12">
      <div
        class="border-t-accent absolute inset-0 animate-spin rounded-full border-4 border-gray-200"
      ></div>
    </div>

    <!-- Message -->
    <p v-if="message" class="font-paragraph text-muted-foreground mt-4 text-sm font-medium">
      {{ message }}
    </p>
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
      default: '',
    },
  });
</script>
