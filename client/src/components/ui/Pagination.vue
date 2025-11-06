<template>
  <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
    <!-- Double flèche gauche -->
    <button
      :disabled="currentPage === 1"
      class="text-secondary hover:text-secondary/80 flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Première page"
      @click="goToPage(1)"
    >
      <ChevronsLeft class="h-4 w-4" />
    </button>

    <!-- Flèche gauche -->
    <button
      :disabled="currentPage === 1"
      class="text-secondary hover:text-secondary/80 flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Page précédente"
      @click="goToPage(currentPage - 1)"
    >
      <ChevronLeft class="h-4 w-4" />
    </button>

    <div class="flex items-center gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="[
          'flex items-center justify-center text-sm font-medium',
          page === currentPage
            ? 'bg-secondary h-7 w-7 rounded-full text-white'
            : 'hover:text-secondary h-10 w-10 text-gray-700',
        ]"
        :aria-label="page === -1 ? '...' : `Aller à la page ${page}`"
        :disabled="page === -1"
        @click="goToPage(page)"
      >
        {{ page === -1 ? '...' : page }}
      </button>
    </div>

    <!-- Flèche droite -->
    <button
      :disabled="currentPage === totalPages"
      class="text-secondary hover:text-secondary/80 flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Page suivante"
      @click="goToPage(currentPage + 1)"
    >
      <ChevronRight class="h-4 w-4" />
    </button>

    <!-- Double flèche droite -->
    <button
      :disabled="currentPage === totalPages"
      class="text-secondary hover:text-secondary/80 flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Dernière page"
      @click="goToPage(totalPages)"
    >
      <ChevronsRight class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';

  const props = defineProps<{
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
  }>();

  const emit = defineEmits<{
    'update:currentPage': [page: number];
  }>();

  const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const total = totalPages.value;
    const current = props.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5);
        pages.push(-1); // ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        pages.push(current - 1, current, current + 1);
        pages.push(-1); // ellipsis
        pages.push(total);
      }
    }

    return pages;
  });

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      emit('update:currentPage', page);
    }
  }
</script>
