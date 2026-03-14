<template>
  <div
    class="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
  >
    <div class="flex items-center gap-2">
      <span class="text-muted-foreground text-xs sm:text-sm">Éléments par page:</span>
      <select
        :value="itemsPerPage"
        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-7 rounded-md border px-1.5 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-8 sm:px-2 sm:text-sm"
        @change="$emit('update:itemsPerPage', parseInt(($event.target as HTMLSelectElement).value))"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
    <div class="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <span class="text-muted-foreground text-xs sm:text-sm">
        Page {{ currentPage }} sur {{ totalPages }} ({{ totalItems }} élément{{
          totalItems > 1 ? 's' : ''
        }})
      </span>
      <div class="flex gap-1.5 sm:gap-2">
        <button
          :disabled="currentPage === 1"
          class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-7 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-8 sm:px-3 sm:text-sm"
          @click="$emit('previous')"
        >
          Précédent
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-7 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-8 sm:px-3 sm:text-sm"
          @click="$emit('next')"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }>();

  defineEmits<{
    previous: [];
    next: [];
    'update:itemsPerPage': [value: number];
  }>();
</script>
