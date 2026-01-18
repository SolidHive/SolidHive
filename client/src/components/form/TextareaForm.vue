<template>
  <div class="mb-4">
    <div class="mb-1 flex items-center">
      <label :for="inputName" class="font-paragraph text-foreground block">
        <slot name="label">{{ labelValue }}</slot>
      </label>
      <div v-if="$slots.hint" class="group relative ml-1.5">
        <div class="cursor-help">
          <Info class="text-muted-foreground hover:text-foreground h-4 w-4" />
        </div>
        <div
          class="bg-popover text-popover-foreground border-border absolute top-full left-1/2 z-10 mt-1 hidden w-64 -translate-x-1/2 transform rounded-md border px-3 py-2 shadow-lg group-hover:block"
        >
          <div class="font-paragraph text-sm">
            <slot name="hint" />
          </div>
          <div
            class="bg-popover border-border absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform border-t border-l"
          />
        </div>
      </div>
    </div>
    <textarea
      :id="inputName"
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows"
      :maxlength="maxLength"
      class="font-paragraph w-full rounded-lg border px-4 py-2"
      :class="errorState ? 'border-destructive' : 'border-border'"
      @input="handleInput"
      @blur="$emit('blur')"
    />
    <div class="mt-1 flex items-center justify-between">
      <p v-if="errorState" class="text-destructive text-sm">
        {{ errorMessage }}
      </p>
      <p v-if="maxLength" class="text-xs" :class="getCounterClass()">
        {{ modelValue?.length || 0 }} / {{ maxLength }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Info } from 'lucide-vue-next';

  const props = defineProps({
    labelValue: {
      type: String,
      required: false,
      default: '',
    },
    inputName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      required: false,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 3,
    },
    maxLength: {
      type: Number,
      required: false,
      default: null,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    errorState: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue', 'blur']);

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
  }

  function getCounterClass() {
    if (!props.maxLength) return 'text-muted-foreground';

    const length = props.modelValue?.length || 0;
    const percentage = (length / props.maxLength) * 100;

    if (percentage >= 100) {
      return 'text-destructive font-medium';
    } else if (percentage >= 90) {
      return 'text-orange-500 font-medium';
    } else if (percentage >= 75) {
      return 'text-yellow-600';
    }

    return 'text-muted-foreground';
  }
</script>
