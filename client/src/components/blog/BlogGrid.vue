<template>
  <section class="py-8">
    <!-- Loading State -->
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement des annonces..." />

    <!-- Announcements Grid -->
    <div
      v-else-if="announcements.length > 0"
      class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
    >
      <BlogCard
        v-for="announcement in announcements"
        :key="announcement.id"
        :announcement="announcement"
        @click="$emit('select', announcement)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="py-16 text-center">
      <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Megaphone class="h-12 w-12 text-gray-400" />
      </div>
      <h3 class="font-title text-secondary mb-2 text-xl">Aucune annonce pour le moment</h3>
      <p class="font-paragraph text-gray-600">
        Revenez bientôt pour découvrir nos dernières actualités !
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Megaphone } from 'lucide-vue-next';
  import BlogCard from './BlogCard.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import type { Announcement } from '@/interfaces/announcement.interface';

  defineProps<{
    announcements: Announcement[];
    isLoading: boolean;
  }>();

  defineEmits<{
    select: [announcement: Announcement];
  }>();
</script>
