<template>
  <div
    class="mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
  >
    <!-- Image -->
    <div class="p-4 pb-0">
      <div class="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        <img
          v-if="event.image"
          :src="event.image"
          :alt="event.title"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
        >
          <Calendar class="h-12 w-12 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Titre -->
      <h3 class="mb-2 line-clamp-2 text-lg font-semibold">
        {{ event.title }}
      </h3>

      <!-- Adresse -->
      <div class="mb-2 flex items-center text-sm">
        <MapPin class="mr-2 h-7 w-7" />
        <span>{{ formatAddress(event.address) }}</span>
      </div>

      <!-- Date -->
      <div class="mb-2 flex items-center text-sm">
        <Calendar class="mr-2 h-5 w-5" />
        <span>{{ formatDate(event.startDate) }}</span>
        <span v-if="event.endDate && event.endDate !== event.startDate">
          - {{ formatDate(event.endDate) }}
        </span>
      </div>

      <!-- Association -->
      <div class="mb-4 flex items-center text-xs font-medium text-gray-500">
        <span>Par {{ event.association?.name }}</span>
      </div>

      <!-- Bouton -->
      <Button
        variant="primary"
        size="sm"
        class="mt-auto w-full"
        @click="$emit('view-details', event)"
      >
        Voir plus de détails
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, MapPin } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import type { Event } from '@/interfaces/event.interface';

  // Props
  defineProps<{
    event: Event;
  }>();

  // Emits
  defineEmits<{
    'view-details': [event: Event];
  }>();

  // Methods
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatAddress = (address: Event['address']) => {
    if (!address) return 'Adresse non spécifiée';
    const parts = [address.street, address.city, address.postcode].filter(Boolean);
    return parts.join(', ');
  };
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
