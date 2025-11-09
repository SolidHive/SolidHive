<template>
  <div class="mt-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="text-muted-foreground text-sm">{{ totalMembers }} membre(s) au total</div>
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground text-sm">Afficher</span>
        <select
          :value="itemsPerPage"
          class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          @change="$emit('update:itemsPerPage', Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span class="text-muted-foreground text-sm">éléments</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        :disabled="currentPage === 1"
        class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('previous')"
      >
        Précédent
      </button>
      <div class="text-muted-foreground flex items-center gap-2 px-3 text-sm">
        <span>Page {{ currentPage }} sur {{ totalPages }}</span>
      </div>
      <button
        :disabled="currentPage === totalPages"
        class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
    totalMembers: number;
    itemsPerPage: number;
  }>();

  defineEmits<{
    previous: [];
    next: [];
    'update:itemsPerPage': [value: number];
  }>();
</script>
