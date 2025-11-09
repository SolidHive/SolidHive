<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <input
        :value="modelValue"
        type="text"
        placeholder="Rechercher un rôle..."
        class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-[300px] rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
