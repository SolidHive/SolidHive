<template>
  <section class="w-full">
    <h2 v-if="title" class="font-title text-secondary mb-6 text-2xl">{{ title }}</h2>

    <!-- Message si pas de contenu -->
    <div
      v-if="!items || items.length === 0"
      class="bg-muted/30 border-border rounded-xl border border-dashed p-12 text-center"
    >
      <p class="font-paragraph text-muted-foreground text-lg">
        <slot name="empty-message">Aucun contenu disponible pour le moment.</slot>
      </p>
    </div>

    <div v-else class="relative">
      <div ref="track" class="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4">
        <article v-for="(item, i) in items" :key="i" :class="itemClass">
          <!-- delegate rendering of the inner content to the parent via slot -->
          <slot name="item" :item="item" :index="i" />
        </article>
      </div>

      <!-- Arrows centered below (only if there are items) -->
      <div class="mt-4 flex justify-center gap-4">
        <button
          class="bg-accent hover:bg-accent/90 flex items-center justify-center rounded-full p-2 shadow hover:scale-105"
          aria-label="Précédent"
          @click="prev"
        >
          <ChevronLeft class="h-5 w-5 text-white" />
        </button>
        <button
          class="bg-accent hover:bg-accent/90 flex items-center justify-center rounded-full p-2 shadow hover:scale-105"
          aria-label="Suivant"
          @click="next"
        >
          <ChevronRight class="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

  const props = defineProps<{
    items?: any[];
    title?: string;
    itemClass?: string;
    color?: string;
  }>();

  const items = props.items || [];
  const track = ref<HTMLElement | null>(null);

  function next() {
    if (!track.value) return;
    const width = track.value.clientWidth;
    track.value.scrollBy({ left: width * 0.6, behavior: 'smooth' });
  }

  function prev() {
    if (!track.value) return;
    const width = track.value.clientWidth;
    track.value.scrollBy({ left: -width * 0.6, behavior: 'smooth' });
  }
</script>

<style scoped>
  .scroll-smooth {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .scroll-smooth::-webkit-scrollbar {
    display: none;
  }
</style>
