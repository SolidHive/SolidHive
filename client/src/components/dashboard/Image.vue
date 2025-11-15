<template>
  <div v-if="src && !error">
    <img
      :src="src"
      class="h-12 w-12 cursor-zoom-in rounded-md object-cover transition-opacity hover:opacity-80"
      @error="error = true"
      @click="zoomed = true"
    />

    <div
      v-if="zoomed"
      class="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 backdrop-blur-sm"
      @click="zoomed = false"
    >
      <img :src="src" class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
    </div>
  </div>
  <div v-else class="text-muted-foreground">N/A</div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';

  defineProps<{
    src: string | null;
  }>();

  const error = ref(false);
  const zoomed = ref(false);

  watch(zoomed, (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
</script>
