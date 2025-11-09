<template>
  <div
    id="crm-header"
    class="flex h-16 flex-row flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 sm:h-24 md:px-12"
  >
    <h1 class="font-title text-secondary text-2xl leading-tight sm:text-3xl lg:text-4xl">
      {{ $route.meta.header || 'No Header Found' }}
    </h1>
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>
