<template>
    <div class="mb-4">
        <div class="flex items-center mb-1">
            <label :for="inputName" class="block text-gray-700">
                {{ labelValue }}
            </label>
            <div v-if="$slots.hint" class="relative ml-1.5 group">
                <div class="cursor-help">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-gray-400 hover:text-gray-600"
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
                    class="hidden group-hover:block absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-2 w-64 rounded-md shadow-lg bg-white border border-gray-100"
                >
                    <div class="text-sm text-gray-600">
                        <slot name="hint"></slot>
                    </div>
                    <div
                        class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-t border-l border-gray-100"
                    ></div>
                </div>
            </div>
        </div>
        <input
            :id="inputName"
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            class="w-full px-4 py-2 border rounded-lg"
            :class="errorState ? 'border-red-500' : 'border-gray-300'"
            @input="handleInput"
            @blur="$emit('blur')"
        />
        <p v-if="errorState" class="mt-1 text-sm text-red-600">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps({
    labelValue: {
        type: String,
        required: true
    },
    inputName: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
        required: true
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    errorMessage: {
        type: String,
        default: ''
    },
    errorState: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'blur']);

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}
</script>
