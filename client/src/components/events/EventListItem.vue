<template>
  <div
    class="bg-card group cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl"
    @click="$emit('click')"
  >
    <div class="flex flex-col gap-4 p-4 sm:flex-row sm:p-6">
      <!-- Image -->
      <div
        class="bg-muted relative h-48 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-48"
      >
        <img
          v-if="event.image"
          :src="event.image"
          :alt="event.title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <Calendar :size="64" class="text-muted-foreground" />
        </div>
        <!-- Price badge on image -->
        <div class="absolute right-3 top-3">
          <span
            :class="[
              'font-paragraph rounded-full px-3 py-1.5 text-sm shadow-lg backdrop-blur-sm',
              event.amount && event.amount > 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/90 text-accent',
            ]"
          >
            {{ event.amount && event.amount > 0 ? `${event.amount}€` : 'Gratuit' }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col justify-between gap-3">
        <div>
          <h3
            class="font-subtitle text-foreground group-hover:text-secondary text-lg transition-colors sm:text-xl"
          >
            {{ event.title }}
          </h3>
          <p class="font-paragraph text-muted-foreground mt-2 line-clamp-2 text-sm sm:text-base">
            {{ event.description }}
          </p>
        </div>

        <div class="font-paragraph flex flex-wrap items-center gap-3 text-xs sm:gap-4 sm:text-sm">
          <!-- Date -->
          <div class="flex items-center gap-2">
            <div
              class="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8"
            >
              <Calendar :size="14" class="text-primary sm:h-4 sm:w-4" />
            </div>
            <span class="text-foreground">{{ formatDate(event.startDate) }}</span>
          </div>

          <!-- Location -->
          <div v-if="event.address" class="flex items-center gap-2">
            <div
              class="bg-accent/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8"
            >
              <MapPin :size="14" class="text-accent sm:h-4 sm:w-4" />
            </div>
            <span class="text-foreground">{{ event.address.city }}</span>
          </div>

          <!-- Association (si disponible) -->
          <div v-if="(event as any).association" class="flex items-center gap-2">
            <div
              class="bg-secondary/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8"
            >
              <Users :size="14" class="text-secondary sm:h-4 sm:w-4" />
            </div>
            <span class="text-foreground">{{ (event as any).association.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, MapPin, Users } from 'lucide-vue-next';
  import type { Event } from '@/interfaces/event.interface';

  defineProps<{
    event: Event;
  }>();

  defineEmits<{
    click: [];
  }>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
</script>
