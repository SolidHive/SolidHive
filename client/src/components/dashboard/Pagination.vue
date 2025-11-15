<template>
  <div class="mt-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-muted-foreground text-sm">Annonces par page:</span>
      <select
        :value="itemsPerPage"
        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-8 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        @change="$emit('update:itemsPerPage', parseInt(($event.target as HTMLSelectElement).value))"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-muted-foreground text-sm">
        Page {{ currentPage }} sur {{ totalPages }} ({{ totalItems }} annonce{{
          totalItems > 1 ? 's' : ''
        }})
      </span>
      <button
        :disabled="currentPage === 1"
        class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        @click="$emit('previous')"
      >
        Précédent
      </button>
      <button
        :disabled="currentPage === totalPages"
        class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        @click="$emit('next')"
      >
        Suivant
      </button>
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
