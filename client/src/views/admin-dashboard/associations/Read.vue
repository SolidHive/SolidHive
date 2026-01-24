<template>
  <Header title="Gestion des Associations">
    <template #header>Gestion des Associations</template>
  </Header>
  <div class="relative w-full px-2 py-4 sm:p-6 md:px-12">
    <!-- Barre de recherche et filtres -->
    <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
      <SearchBar v-model="searchQuery" placeholder="Rechercher par nom..." />
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="status in statusFilters"
          :key="status.value ?? 'all'"
          :variant="selectedStatus === status.value ? 'default' : 'outline'"
          size="sm"
          @click="handleStatusChange(status.value)"
        >
          {{ status.label }}
        </Button>
      </div>
    </div>

    <!-- Grille d'associations -->
    <div
      v-if="!isLoading && associations.length > 0"
      class="mb-6 grid w-full gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
    >
      <AssociationCard
        v-for="association in associations"
        :key="association.id"
        :association="association"
        @view-details="viewAssociation"
      />
    </div>

    <!-- Message si aucune association -->
    <div
      v-else-if="!isLoading && associations.length === 0"
      class="bg-card mb-6 rounded-lg border p-12 text-center shadow-sm"
    >
      <p class="text-muted-foreground">Aucune association trouvée</p>
    </div>

    <!-- Pagination -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Loading -->
    <LoadingSpinner :is-loading="isLoading" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import Header from '@/components/dashboard/Header.vue';
  import SearchBar from '@/components/dashboard/SearchBar.vue';
  import AssociationCard from '@/components/admin-dashboard/AssociationCard.vue';
  import Pagination from '@/components/dashboard/Pagination.vue';
  import LoadingSpinner from '@/components/dashboard/LoadingSpinner.vue';
  import { Button } from '@/components/ui/button';
  import type { Association } from '@/interfaces/association.interface';
  import { Status } from '@/enums/status';

  const router = useRouter();
  const associations = ref<Association[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  const selectedStatus = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalPages = ref(1);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const statusFilters = [
    { label: 'Toutes', value: null },
    { label: 'En attente', value: Status.PENDING },
    { label: 'Acceptées', value: Status.ACCEPTED },
    { label: 'Rejetées', value: Status.REJECTED },
    { label: 'Info suppl.', value: Status.ADDITIONAL_REQUEST },
  ];

  const viewAssociation = (id: string) => {
    router.push({ name: 'AdminDashboardAssociationDetail', params: { associationId: id } });
  };

  const fetchAssociations = async () => {
    isLoading.value = true;
    try {
      // Utiliser l'endpoint admin pour voir toutes les associations ou filtrer par statut
      const endpoint = selectedStatus.value
        ? `associations/status/${selectedStatus.value}`
        : 'admin/associations';

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      // Ajouter la recherche par nom
      if (searchQuery.value) {
        params.name = searchQuery.value;
      }

      const response = await Database.getAll(endpoint, params);

      // Gérer la réponse paginée ou non paginée
      if (response.data && Array.isArray(response.data)) {
        associations.value = response.data;
        totalItems.value = response.meta?.total || response.total || response.data.length;
      } else if (Array.isArray(response)) {
        associations.value = response;
        totalItems.value = response.length;
      } else {
        associations.value = [];
        totalItems.value = 0;
      }

      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1;
    } catch (error) {
      console.error('Erreur lors de la récupération des associations:', error);
      associations.value = [];
      totalItems.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  };

  const handleStatusChange = (status: string | null) => {
    selectedStatus.value = status;
    currentPage.value = 1;
    fetchAssociations();
  };

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchAssociations();
    }
  };

  const goToNextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchAssociations();
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchAssociations();
  };

  // Debounce pour la recherche
  watch(searchQuery, () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchAssociations();
    }, 500);
  });

  onMounted(() => {
    fetchAssociations();
  });
</script>
