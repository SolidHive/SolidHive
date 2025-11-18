<template>
  <section>
    <h2 class="font-title text-secondary mb-12 text-center text-2xl sm:text-3xl md:text-4xl">
      {{ t('home.stats.title') }}
    </h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="flex flex-col items-center text-center">
        <span class="font-title text-accent mb-4 text-3xl lg:text-5xl">126</span>
        <span class="font-paragraph text-sm leading-relaxed lg:text-lg">
          {{ t('home.stats.associations') }}
        </span>
      </div>
      <div class="flex flex-col items-center text-center">
        <span class="font-title text-accent mb-4 text-3xl lg:text-5xl">100%</span>
        <span class="font-paragraph text-sm leading-relaxed lg:text-lg">
          {{ t('home.stats.donations') }}
        </span>
      </div>
      <div class="flex flex-col items-center text-center">
        <span class="font-title text-accent mb-4 text-3xl lg:text-5xl">1642</span>
        <span class="font-paragraph text-sm leading-relaxed lg:text-lg">
          {{ t('home.stats.total') }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
