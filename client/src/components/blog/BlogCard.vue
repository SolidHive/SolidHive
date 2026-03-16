<template>
  <article
    class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-xl"
    @click="$emit('click')"
  >
    <!-- Image -->
    <div class="aspect-video w-full overflow-hidden bg-gray-100">
      <img
        v-if="announcement.image"
        :src="announcement.image"
        :alt="announcement.title"
        class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <div
        v-else
        class="from-primary/20 to-accent/20 flex h-full w-full items-center justify-center bg-gradient-to-br"
      >
        <Megaphone class="text-primary h-16 w-16" />
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-3 p-6">
      <!-- Title -->
      <h3 class="font-title text-secondary line-clamp-2 text-xl leading-tight">
        {{ announcement.title }}
      </h3>

      <!-- Content Preview -->
      <div
        class="rich-content rich-content-preview overflow-hidden text-sm text-gray-600"
        v-html="announcement.content"
      ></div>

      <!-- Date -->
      <div class="mt-auto flex items-center gap-2 text-xs text-gray-500">
        <Calendar class="h-4 w-4 shrink-0" />
        <time
          v-if="announcement.timestamps?.createdAt"
          :datetime="announcement.timestamps.createdAt.toString()"
        >
          {{ formatDate(announcement.timestamps.createdAt.toString()) }}
        </time>
      </div>

      <!-- Read More -->
      <div class="text-primary flex items-center gap-2 text-sm font-medium">
        <span>Lire la suite</span>
        <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { Megaphone, Calendar, ArrowRight } from 'lucide-vue-next';
  import type { Announcement } from '@/interfaces/announcement.interface';

  defineProps<{
    announcement: Announcement;
  }>();

  defineEmits<{
    click: [];
  }>();

  const formatDate = (date: string): string => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
</script>
