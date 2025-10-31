<template>
  <div class="mb-4">
    <div class="mb-1 flex items-center">
      <label :for="inputName" class="font-paragraph text-foreground block">
        <slot name="label">{{ labelValue }}</slot>
      </label>
      <div v-if="$slots.hint" class="group relative ml-1.5">
        <div class="cursor-help">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="text-muted-foreground hover:text-foreground h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
    <input
      :id="inputName"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      class="font-paragraph w-full rounded-lg border px-4 py-2"
      :class="errorState ? 'border-destructive' : 'border-border'"
      @input="handleInput"
      @blur="$emit('blur')"
    />
    <p v-if="errorState" class="text-destructive mt-1 text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  defineProps({
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
      type: [String, Number],
      required: true,
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
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
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
  }
</script>
