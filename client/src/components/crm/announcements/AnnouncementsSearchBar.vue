<template>
  <div class="mb-4 flex items-center gap-4">
    <div class="relative flex-1">
      <Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        :value="modelValue"
        type="text"
        placeholder="Rechercher une annonce par titre..."
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border py-2 pr-3 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Search } from 'lucide-vue-next';

  defineProps<{
    modelValue: string;
  }>();

  defineEmits<{
    'update:modelValue': [value: string];
  }>();
</script>
