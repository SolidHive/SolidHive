<template>
  <button class="mb-6 flex items-center gap-2 text-white hover:underline" @click="goBack">
    <ChevronLeft class="h-5 w-5" />
    <span>Retour en arrière</span>
  </button>
</template>

<script setup lang="ts">
  import { ChevronLeft } from 'lucide-vue-next';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const goBack = () => {
    router.go(-1);
  };
</script>
