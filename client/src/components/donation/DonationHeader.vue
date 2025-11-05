<template>
  <div class="mb-4 flex flex-col items-center gap-3 sm:mb-6 sm:flex-row sm:gap-4">
    <!-- Logo de l'association -->
    <img
      v-if="association?.logo"
      :src="association.logo"
      :alt="association.name"
      class="h-16 w-16 shrink-0 rounded-full object-cover sm:h-18 sm:w-18 md:h-24 md:w-24"
    />
    <div
      v-else
      class="bg-accent/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-18 sm:w-18 md:h-24 md:w-24"
    >
      <span class="font-title text-accent text-base sm:text-lg">
        {{ association?.name?.charAt(0)?.toUpperCase() }}
      </span>
    </div>

    <!-- Titre -->
    <div class="text-center sm:text-left">
      <h1 class="text-secondary mb-1 text-lg font-semibold sm:mb-2 sm:text-xl md:text-3xl">
        Faire un don à :
      </h1>
      <p class="font-title text-secondary overflow-wrap-break-word text-xl sm:text-2xl md:text-4xl">
        {{ association?.name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Association } from '@/interfaces/association.interface';

  interface Props {
    association: Association | null;
  }

  defineProps<Props>();
</script>
