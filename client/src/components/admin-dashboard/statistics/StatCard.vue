<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="truncate text-sm font-medium">{{ title }}</CardTitle>
      <component :is="icon" class="text-muted-foreground h-4 w-4 shrink-0" />
    </CardHeader>
    <CardContent class="flex-grow">
      <div v-if="hasValue" class="truncate text-2xl font-bold">{{ value }}</div>
      <div v-else class="flex h-20 items-center justify-center">
        <p class="text-muted-foreground text-xs sm:text-sm">
          Il n'y a pas de données pour le moment
        </p>
      </div>
      <p v-if="description && hasValue" class="text-muted-foreground truncate text-xs">
        {{ description }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import type { Component } from 'vue';

  const props = defineProps<{
    title: string;
    value: number | string;
    description?: string;
    icon: Component;
  }>();

  const hasValue = computed(() => {
    if (typeof props.value === 'string') {
      return props.value.trim() !== '';
    }
    return props.value !== null && props.value !== undefined && props.value !== 0;
  });
</script>
