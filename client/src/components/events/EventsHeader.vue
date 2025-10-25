<template>
  <div class="space-y-6">
    <div class="bg-secondary text-secondary-foreground rounded-2xl p-6 shadow-lg sm:p-8 lg:p-12">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <!-- Left Content -->
        <div class="flex-1">
          <!-- Title & Description -->
          <div>
            <h1 class="font-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Événements</h1>
            <p
              class="font-paragraph text-secondary-foreground/90 mt-3 max-w-3xl text-base sm:mt-4 sm:text-lg lg:text-xl"
            >
              Découvrez tous les événements organisés par nos associations
            </p>
          </div>

          <!-- Stats -->
          <div v-if="totalEvents > 0" class="mt-4 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
            <div
              class="bg-secondary-foreground/10 flex items-center gap-2 rounded-xl px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2"
            >
              <Calendar :size="16" class="text-secondary-foreground sm:h-[18px] sm:w-[18px]" />
              <span class="font-subtitle text-secondary-foreground text-sm sm:text-base">
                {{ totalEvents }} {{ totalEvents > 1 ? 'événements' : 'événement' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar } from 'lucide-vue-next';

  defineProps<{
    totalEvents: number;
  }>();
</script>
