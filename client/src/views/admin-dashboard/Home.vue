<template>
  <Header title="Dashboard Admin">
    <template #header>Dashboard Admin</template>
  </Header>
  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div class="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <!-- Statistiques -->
      <div
        v-if="!isLoading"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard title="Total Associations" :value="statistics.total" :icon="Building2" />
        <StatCard title="En attente" :value="statistics.pending" :icon="Clock" />
        <StatCard title="Acceptées" :value="statistics.accepted" :icon="CheckCircle" />
        <StatCard title="Rejetées" :value="statistics.rejected" :icon="XCircle" />
        <StatCard
          title="Info supplémentaires"
          :value="statistics.additionalRequest"
          :icon="AlertCircle"
        />
      </div>

      <!-- Message de chargement -->
      <div v-else class="bg-card rounded-lg border p-12 text-center shadow-sm">
        <p class="text-muted-foreground">Chargement des statistiques...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import Database from '@/utils/database.utils';
  import Header from '@/components/dashboard/Header.vue';
  import StatCard from '@/components/admin-dashboard/StatCard.vue';
  import { Building2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next';
  import type { Association } from '@/interfaces/association.interface';
  import { Status } from '@/enums/status';

  const associations = ref<Association[]>([]);
  const isLoading = ref(false);

  const statistics = computed(() => {
    return {
      total: associations.value.length,
      pending: associations.value.filter((a) => a.status === Status.PENDING).length,
      accepted: associations.value.filter((a) => a.status === Status.ACCEPTED).length,
      rejected: associations.value.filter((a) => a.status === Status.REJECTED).length,
      additionalRequest: associations.value.filter((a) => a.status === Status.ADDITIONAL_REQUEST)
        .length,
    };
  });

  onMounted(async () => {
    isLoading.value = true;
    try {
      // Récupérer toutes les associations sans filtre de statut
      const response = await Database.getAll('admin/associations');
      associations.value = Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des associations:', error);
      associations.value = [];
    } finally {
      isLoading.value = false;
    }
  });
</script>
