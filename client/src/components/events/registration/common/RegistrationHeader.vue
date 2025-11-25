<template>
  <div class="rounded-xl p-4 shadow-lg sm:p-6">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
      <!-- Informations de l'événement -->
      <div class="flex-1">
        <h1
          class="font-title text-secondary mb-2 text-xl font-black sm:text-2xl md:text-3xl lg:text-4xl"
        >
          {{ event?.title }}
        </h1>

        <RouterLink
          v-if="event?.association"
          :to="{ name: 'AssociationDetail', params: { id: event.association.id } }"
          class="text-primary inline-block text-sm font-medium underline sm:text-base md:text-lg"
        >
          {{ event.association.name }}
        </RouterLink>

        <div class="my-3 border-t border-gray-300 sm:my-4"></div>

        <p class="font-paragraph text-sm leading-relaxed sm:text-base">
          {{ event?.description }}
        </p>
      </div>

      <!-- Image de l'événement -->
      <div v-if="event?.image" class="hexagon-container">
        <svg width="0" height="0">
          <defs>
            <clipPath id="hexagon-clip-rounded" clipPathUnits="objectBoundingBox">
              <path
                d="M 0.42 0.06
                   Q 0.5 0, 0.58 0.06
                   L 0.91 0.26
                   Q 0.98 0.29, 0.98 0.36
                   L 0.98 0.64
                   Q 0.98 0.71, 0.91 0.74
                   L 0.58 0.94
                   Q 0.5 1, 0.42 0.94
                   L 0.09 0.74
                   Q 0.02 0.71, 0.02 0.64
                   L 0.02 0.36
                   Q 0.02 0.29, 0.09 0.26
                   Z"
              />
            </clipPath>
          </defs>
        </svg>
        <div class="hexagon border-secondary">
          <img :src="event.image" :alt="event.title" class="hexagon-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink } from 'vue-router';
  import type { Event } from '@/interfaces';

  defineProps<{
    event?: Event;
  }>();
</script>

<style scoped>
  .hexagon-container {
    position: relative;
    width: 180px;
    height: 200px;
    margin: 0 auto;
    padding: 8px;
    transform: rotate(-8deg);
  }

  @media (min-width: 640px) {
    .hexagon-container {
      width: 200px;
      height: 220px;
      transform: rotate(-10deg);
    }
  }

  @media (min-width: 768px) {
    .hexagon-container {
      width: 220px;
      height: 240px;
      transform: rotate(-12deg);
    }
  }

  .hexagon {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--secondary);
    clip-path: url(#hexagon-clip-rounded);
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hexagon-image {
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    object-fit: cover;
    clip-path: url(#hexagon-clip-rounded);
  }
</style>
