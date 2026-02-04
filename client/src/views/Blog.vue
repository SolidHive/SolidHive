<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16">
      <BlogHeader />

      <BlogGrid :announcements="announcements" :is-loading="isLoading" @select="openAnnouncement" />

      <Pagination
        v-if="!isLoading"
        :total-items="totalItems"
        :items-per-page="pageSize"
        :current-page="currentPage"
        @update:current-page="goToPage"
      />

      <BlogCta
        @navigate-associations="navigateToAssociations"
        @navigate-events="navigateToEvents"
      />
    </div>

    <BlogDetailModal
      :announcement="selectedAnnouncement"
      :open="isModalOpen"
      @update:open="isModalOpen = $event"
    />
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import BlogHeader from '@/components/blog/BlogHeader.vue';
  import BlogGrid from '@/components/blog/BlogGrid.vue';
  import BlogCta from '@/components/blog/BlogCta.vue';
  import BlogDetailModal from '@/components/blog/BlogDetailModal.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import Database from '@/utils/database.utils';
  import type { Announcement } from '@/interfaces/announcement.interface';

  const router = useRouter();
  const announcements = ref<Announcement[]>([]);
  const isLoading = ref(true);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const pageSize = 9;
  const isModalOpen = ref(false);
  const selectedAnnouncement = ref<Announcement | null>(null);

  const loadAnnouncements = async () => {
    try {
      isLoading.value = true;
      const response = await Database.getAll('admin/announcements', {
        skip: (currentPage.value - 1) * pageSize,
        take: pageSize,
      });

      announcements.value = response.data || [];
      totalItems.value = response.meta?.total || 0;
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const goToPage = (page: number) => {
    currentPage.value = page;
    loadAnnouncements();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAnnouncement = (announcement: Announcement) => {
    selectedAnnouncement.value = announcement;
    isModalOpen.value = true;
  };

  const navigateToAssociations = () => {
    router.push('/associations');
  };

  const navigateToEvents = () => {
    router.push('/events');
  };

  onMounted(() => {
    loadAnnouncements();
  });
</script>
