<template>
  <PageContainer>
    <!-- Page Header -->
    <PageHeader
      title="Rechercher une association"
      subtitle="Découvrez les associations partenaires de SolidHive"
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
                  associations trouvées
                </p>
              </div>
            </template>
          </Filter>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-3">
        <section class="space-y-6">
          <!-- Loading State -->
          <LoadingOverlay v-if="isLoading" :show="true" message="Chargement des associations..." />

          <!-- Empty State -->
          <div v-else-if="hasNoAssociations" class="py-12 text-center">
            <h3 class="text-secondary mb-2 text-xl font-semibold">Aucune association trouvée</h3>
            <p class="text-gray-600">Les associations seront bientôt disponibles.</p>
          </div>

          <!-- Associations Grid -->
          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <article
              v-for="association in associations"
              :key="association.id"
              class="group relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 bg-cover bg-center shadow-md transition-all duration-300 hover:shadow-lg md:aspect-auto md:h-32 xl:h-40 2xl:h-48"
              :class="{ 'bg-gray-300': !association.logo }"
              :style="associationBackgroundStyle(association)"
            >
              <!-- Gradient Overlay -->
              <div
                class="absolute inset-0 z-10 h-full w-full"
                :style="associationGradientStyle(association)"
              />

              <!-- Dark Overlay -->
              <div class="absolute inset-0 z-20 h-full w-full bg-black/15" />

              <!-- Association Name -->
              <div
                class="absolute right-0 bottom-0 left-0 z-30 -translate-y-12 p-2 transition-transform duration-300 md:translate-y-0 md:p-4 md:group-hover:-translate-y-12"
              >
                <h3 class="text-md font-title leading-tight text-white md:text-lg">
                  {{ association.name }}
                </h3>
              </div>

              <!-- Action Button -->
              <div
                class="absolute right-0 bottom-0 left-0 z-20 flex translate-y-0 items-center justify-center p-2 transition-transform duration-300 md:translate-y-full md:p-4 md:group-hover:translate-y-0"
              >
                <Button
                  :style="associationButtonStyle(association)"
                  variant="secondary"
                  size="sm"
                  class="md:size-default w-full"
                  @click="navigateToAssociation(association.id)"
                >
                  Voir l'association
                </Button>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <div v-if="!isLoading && hasAssociations" class="mt-8">
            <Pagination
              :total-items="totalItems"
              :items-per-page="ITEMS_PER_PAGE"
              :current-page="currentPage"
              @update:current-page="handlePageChange"
            />
          </div>
        </section>
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
  import { Button } from '@/components/ui/button';
  import Pagination from '@/components/ui/Pagination.vue';
  import Filter from '@/components/ui/Filter.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import PageHeader from '@/components/ui/PageHeader.vue';

  // Utility imports
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';

  // Type imports
  import type { FileMetadata } from '@/interfaces/file.interface';
  import type { Association } from '@/interfaces/association.interface';

  // Types
  type SortOrder = 'ASC' | 'DESC';
  type AssociationFilters = {
    name?: string;
    order?: SortOrder;
  };

  // Constants
  const ITEMS_PER_PAGE = 10;
  const DEFAULT_FILTERS: AssociationFilters = {
    order: 'DESC',
  };

  // Router
  const router = useRouter();

  // Reactive state
  const associations = ref<Association[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const currentFilters = ref<AssociationFilters>(DEFAULT_FILTERS);

  // Computed properties
  const customFields = computed(() => [
    {
      key: 'name',
      type: 'text' as const,
      label: "Nom de l'association",
      placeholder: 'Rechercher par nom...',
    },
    {
      key: 'order',
      type: 'order' as const,
      label: 'Ordre :',
    },
  ]);

  const hasNoAssociations = computed(() => associations.value.length === 0);
  const hasAssociations = computed(() => associations.value.length > 0);

  // Methods
  /**
   * Loads associations with pagination and filters
   */
  const loadAssociations = async (page = 1) => {
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

      if (currentFilters.value.order) {
        options.orderBy = currentFilters.value.order;
      }

      const response = await Database.getAll('associations', options);
      associations.value = response.data || [];
      totalItems.value = response.total || 0;

      // Load logos in parallel
      await Promise.all(
        associations.value.map(async (association: Association) => {
          association.logo = await loadAssociationLogo(association.id);
        })
      );
    } catch (err) {
      error.value = 'Impossible de charger les associations. Veuillez réessayer.';
      console.error('Error loading associations:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Loads the logo for a specific association
   */
  const loadAssociationLogo = async (associationId: string): Promise<string | undefined> => {
    const files: FileMetadata[] = [];
    let index = 0;

    while (true) {
      try {
        const response = await api.get(`/files/Association/${associationId}/metadata`, {
          params: { index },
        });
        if (response.data) {
          files.push(response.data);
          index++;
        } else {
          break;
        }
      } catch (err: any) {
        if (err.response?.status === 404) break;
        console.error('Error loading file metadata:', err);
        break;
      }
    }

    const logoFile = files.find((f) => f.purpose === 'logo');
    return logoFile ? `/files/Association/${associationId}?index=${logoFile.index}` : undefined;
  };

  /**
   * Navigates to the association detail page
   */
  const navigateToAssociation = (id: string) => {
    router.push(`/association/${id}`);
  };

  /**
   * Checks if a color is light (for text contrast)
   */
  const isLightColor = (color?: string): boolean => {
    if (!color) return false;

    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5;
  };

  /**
   * Handles page change from pagination component
   */
  const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadAssociations(page);
  };

  /**
   * Handles filter application
   */
  const handleApplyFilters = (filters: AssociationFilters) => {
    currentFilters.value = filters;
    currentPage.value = 1; // Reset to first page
    loadAssociations(1);
  };

  /**
   * Handles filter clearing
   */
  const handleClearFilters = () => {
    currentFilters.value = { ...DEFAULT_FILTERS };
    currentPage.value = 1;
    loadAssociations(1);
  };

  /**
   * Returns the background style for an association card
   */
  const associationBackgroundStyle = (association: Association) => {
    return association.logo ? { backgroundImage: `url(${association.logo})` } : {};
  };

  /**
   * Returns the gradient overlay style for an association card
   */
  const associationGradientStyle = (association: Association) => {
    return association.primaryColor
      ? `background: linear-gradient(to top, ${association.primaryColor}CC 0%, ${association.primaryColor}88 35%, rgba(0,0,0,0) 70%)`
      : '';
  };

  /**
   * Returns the button style for an association card
   */
  const associationButtonStyle = (association: Association) => {
    return {
      backgroundColor: association.primaryColor,
      color: isLightColor(association.primaryColor) ? 'black' : 'white',
    };
  };

  // Lifecycle
  onMounted(() => {
    loadAssociations();
  });
</script>
