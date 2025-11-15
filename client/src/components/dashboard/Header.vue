<template>
  <div
    id="crm-header"
    class="flex h-16 flex-row flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 sm:h-24 md:px-12"
  >
    <h1 class="font-title text-secondary text-2xl leading-tight sm:text-3xl lg:text-4xl">
      <slot name="header"></slot>
    </h1>
    <button
      v-if="canCreateItems"
      class="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors md:text-base"
      @click="$emit('create:open')"
    >
      <Plus :class="width >= 460 ? 'mr-2' : ''" :size="20" />
      <span v-if="width >= 460">
        <slot name="add-button"></slot>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core';
  import { Plus } from 'lucide-vue-next';

  defineProps<{
    canCreateItems?: boolean;
  }>();

  defineEmits<{
    'create:open': [];
  }>();

  const { width } = useWindowSize();
</script>
