<template>
  <PageContainer>
    <div class="bg-muted/30 min-h-screen">
      <!-- Header -->
      <DonationsHeader />

      <!-- Onglets de filtrage -->
      <DonationsFilters :donation-type="donationType" @type-change="setDonationType" />

      <!-- Liste des dons -->
      <DonationsList
        :donations="donations"
        :is-loading="isLoading"
        :total-count="totalCount"
        :total-amount="totalAmount"
        @registration-cancelled="onRegistrationCancelled"
      />

      <!-- Pagination -->
      <Pagination
        v-if="!isLoading && totalItems > itemsPerPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :current-page="currentPage"
        @update:current-page="goToPage"
      />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import type { Transaction } from '@/interfaces';
  import PageContainer from '@/components/PageContainer.vue';
  import DonationsHeader from '@/components/profile/donations/DonationsHeader.vue';
  import DonationsFilters from '@/components/profile/donations/DonationsFilters.vue';
  import DonationsList from '@/components/profile/donations/DonationsList.vue';
  import Pagination from '@/components/ui/Pagination.vue';

  // Route et router
  const route = useRoute();
  const router = useRouter();

  // État
  const donations = ref<Transaction[]>([]);
  const isLoading = ref(true);
  const donationType = ref<'all' | 'associations' | 'cagnottes' | 'evenements'>('all');

  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalCount = ref(0);
  const totalAmount = ref(0);

  // Calculs
  // Plus besoin de filteredDonations car on filtre côté serveur

  // Méthodes
  const setDonationType = async (type: 'all' | 'associations' | 'cagnottes' | 'evenements') => {
    donationType.value = type;
    currentPage.value = 1;
    // Mettre à jour l'URL
    const query = type === 'all' ? {} : { type };
    router.replace({ query });

    // Recharger les totaux et les dons avec le nouveau filtre
    await loadTotals(type);
    await loadDonations(type);
  };

  const initializeFromUrl = () => {
    const typeParam = route.query.type as string;
    if (typeParam === 'associations' || typeParam === 'cagnottes' || typeParam === 'evenements') {
      donationType.value = typeParam as 'all' | 'associations' | 'cagnottes' | 'evenements';
    } else {
      donationType.value = 'all';
    }
  };

  // Chargement des dons
  const loadDonations = async (
    type: 'all' | 'associations' | 'cagnottes' | 'evenements' = 'all',
    page: number = 1
  ): Promise<void> => {
    try {
      isLoading.value = true;

      // Charger d'abord le total de tous les dons pour l'affichage
      if (page === 1) {
        await loadTotals(type);
      }

      const queryParams: any = {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        relations: JSON.stringify(['association', 'fundraising', 'event']),
        take: itemsPerPage.value,
        skip: (page - 1) * itemsPerPage.value,
      };

      if (type === 'associations') {
        queryParams.where = JSON.stringify({ relatedTo: 'Association' });
      } else if (type === 'cagnottes') {
        queryParams.where = JSON.stringify({ relatedTo: 'Fundraising' });
      } else if (type === 'evenements') {
        queryParams.where = JSON.stringify({ relatedTo: 'Event' });
      }

      const response = await Database.getAll('transactions', queryParams);

      // Vérifier si la réponse contient des métadonnées de pagination
      if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
        donations.value = response.data;
        totalItems.value = response.meta.total;
      } else {
        donations.value = response;
        totalItems.value = response.length;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dons:', error);
      donations.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadTotals = async (
    type: 'all' | 'associations' | 'cagnottes' | 'evenements' = 'all'
  ): Promise<void> => {
    try {
      const queryParams: any = {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        relations: JSON.stringify(['association', 'fundraising', 'event']),
      };

      if (type === 'associations') {
        queryParams.where = JSON.stringify({ relatedTo: 'Association' });
      } else if (type === 'cagnottes') {
        queryParams.where = JSON.stringify({ relatedTo: 'Fundraising' });
      } else if (type === 'evenements') {
        queryParams.where = JSON.stringify({ relatedTo: 'Event' });
      }

      const allTransactions = await Database.getAll('transactions', queryParams);
      totalCount.value = Array.isArray(allTransactions) ? allTransactions.length : 0;
      totalAmount.value = Array.isArray(allTransactions)
        ? allTransactions.reduce((total: number, donation: any) => total + donation.amount, 0)
        : 0;
    } catch (error) {
      console.error('Erreur lors du chargement des totaux:', error);
      totalCount.value = 0;
      totalAmount.value = 0;
    }
  };

  const goToPage = async (page: number) => {
    currentPage.value = page;
    await loadDonations(donationType.value, page);
  };

  const onRegistrationCancelled = async () => {
    // Recharger les données après l'annulation d'une inscription
    await loadTotals(donationType.value);
    await loadDonations(donationType.value, currentPage.value);
  };

  onMounted(() => {
    initializeFromUrl();
    loadTotals(donationType.value);
    loadDonations(donationType.value, currentPage.value);
  });
</script>
