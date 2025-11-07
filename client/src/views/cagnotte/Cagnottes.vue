<template>
  <PageContainer>
    <!-- Page Header -->
    <PageHeader title="Cagnottes" subtitle="Découvrez et contribuez aux cagnottes solidaires" />

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
                  cagnottes trouvées
                </p>
              </div>
            </template>
          </Filter>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-3">
        <section class="space-y-6">
          <!-- Fundraisings Grid -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <!-- Loading State -->
            <div v-if="isLoading" class="col-span-full flex justify-center py-12">
              <LoadingOverlay :show="true" message="Chargement des cagnottes..." />
            </div>

            <!-- Fundraisings Cards -->
            <CagnotteCard
              v-else-if="hasFundraisings"
              v-for="fundraising in allFundraisings"
              :key="fundraising.id"
              :cagnotte="fundraising"
              @view-details="handleViewDetails"
            />
          </div>

          <!-- Empty State -->
          <div
            v-if="!isLoading && hasNoFundraisings"
            class="border-muted rounded-xl border border-dashed p-8 text-center"
          >
            <p class="text-gray-600">Aucune cagnotte trouvée.</p>
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
  import CagnotteCard from '@/components/cagnottes/CagnotteCard.vue';

  // Utility imports
  import Database from '@/utils/database.utils';

  // Type imports
  import type { FundraisingCard as FundraisingCardType } from '@/interfaces/fundraising.interface';

  // Types
  type SortOrder = 'ASC' | 'DESC';
  type FundraisingFilters = {
    name?: string;
    order?: SortOrder;
    association?: string;
    date?: string;
  };

  // Constants
  const ITEMS_PER_PAGE = 10;
  const DEFAULT_FILTERS: FundraisingFilters = {
    order: 'DESC',
  };

  // Router
  const router = useRouter();

  // Reactive state
  const allFundraisings = ref<FundraisingCardType[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const currentFilters = ref<FundraisingFilters>(DEFAULT_FILTERS);

  // Computed properties

  const customFields = computed(() => [
    {
      key: 'name',
      type: 'text' as const,
      label: 'Titre de la cagnotte',
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

  const hasNoFundraisings = computed(() => allFundraisings.value.length === 0);
  const hasFundraisings = computed(() => allFundraisings.value.length > 0);

  // Methods
  /**
   * Loads fundraisings with pagination and filters
   */
  const loadFundraisings = async (page = 1) => {
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

      const response = await Database.getAll('fundraisings', options);
      allFundraisings.value = response.data || [];
      totalItems.value = response.total || 0;
    } catch (err) {
      error.value = 'Impossible de charger les cagnottes. Veuillez réessayer.';
      console.error('Error loading fundraisings:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Handles page change from pagination component
   */
  const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadFundraisings(page);
  };

  /**
   * Handles filter application
   */
  const handleApplyFilters = (filters: FundraisingFilters) => {
    currentFilters.value = filters;
    currentPage.value = 1; // Reset to first page
    loadFundraisings(1);
  };

  /**
   * Handles filter clearing
   */
  const handleClearFilters = () => {
    currentFilters.value = { ...DEFAULT_FILTERS };
    currentPage.value = 1;
    loadFundraisings(1);
  };

  /**
   * Gère le clic sur "Voir plus de détails"
   */
  const handleViewDetails = (fundraising: FundraisingCardType) => {
    router.push(`/association/${fundraising.association.id}/fundraising/${fundraising.id}`);
  };

  // Lifecycle
  onMounted(() => {
    loadFundraisings();
  });
</script>
