<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-black/50 transition-all duration-300"
        role="dialog"
        aria-live="polite"
    >
        <!-- Spinner simple -->
        <div
            class="w-16 h-16 border-4 border-gray-400/50 border-t-green-500 rounded-full animate-spin"
        ></div>

        <!-- Message (optionnel) -->
        <div
            v-if="message"
            class="mt-6 text-white font-medium text-lg tracking-wide"
        >
            {{ message }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: 'Chargement en cours...'
    }
});
</script>
