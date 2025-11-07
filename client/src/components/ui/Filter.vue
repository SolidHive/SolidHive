<template>
  <!-- Filter Fields -->
  <div class="space-y-3 sm:space-y-4">
    <!-- Custom Fields -->
    <div v-for="field in customFields" :key="field.key" class="space-y-1">
      <!-- Order Filter -->
      <div v-if="field.type === 'order'" class="flex items-center gap-2">
        <label class="shrink-0 text-sm font-medium text-gray-700">
          {{ field.label }}
        </label>
        <button
          type="button"
          class="flex items-center gap-1 text-sm"
          :aria-label="`Trier par ordre ${currentOrderLabel}`"
          @click="toggleSortOrder"
        >
          <span class="font-semibold">{{ currentOrderLabel }}</span>
          <ChevronUp v-if="isAscending" class="h-4 w-4" />
          <ChevronDown v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- Text Input -->
      <template v-else>
        <label class="block text-sm font-medium text-gray-700">
          {{ field.label }}
        </label>

        <input
          v-if="field.type === 'text'"
          v-model="localFilters[field.key]"
          type="text"
          class="focus:ring-secondary w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
          :placeholder="field.placeholder || 'Rechercher...'"
        />

        <!-- Date Input -->
        <div v-else-if="field.type === 'date'" class="relative">
          <input
            :ref="
              (el) => {
                if (el) dateInputs[field.key] = el as HTMLInputElement;
              }
            "
            v-model="localFilters[field.key]"
            type="date"
            class="date-input focus:ring-secondary w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:outline-none"
            :placeholder="field.placeholder || 'Choisir une date...'"
            @change="updateFilter(field.key, ($event.target as HTMLInputElement).value)"
            @click="() => openDatePicker(field.key)"
          />
          <Calendar
            class="calendar-icon absolute top-1/2 right-3 z-20 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-600"
            @click="() => openDatePicker(field.key)"
          />
        </div>
      </template>
    </div>

    <!-- Custom Filters Slot -->
    <slot name="custom-filters" :filters="localFilters" :update-filter="updateFilter" />
  </div>

  <!-- Filter Actions -->
  <div
    v-if="showActions"
    class="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-4 lg:flex-col lg:items-start lg:gap-2 xl:flex-row xl:items-center xl:gap-4"
  >
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
  import { ChevronUp, ChevronDown, Calendar } from 'lucide-vue-next';

  // Types
  type SortOrder = 'ASC' | 'DESC';

  interface FilterOptions {
    name?: string;
    order?: SortOrder;
    [key: string]: any;
  }

  interface CustomField {
    key: string;
    type: 'text' | 'date' | 'order';
    label: string;
    placeholder?: string;
  }

  // Default values
  const DEFAULT_FILTERS: FilterOptions = {
    name: '',
    order: 'DESC',
  };

  // Props
  const props = defineProps<{
    initialFilters?: Partial<FilterOptions>;
    title?: string;
    applyButtonText?: string;
    clearButtonText?: string;
    showActions?: boolean;
    customFields?: CustomField[];
  }>();

  // Default values
  const showActions = computed(() => props.showActions !== false);

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

  const dateInputs = ref<Record<string, HTMLInputElement>>({});

  // Computed properties
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
   * Opens the date picker for a specific field
   */
  const openDatePicker = (fieldKey: string) => {
    const input = dateInputs.value[fieldKey];
    if (input?.showPicker) {
      input.showPicker();
    } else {
      input?.focus();
    }
  };

  /**
   * Clears all filters and emits the clear event
   */
  const handleClearFilters = () => {
    // Reset each filter value individually to ensure reactivity
    Object.keys(localFilters.value).forEach((key) => {
      if (key in DEFAULT_FILTERS) {
        localFilters.value[key] = DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS];
      } else {
        delete localFilters.value[key];
      }
    });

    emit('clear');
  };
</script>

<style scoped>
  /* Masquer l'icône calendrier par défaut du navigateur pour les inputs date */
  .date-input::-webkit-calendar-picker-indicator {
    display: none;
  }

  .date-input::-webkit-inner-spin-button,
  .date-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0;
  }

  .date-input {
    -webkit-appearance: none;
    -moz-appearance: textfield;
    appearance: textfield;
  }

  /* Assurer que l'icône calendrier reste visible */
  .date-input:focus + .calendar-icon,
  .calendar-icon {
    opacity: 1;
    visibility: visible;
  }
</style>
