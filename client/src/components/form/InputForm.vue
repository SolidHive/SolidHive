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
    <div class="relative">
      <input
        :id="inputName"
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        :class="
          inputClass || [
            'font-paragraph w-full rounded-lg border px-4 py-2 pr-10',
            errorState ? 'border-destructive' : 'border-border',
          ]
        "
        @input="handleInput"
        @blur="$emit('blur')"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
        @click="togglePasswordVisibility"
      >
        <Eye v-if="showPassword" class="text-muted-foreground h-5 w-5" />
        <EyeOff v-else class="text-muted-foreground h-5 w-5" />
      </button>
    </div>
    <p v-if="errorState" class="text-destructive mt-1 text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Eye, EyeOff, Info } from 'lucide-vue-next';

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
    inputClass: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:modelValue', 'blur']);

  const showPassword = ref(false);

  const isPassword = computed(() => props.type === 'password');

  const inputType = computed(() => {
    if (isPassword.value) {
      return showPassword.value ? 'text' : 'password';
    }
    return props.type;
  });

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
  }

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
  }
</script>
