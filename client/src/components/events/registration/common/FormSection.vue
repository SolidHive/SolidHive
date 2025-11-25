<template>
  <div class="rounded-lg border-2 border-gray-200 p-6">
    <h3 v-if="$slots.title" class="font-paragraph text-secondary mb-4 text-lg font-bold">
      <slot name="title" />
    </h3>
    <slot />
  </div>
</template>
