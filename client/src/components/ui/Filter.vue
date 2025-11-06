<template>
  <!-- Filter Fields -->
  <div class="space-y-3 sm:space-y-4">
    <!-- Name Filter -->
    <div v-if="hasNameFilter" class="space-y-1">
      <label class="block text-sm font-medium text-gray-700">
        {{ nameLabel }}
      </label>
      <input
        v-model="localFilters.name"
        type="text"
        class="focus:ring-secondary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
        :placeholder="namePlaceholder"
      />
    </div>

    <!-- Order Filter -->
    <div v-if="hasOrderFilter" class="flex items-center gap-2">
      <label class="shrink-0 text-sm font-medium text-gray-700">
        {{ orderLabel }}
      </label>
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-800"
        :aria-label="`Trier par ordre ${currentOrderLabel}`"
        @click="toggleSortOrder"
      >
        <span>{{ currentOrderLabel }}</span>
        <ChevronUp v-if="isAscending" class="h-4 w-4" />
        <ChevronDown v-else class="h-4 w-4" />
      </button>
    </div>

    <!-- Custom Filters Slot -->
    <slot name="custom-filters" :filters="localFilters" :update-filter="updateFilter" />
  </div>

  <!-- Filter Actions -->
  <div class="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-4">
    <Button variant="primary" size="sm" class="w-full sm:w-auto" @click="handleApplyFilters">
      {{ applyButtonText }}
    </Button>
    <button
      type="button"
      class="text-center text-sm text-gray-700 underline underline-offset-4 transition-colors hover:text-gray-900 sm:text-left"
      @click="handleClearFilters"
    >
      {{ clearButtonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Button } from '@/components/ui/button';
  import { ChevronUp, ChevronDown } from 'lucide-vue-next';

  // Types
  type SortOrder = 'ASC' | 'DESC';

  interface FilterOptions {
    name?: string;
    order?: SortOrder;
    [key: string]: any;
  }

  interface OrderOption {
    value: SortOrder;
    label: string;
  }

  // Default values
  const DEFAULT_FILTERS: FilterOptions = {
    name: '',
    order: 'ASC',
  };

  // Props
  const props = defineProps<{
    filters: string[];
    initialFilters?: Partial<FilterOptions>;
    title?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    orderLabel?: string;
    orderOptions?: OrderOption[];
    applyButtonText?: string;
    clearButtonText?: string;
  }>();

  // Emits
  const emit = defineEmits<{
    apply: [filters: FilterOptions];
    clear: [];
  }>();

  // Reactive state
  const localFilters = ref<FilterOptions>({
    ...DEFAULT_FILTERS,
    ...props.initialFilters,
  });

  // Computed properties
  const hasNameFilter = computed(() => props.filters.includes('name'));
  const hasOrderFilter = computed(() => props.filters.includes('order'));

  const isAscending = computed(() => localFilters.value.order === 'ASC');
  const currentOrderLabel = computed(() =>
    localFilters.value.order === 'ASC' ? 'croissant' : 'décroissant'
  );

  // Methods
  /**
   * Updates a specific filter value
   */
  const updateFilter = (key: string, value: any) => {
    localFilters.value[key] = value;
  };

  /**
   * Toggles the sort order between ASC and DESC
   */
  const toggleSortOrder = () => {
    localFilters.value.order = localFilters.value.order === 'ASC' ? 'DESC' : 'ASC';
  };

  /**
   * Applies the current filters and emits the apply event
   */
  const handleApplyFilters = () => {
    emit('apply', { ...localFilters.value });
  };

  /**
   * Clears all filters and emits the clear event
   */
  const handleClearFilters = () => {
    localFilters.value = { ...DEFAULT_FILTERS };
    emit('clear');
  };
</script>
