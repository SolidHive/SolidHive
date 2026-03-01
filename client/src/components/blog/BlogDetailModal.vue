<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col sm:w-full">
      <DialogHeader>
        <DialogTitle class="font-title text-secondary text-2xl">
          {{ announcement?.title }}
        </DialogTitle>
      </DialogHeader>
      <div class="flex-1 space-y-6 overflow-y-auto">
        <!-- Image -->
        <div
          v-if="announcement?.image"
          class="flex w-full justify-center rounded-lg bg-gray-100 p-4"
        >
          <img
            :src="announcement.image"
            :alt="announcement.title"
            class="max-h-[40vh] max-w-full object-contain"
          />
        </div>

        <!-- Date -->
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Calendar class="h-4 w-4" />
          <time
            v-if="announcement?.timestamps?.createdAt"
            :datetime="announcement.timestamps.createdAt.toString()"
          >
            {{ formatDate(announcement.timestamps.createdAt.toString()) }}
          </time>
        </div>

        <!-- Content -->
        <div
          class="font-paragraph rounded-lg bg-gray-50 p-6 text-base leading-relaxed break-words whitespace-pre-wrap text-gray-700"
        >
          {{ announcement?.content }}
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Calendar } from 'lucide-vue-next';
  import type { Announcement } from '@/interfaces/announcement.interface';

  const props = defineProps<{
    announcement: Announcement | null;
    open: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
  }>();

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

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
