<script setup lang="ts">
  import { useAttrs, computed } from 'vue';
  import { cn } from '@/lib/utils';

  defineProps<{
    modelValue?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string];
  }>();

  const attrs = useAttrs();

  const filteredAttrs = computed(() => {
    const { class: _, modelValue: __, ...rest } = attrs;
    return rest;
  });

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
  };
</script>

<template>
  <textarea
    :value="modelValue"
    :class="
      cn(
        'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        attrs.class ?? ''
      )
    "
    v-bind="filteredAttrs"
    @input="handleInput"
  />
</template>
