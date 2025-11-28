<template>
  <PageContainer>
    <div class="bg-muted/30 min-h-screen">
      <!-- Header -->
      <DonationsHeader />

      <!-- Onglets de filtrage -->
      <DonationsFilters :donation-type="donationType" @type-change="setDonationType" />

      <!-- Liste des dons -->
      <DonationsList :donations="donations" :is-loading="isLoading" />
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

  // Route et router
  const route = useRoute();
  const router = useRouter();

  // État
  const donations = ref<Transaction[]>([]);
  const isLoading = ref(true);
  const donationType = ref<'all' | 'associations' | 'cagnottes' | 'evenements'>('all');

  // Calculs
  // Plus besoin de filteredDonations car on filtre côté serveur

  // Méthodes
  const setDonationType = async (type: 'all' | 'associations' | 'cagnottes' | 'evenements') => {
    donationType.value = type;
    // Mettre à jour l'URL
    const query = type === 'all' ? {} : { type };
    router.replace({ query });

    // Recharger les dons avec le nouveau filtre
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
    type: 'all' | 'associations' | 'cagnottes' | 'evenements' = 'all'
  ): Promise<void> => {
    try {
      isLoading.value = true;

      const queryParams: any = {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        relations: JSON.stringify(['association', 'fundraising', 'event']),
      };

      // Ajouter un filtre côté serveur si nécessaire
      if (type === 'associations') {
        queryParams.where = JSON.stringify({ relatedTo: 'Association' });
      } else if (type === 'cagnottes') {
        queryParams.where = JSON.stringify({ relatedTo: 'Fundraising' });
      } else if (type === 'evenements') {
        queryParams.where = JSON.stringify({ relatedTo: 'Event' });
      }

      const data = await Database.getAll('transactions', queryParams);
      donations.value = data;
    } catch (error) {
      console.error('Erreur lors du chargement des dons:', error);
      donations.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    initializeFromUrl();
    loadDonations(donationType.value);
  });
</script>
