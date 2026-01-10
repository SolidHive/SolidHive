<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex w-full items-center gap-2 sm:w-auto">
      <input
        :value="modelValue"
        type="text"
        placeholder="Rechercher..."
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-8 w-full rounded-md border px-2 py-1 text-xs file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-[300px] sm:px-3 sm:py-2 sm:text-sm"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: string;
  }>();

  defineEmits<{
    'update:modelValue': [value: string];
  }>();
</script>
