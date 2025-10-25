<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="close"
      >
        <div
          class="bg-card relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl shadow-xl"
        >
          <!-- Close Button -->
          <button
            class="bg-card/90 text-muted-foreground hover:bg-card hover:text-foreground absolute right-4 top-4 z-10 rounded-full p-2 transition-colors"
            @click="close"
          >
            <X :size="24" />
          </button>

          <!-- Event Image -->
          <div class="bg-muted relative h-64 w-full overflow-hidden md:h-96">
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Calendar :size="96" class="text-muted-foreground" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 md:p-8">
            <!-- Title and Price -->
            <div class="mb-6 flex items-start justify-between gap-4">
              <h2 class="font-title text-foreground text-xl sm:text-2xl">{{ event.title }}</h2>
              <div v-if="event.amount !== undefined" class="flex-shrink-0">
                <span
                  v-if="event.amount > 0"
                  class="bg-primary font-subtitle text-primary-foreground rounded-full px-3 py-1.5 text-base sm:px-4 sm:py-2 sm:text-lg"
                >
                  {{ event.amount }}€
                </span>
                <span
                  v-else
                  class="bg-card/90 font-subtitle text-accent rounded-full px-3 py-1.5 text-base sm:px-4 sm:py-2 sm:text-lg"
                >
                  Gratuit
                </span>
              </div>
            </div>

            <!-- Event Info -->
            <div class="mb-6 space-y-4">
              <!-- Date and Time -->
              <div class="flex items-start gap-3">
                <Calendar :size="18" class="text-primary mt-1 flex-shrink-0 sm:h-5 sm:w-5" />
                <div>
                  <p class="font-subtitle text-foreground text-sm sm:text-base">
                    {{ formatDate(event.startDate) }}
                  </p>
                  <p
                    v-if="event.endDate"
                    class="font-paragraph text-muted-foreground text-xs sm:text-sm"
                  >
                    Jusqu'au {{ formatDate(event.endDate) }}
                  </p>
                </div>
              </div>

              <!-- Location -->
              <div v-if="event.address" class="flex items-start gap-3">
                <MapPin :size="18" class="text-accent mt-1 flex-shrink-0 sm:h-5 sm:w-5" />
                <div>
                  <p class="font-subtitle text-foreground text-sm sm:text-base">
                    {{ event.address.street }}
                  </p>
                  <p class="font-paragraph text-muted-foreground text-xs sm:text-sm">
                    {{ event.address.postcode }} {{ event.address.city }},
                    {{ event.address.country }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
              <h3 class="font-subtitle text-foreground mb-3 text-lg sm:text-xl">
                À propos de l'événement
              </h3>
              <p
                class="font-paragraph text-muted-foreground whitespace-pre-line text-sm sm:text-base"
              >
                {{ event.description }}
              </p>
            </div>

            <!-- Action Button -->
            <div class="flex gap-4">
              <button
                class="bg-accent font-subtitle text-accent-foreground hover:bg-accent/90 flex-1 rounded-xl px-6 py-3 text-sm shadow-lg transition-colors sm:text-base"
                @click="registerToEvent"
              >
                {{
                  event.amount && event.amount > 0
                    ? "S'inscrire et payer"
                    : "S'inscrire gratuitement"
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { X, Calendar, MapPin } from 'lucide-vue-next';
  import type { Event } from '@/interfaces/event.interface';

  defineProps<{
    event: Event;
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const close = () => {
    emit('close');
  };

  const registerToEvent = () => {
    // TODO: Implement event registration logic
    console.log('Register to event');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active > div,
  .modal-leave-active > div {
    transition: transform 0.3s ease;
  }

  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: scale(0.95);
  }
</style>
