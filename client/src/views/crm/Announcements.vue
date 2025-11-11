<template>
  <Header>
    <button
      v-if="canCreateAnnouncement"
      class="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors md:text-base"
      @click="openCreateDrawer"
    >
      <Plus :class="width >= 460 ? 'mr-2' : ''" :size="20" />
      <span>{{ width >= 460 ? 'Créer une annonce' : '' }}</span>
    </button>
  </Header>
  <div class="relative w-full p-6 md:px-12">
    <!-- Barre de recherche -->
    <AnnouncementsSearchBar v-model="searchQuery" />

    <!-- Table des annonces -->
    <AnnouncementsTable
      :announcements="announcements"
      :can-update-announcement="canUpdateAnnouncement ?? false"
      :can-remove-announcement="canRemoveAnnouncement ?? false"
      :association-id="associationId"
      @edit="openEditDrawer"
      @delete="openDeleteDrawer"
    />

    <!-- Pagination -->
    <AnnouncementsPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-announcements="totalAnnouncements"
      :items-per-page="itemsPerPage"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Loading -->
    <LoadingSpinner :is-loading="isLoading" />

    <!-- Drawers -->
    <CreateAnnouncementDrawer
      v-model:open="isCreateDrawerOpen"
      :association-id="associationId"
      :can-create-announcement="canCreateAnnouncement ?? false"
      @announcement-created="fetchAnnouncements"
    />

    <EditAnnouncementDrawer
      v-model:open="isEditDrawerOpen"
      :announcement="selectedAnnouncement"
      :association-id="associationId"
      :can-update-announcement="canUpdateAnnouncement ?? false"
      @announcement-updated="fetchAnnouncements"
    />

    <DeleteAnnouncementDrawer
      v-model:open="isDeleteDrawerOpen"
      :announcement="selectedAnnouncement"
      :association-id="associationId"
      :can-remove-announcement="canRemoveAnnouncement ?? false"
      @announcement-deleted="fetchAnnouncements"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, onBeforeMount, computed } from 'vue';
  import Header from '@/components/dashboard/Header.vue';
  import AnnouncementsSearchBar from '@/components/crm/announcements/AnnouncementsSearchBar.vue';
  import AnnouncementsTable from '@/components/crm/announcements/AnnouncementsTable.vue';
  import AnnouncementsPagination from '@/components/crm/announcements/AnnouncementsPagination.vue';
  import LoadingSpinner from '@/components/crm/members/LoadingSpinner.vue';
  import CreateAnnouncementDrawer from '@/components/crm/announcements/CreateAnnouncementDrawer.vue';
  import EditAnnouncementDrawer from '@/components/crm/announcements/EditAnnouncementDrawer.vue';
  import DeleteAnnouncementDrawer from '@/components/crm/announcements/DeleteAnnouncementDrawer.vue';
  import { useRoute, useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import { useCrmStore } from '@/stores/crm';
  import { Permissions } from '@/enums/permissions';
  import { useWindowSize } from '@vueuse/core';
  import { Plus } from 'lucide-vue-next';

  const { width } = useWindowSize();
  const crmStore = useCrmStore();
  const member = crmStore.member;
  const route = useRoute();
  const router = useRouter();
  const associationId = route.params.id as string;

  const searchQuery = ref('');
  const announcements = ref<Announcement[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalAnnouncements = ref(0);
  const totalPages = ref(1);
  const isCreateDrawerOpen = ref(false);
  const isEditDrawerOpen = ref(false);
  const isDeleteDrawerOpen = ref(false);
  const selectedAnnouncement = ref<Announcement | null>(null);

  const canCreateAnnouncement = computed(() => {
    return member?.role.permissions.some(
      (permission) =>
        permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_CREATE
    );
  });

  const canUpdateAnnouncement = computed(() => {
    return member?.role.permissions.some(
      (permission) =>
        permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_UPDATE
    );
  });

  const canRemoveAnnouncement = computed(() => {
    return member?.role.permissions.some(
      (permission) =>
        permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_DELETE
    );
  });

  function openCreateDrawer() {
    isCreateDrawerOpen.value = true;
  }

  function openEditDrawer(announcement: Announcement) {
    selectedAnnouncement.value = announcement;
    isEditDrawerOpen.value = true;
  }

  function openDeleteDrawer(announcement: Announcement) {
    selectedAnnouncement.value = announcement;
    isDeleteDrawerOpen.value = true;
  }

  // const loadAssociationAnnouncementFiles = async (
  //   announcementId: string
  // ): Promise<FileMetadata[]> => {
  //   const files: FileMetadata[] = [];
  //   let index = 0;

  //   while (true) {
  //     try {
  //       const response = await api.get(
  //         `/files/AssociationAnnouncement/${announcementId}/metadata`,
  //         {
  //           params: { index },
  //         }
  //       );
  //       if (response.data) {
  //         files.push(response.data);
  //         index++;
  //       } else {
  //         break;
  //       }
  //     } catch (err: any) {
  //       if (err.response?.status === 404) break;
  //       console.error('Error loading file metadata:', err);
  //       break;
  //     }
  //   }

  //   return files;
  // };

  async function fetchAnnouncements(): Promise<void> {
    try {
      isLoading.value = true;

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      if (searchQuery.value) {
        params.where = JSON.stringify({ title: searchQuery.value });
      }

      const response = await Database.getAll(`association/${associationId}/announcements`, params);

      announcements.value = response;
      totalAnnouncements.value = announcements.value.length;
      totalPages.value = Math.ceil(totalAnnouncements.value / itemsPerPage.value) || 1;

      // Load files for each announcement
      for (const announcement of announcements.value) {
        if (!announcement.image) continue;
        announcement.image = getFileUrl(announcement.id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      announcements.value = [];
      totalAnnouncements.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  const getFileUrl = (announcementId: string): string | null => {
    return `/files/AssociationAnnouncement/${announcementId}?index=0`;
  };

  function goToPreviousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchAnnouncements();
    }
  }

  function goToNextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchAnnouncements();
    }
  }

  function handleItemsPerPageChange(value: number) {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchAnnouncements();
  }

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchAnnouncements();
    }, 500);
  });

  onBeforeMount(async () => {
    // Pas de vérification de permission ANNOUNCEMENTS_VIEW car elle n'existe pas
    // On vérifie juste si l'utilisateur a accès au CRM
    if (!member) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    fetchAnnouncements();
  });
</script>
