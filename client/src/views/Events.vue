<template>
  <PageContainer>
    <!-- Header -->
    <EventsHeader :total-events="totalItems" />

    <!-- Filters -->
    <EventFilters v-model:filters="filters" @apply="applyFilters" />

    <!-- Loading State -->
    <LoadingOverlay v-if="isLoading" message="Chargement des événements..." />

    <!-- Events Grid -->
    <div v-else-if="events.length > 0" class="mt-6 space-y-6">
      <!-- View Mode Toggle & Pagination Info -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-paragraph text-muted-foreground text-sm">
          Page {{ currentPage }} sur {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            :class="[
              'font-paragraph flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-foreground hover:bg-muted/80',
            ]"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid :size="16" />
            Grille
          </button>
          <button
            :class="[
              'font-paragraph flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-foreground hover:bg-muted/80',
            ]"
            @click="viewMode = 'list'"
          >
            <List :size="16" />
            Liste
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="event in events"
          :key="event.id"
          class="group cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          @click="openEventDetail(event)"
        >
          <EventCard :item="event" />
        </div>
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <EventListItem
          v-for="event in events"
          :key="event.id"
          :event="event"
          @click="openEventDetail(event)"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="totalPages > 1"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :current-page="currentPage"
        @update:current-page="changePage"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="py-16 text-center">
      <div class="mx-auto max-w-md space-y-6">
        <div
          class="bg-secondary/10 mx-auto flex h-24 w-24 items-center justify-center rounded-full sm:h-32 sm:w-32"
        >
          <Calendar :size="48" class="text-secondary sm:h-16 sm:w-16" />
        </div>
        <div>
          <h3 class="font-subtitle text-foreground text-xl sm:text-2xl">Aucun événement trouvé</h3>
          <p class="font-paragraph text-muted-foreground mt-2 text-sm sm:text-base">
            Essayez de modifier vos filtres ou revenez plus tard pour découvrir de nouveaux
            événements.
          </p>
        </div>
        <button
          class="bg-primary font-paragraph text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm shadow-lg transition-all sm:px-6 sm:py-3 sm:text-base"
          @click="
            filters = {
              search: '',
              isPaid: null,
              startDate: null,
              endDate: null,
            };
            applyFilters();
          "
        >
          <RotateCcw :size="18" class="sm:h-5 sm:w-5" />
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-if="selectedEvent"
      :event="selectedEvent"
      :is-open="isModalOpen"
      @close="closeEventDetail"
    />
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import PageContainer from '@/components/PageContainer.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import EventCard from '@/components/associations/EventCard.vue';
  import EventListItem from '@/components/events/EventListItem.vue';
  import EventFilters from '@/components/events/EventFilters.vue';
  import EventDetailModal from '@/components/events/EventDetailModal.vue';
  import EventsHeader from '@/components/events/EventsHeader.vue';
  import { LayoutGrid, List, RotateCcw, Calendar } from 'lucide-vue-next';
  import Pagination from '@/components/ui/Pagination.vue';
  import Database from '@/utils/database.utils';
  import type { Event } from '@/interfaces/event.interface';

  const isLoading = ref(true);
  const events = ref<Event[]>([]);
  const selectedEvent = ref<Event | null>(null);
  const isModalOpen = ref(false);
  const viewMode = ref<'grid' | 'list'>('grid');
  const currentPage = ref(1);
  const itemsPerPage = ref(12);
  const totalPages = ref(1);
  const totalItems = ref(0);

  // Filters
  const filters = ref({
    search: '',
    isPaid: null as boolean | null,
    startDate: null as string | null,
    endDate: null as string | null,
  });

  const fetchEvents = async () => {
    try {
      isLoading.value = true;

      // Calculer skip basé sur la page courante
      const skip = (currentPage.value - 1) * itemsPerPage.value;

      // Construire les paramètres avec filtres
      const params: any = {
        skip,
        take: itemsPerPage.value,
      };

      // Ajouter les filtres s'ils sont définis
      if (filters.value.search) {
        params.search = filters.value.search;
      }

      if (filters.value.isPaid !== null) {
        params.isPaid = filters.value.isPaid;
      }

      if (filters.value.startDate) {
        params.startDate = filters.value.startDate;
      }

      if (filters.value.endDate) {
        params.endDate = filters.value.endDate;
      }

      const response = await Database.getAll('events', params);

      // Si la réponse a une structure avec data et meta
      if (response.data && response.meta) {
        events.value = response.data;
        totalItems.value = response.meta.total;
        totalPages.value = response.meta.totalPages;
      } else if (Array.isArray(response)) {
        // Si la réponse est directement un tableau (fallback)
        events.value = response;
        totalItems.value = response.length;
        totalPages.value = Math.ceil(response.length / itemsPerPage.value);
      } else {
        events.value = [];
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      events.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const applyFilters = () => {
    currentPage.value = 1;
    fetchEvents();
  };

  const changePage = (page: number) => {
    currentPage.value = page;
    fetchEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEventDetail = (event: Event) => {
    selectedEvent.value = event;
    isModalOpen.value = true;
  };

  const closeEventDetail = () => {
    isModalOpen.value = false;
    setTimeout(() => {
      selectedEvent.value = null;
    }, 300);
  };

  onMounted(() => {
    fetchEvents();
  });
</script>
