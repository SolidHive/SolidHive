<template>
  <div class="bg-muted/30 min-h-screen pt-6 pb-12">
    <div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <DonationsHeader />

      <!-- Onglets de filtrage -->
      <DonationsFilters :donation-type="donationType" @type-change="setDonationType" />

      <!-- Liste des dons -->
      <DonationsList
        :donations="donations"
        :associations="associations"
        :fundraisings="fundraisings"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import type { Transaction } from '@/interfaces';
  import DonationsHeader from '@/components/profile/donations/DonationsHeader.vue';
  import DonationsFilters from '@/components/profile/donations/DonationsFilters.vue';
  import DonationsList from '@/components/profile/donations/DonationsList.vue';

  // Route et router
  const route = useRoute();
  const router = useRouter();

  // État
  const donations = ref<Transaction[]>([]);
  const associations = ref<any[]>([]);
  const fundraisings = ref<any[]>([]);
  const isLoading = ref(true);
  const isLoadingAssociations = ref(true);
  const isLoadingFundraisings = ref(true);
  const donationType = ref<'all' | 'associations' | 'cagnottes'>('all');

  // Calculs
  // Plus besoin de filteredDonations car on filtre côté serveur

  // Méthodes
  const setDonationType = async (type: 'all' | 'associations' | 'cagnottes') => {
    donationType.value = type;
    // Mettre à jour l'URL
    const query = type === 'all' ? {} : { type };
    router.replace({ query });

    // Recharger les dons avec le nouveau filtre
    await loadDonations(type);
  };

  const initializeFromUrl = () => {
    const typeParam = route.query.type as string;
    if (typeParam === 'associations' || typeParam === 'cagnottes') {
      donationType.value = typeParam;
    } else {
      donationType.value = 'all';
    }
  };

  // Chargement des dons
  const loadDonations = async (
    type: 'all' | 'associations' | 'cagnottes' = 'all'
  ): Promise<void> => {
    try {
      isLoading.value = true;

      let queryParams: any = {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
      };

      // Ajouter un filtre côté serveur si nécessaire
      if (type === 'associations') {
        queryParams.where = JSON.stringify({ relatedTo: { $ne: 'Fundraising' } });
      } else if (type === 'cagnottes') {
        queryParams.where = JSON.stringify({ relatedTo: 'Fundraising' });
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

  // Chargement des associations
  const loadAssociations = async (): Promise<void> => {
    try {
      isLoadingAssociations.value = true;
      const data = await Database.getAll('associations');
      associations.value = data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des associations:', error);
      associations.value = [];
    } finally {
      isLoadingAssociations.value = false;
    }
  };

  // Chargement des cagnottes
  const loadFundraisings = async (): Promise<void> => {
    try {
      isLoadingFundraisings.value = true;
      const data = await Database.getAll('fundraisings');
      fundraisings.value = data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des cagnottes:', error);
      fundraisings.value = [];
    } finally {
      isLoadingFundraisings.value = false;
    }
  };

  onMounted(() => {
    initializeFromUrl();
    loadDonations(donationType.value);
    loadAssociations();
    loadFundraisings();
  });
</script>
