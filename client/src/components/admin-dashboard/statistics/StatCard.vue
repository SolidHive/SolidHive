<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="truncate text-sm font-medium">{{ title }}</CardTitle>
      <component :is="icon" class="text-muted-foreground h-4 w-4 shrink-0" />
    </CardHeader>
    <CardContent class="flex-grow">
      <div class="truncate text-2xl font-bold">{{ value }}</div>
      <p v-if="description" class="text-muted-foreground truncate text-xs">{{ description }}</p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import type { Component } from 'vue';

  defineProps<{
    title: string;
    value: number | string;
    description?: string;
    icon: Component;
  }>();
</script>
