<template>
  <section class="w-full">
    <h2 class="font-title text-secondary mb-6 text-2xl">Qui sommes-nous ?</h2>
    <div class="flex flex-col items-stretch md:flex-row md:items-center md:gap-6">
      <img
        v-if="aboutImage"
        :src="aboutImage"
        alt="about image"
        class="mx-auto h-64 w-full rounded-xl object-cover md:mx-0 md:h-96 md:w-96 lg:h-96 lg:w-96 2xl:h-[420px] 2xl:w-[640px]"
      />

      <div class="mt-6 flex w-full flex-col justify-center md:mt-0 md:flex-1">
        <p class="font-paragraph text-sm leading-relaxed md:text-base">{{ aboutText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    aboutText?: string | null;
    aboutImage?: string | null;
  }>();

  const aboutText = computed(() => props.aboutText ?? '');
  const aboutImage = computed(() => props.aboutImage ?? null);
</script>
