<template>
  <div class="bg-card mt-6 rounded-2xl p-6 shadow-lg">
    <div class="mb-6 flex items-center gap-3">
      <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
        <Filter :size="20" class="text-primary" />
      </div>
      <h3 class="font-subtitle text-foreground text-xl">Filtres</h3>
    </div>

    <div class="space-y-6">
      <!-- Search -->
      <div>
        <label for="search" class="font-paragraph text-muted-foreground mb-2 block">
          Rechercher un événement
        </label>
        <div class="relative">
          <input
            id="search"
            v-model="localFilters.search"
            type="text"
            placeholder="Nom de l'événement..."
            class="border-input bg-background font-paragraph text-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border py-3 pr-4 pl-11 transition-all focus:ring-2 focus:outline-none"
          />
          <Search :size="20" class="text-muted-foreground absolute top-3.5 left-3.5" />
        </div>
      </div>

      <!-- Event Type -->
      <div>
        <label class="font-paragraph text-muted-foreground mb-3 block">Type d'événement</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            :class="[
              'font-paragraph rounded-xl px-2 py-2.5 text-xs transition-all duration-200 sm:px-4 sm:py-3 sm:text-sm',
              localFilters.isPaid === null
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border-input bg-background text-foreground hover:bg-muted border',
            ]"
            @click="localFilters.isPaid = null"
          >
            Tous
          </button>
          <button
            :class="[
              'font-paragraph rounded-xl px-2 py-2.5 text-xs transition-all duration-200 sm:px-4 sm:py-3 sm:text-sm',
              localFilters.isPaid === false
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border-input bg-background text-foreground hover:bg-muted border',
            ]"
            @click="localFilters.isPaid = false"
          >
            Gratuits
          </button>
          <button
            :class="[
              'font-paragraph rounded-xl px-2 py-2.5 text-xs transition-all duration-200 sm:px-4 sm:py-3 sm:text-sm',
              localFilters.isPaid === true
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border-input bg-background text-foreground hover:bg-muted border',
            ]"
            @click="localFilters.isPaid = true"
          >
            Payants
          </button>
        </div>
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="startDate" class="font-paragraph text-muted-foreground mb-2 block">
            À partir du
          </label>
          <input
            id="startDate"
            v-model="localFilters.startDate"
            type="date"
            class="border-input bg-background font-paragraph text-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label for="endDate" class="font-paragraph text-muted-foreground mb-2 block">
            Jusqu'au
          </label>
          <input
            id="endDate"
            v-model="localFilters.endDate"
            type="date"
            class="border-input bg-background font-paragraph text-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          class="bg-primary font-paragraph text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 shadow-lg transition-all"
          @click="apply"
        >
          <Check :size="20" />
          Appliquer
        </button>
        <button
          class="border-border bg-card font-paragraph text-foreground hover:bg-muted flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 transition-all"
          @click="reset"
        >
          <X :size="20" />
          Réinitialiser
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Filter, Search, Check, X } from 'lucide-vue-next';

  interface Filters {
    search: string;
    isPaid: boolean | null;
    startDate: string | null;
    endDate: string | null;
  }

  const props = defineProps<{
    filters: Filters;
  }>();

  const emit = defineEmits<{
    'update:filters': [filters: Filters];
    apply: [];
  }>();

  const localFilters = ref<Filters>({ ...props.filters });

  watch(
    () => props.filters,
    (newFilters) => {
      localFilters.value = { ...newFilters };
    },
    { deep: true }
  );

  const apply = () => {
    emit('update:filters', { ...localFilters.value });
    emit('apply');
  };

  const reset = () => {
    localFilters.value = {
      search: '',
      isPaid: null,
      startDate: null,
      endDate: null,
    };
    apply();
  };
</script>
