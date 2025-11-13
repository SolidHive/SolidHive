<template>
  <PageContainer>
    <!-- Page Header -->
    <PageHeader
      title="Rechercher un événement"
      subtitle="Découvrez et participez aux événements solidaires"
    />

    <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
      <!-- Filters Sidebar -->
      <aside class="lg:col-span-1">
        <div class="sticky top-24 space-y-6">
          <Filter
            :initial-filters="currentFilters"
            :show-actions="true"
            apply-button-text="Appliquer les filtres"
            clear-button-text="Effacer les filtres"
            :custom-fields="customFields"
            @apply="handleApplyFilters"
            @clear="handleClearFilters"
          >
            <!-- Total Count -->
            <template #custom-filters>
              <div class="mt-4 rounded-lg border bg-gray-50 px-4 py-3">
                <p class="text-sm font-medium text-gray-700">
                  <span class="font-semibold">{{ totalItems }}</span>
                  événements trouvés
                </p>
              </div>
            </template>
          </Filter>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-3">
        <section class="space-y-6">
          <!-- Events Grid -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <!-- Loading State -->
            <div v-if="isLoading" class="col-span-full flex justify-center py-12">
              <LoadingOverlay :show="true" message="Chargement des événements..." />
            </div>

            <!-- Events Cards -->
            <EventCard
              v-for="event in allEvents"
              v-else-if="hasEvents"
              :key="event.id"
              :event="event"
              @view-details="handleViewDetails"
            />
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && hasNoEvents" class="py-12 text-center">
            <h3 class="text-secondary mb-2 text-xl font-semibold">Aucun événement trouvé</h3>
            <p class="text-gray-600">Les événements solidaires seront bientôt disponibles.</p>
          </div>
        </section>

        <!-- Pagination -->
        <div v-if="!isLoading && totalItems > ITEMS_PER_PAGE" class="mt-8">
          <Pagination
            :total-items="totalItems"
            :items-per-page="ITEMS_PER_PAGE"
            :current-page="currentPage"
            @update:current-page="handlePageChange"
          />
        </div>
      </main>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  // Vue imports
  import { computed, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  // Component imports
  import PageContainer from '@/components/PageContainer.vue';
  import PageHeader from '@/components/ui/PageHeader.vue';
  import Filter from '@/components/ui/Filter.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import EventCard from '@/components/events/EventCard.vue';

  // Utility imports
  import Database from '@/utils/database.utils';

  // Type imports
  import type { Event } from '@/interfaces/event.interface';

  // Types
  type SortOrder = 'ASC' | 'DESC';
  type EventFilters = {
    name?: string;
    order?: SortOrder;
    association?: string;
    date?: string;
  };

  // Constants
  const ITEMS_PER_PAGE = 10;
  const DEFAULT_FILTERS: EventFilters = {
    order: 'DESC',
  };

  // Router
  const router = useRouter();

  // Reactive state
  const allEvents = ref<Event[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const currentFilters = ref<EventFilters>(DEFAULT_FILTERS);

  // Computed properties

  const customFields = computed(() => [
    {
      key: 'name',
      type: 'text' as const,
      label: "Titre de l'événement",
      placeholder: 'Rechercher par titre...',
    },
    {
      key: 'association',
      type: 'text' as const,
      label: "Nom de l'association",
      placeholder: 'Rechercher par association...',
    },
    {
      key: 'order',
      type: 'order' as const,
      label: 'Ordre :',
    },
    {
      key: 'date',
      type: 'date' as const,
      label: 'Date',
      placeholder: 'Choisir une date...',
    },
  ]);

  const hasNoEvents = computed(() => allEvents.value.length === 0);
  const hasEvents = computed(() => allEvents.value.length > 0);

  // Methods
  /**
   * Loads events with pagination and filters
   */
  const loadEvents = async (page = 1) => {
    try {
      isLoading.value = true;
      error.value = null;

      const options: any = {
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      };

      if (currentFilters.value.name) {
        options.name = currentFilters.value.name;
      }

      if (currentFilters.value.association) {
        options.association = currentFilters.value.association;
      }

      if (currentFilters.value.date) {
        options.date = currentFilters.value.date;
      }

      if (currentFilters.value.order) {
        options.orderBy = currentFilters.value.order;
      }

      const response = await Database.getAll('events', options);
      allEvents.value = response.data || [];
      totalItems.value = response.total || 0;
    } catch (err) {
      error.value = 'Impossible de charger les événements. Veuillez réessayer.';
      console.error('Error loading events:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Handles page change from pagination component
   */
  const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadEvents(page);
  };

  /**
   * Handles filter application
   */
  const handleApplyFilters = (filters: EventFilters) => {
    currentFilters.value = filters;
    currentPage.value = 1; // Reset to first page
    loadEvents(1);
  };

  /**
   * Handles filter clearing
   */
  const handleClearFilters = () => {
    currentFilters.value = { ...DEFAULT_FILTERS };
    currentPage.value = 1;
    loadEvents(1);
  };

  /**
   * Gère le clic sur "Voir l'événement"
   */
  const handleViewDetails = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  // Lifecycle
  onMounted(() => {
    loadEvents();
  });
</script>
