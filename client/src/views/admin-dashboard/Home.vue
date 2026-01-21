<template>
  <Header title="Dashboard Admin">
    <template #header>Dashboard Admin</template>
  </Header>
  <div class="px-3 py-3 sm:px-4 sm:py-4 md:px-8 lg:px-12">
    <div class="mx-auto max-w-[1600px] space-y-3 sm:space-y-4 md:space-y-6">
      <!-- Header avec statistiques principales -->
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
        <EnhancedStatCard
          title="Total Utilisateurs"
          :value="stats.usersCount"
          :icon="Users"
          description="Utilisateurs inscrits"
          icon-bg-color="bg-accent/10"
          icon-color="text-accent"
        />
        <EnhancedStatCard
          title="Associations"
          :value="stats.associationsCount"
          :icon="Building2"
          description="Associations validées"
          :show-progress="true"
          :progress-value="stats.acceptanceRate"
          icon-bg-color="bg-secondary/10"
          icon-color="text-secondary"
        />
        <EnhancedStatCard
          title="Total Dons"
          :value="stats.donationsCount"
          :icon="Heart"
          :trend="stats.donationsGrowth"
          description="Dons collectés"
          icon-bg-color="bg-primary/10"
          icon-color="text-primary"
        />
        <EnhancedStatCard
          title="Revenus SolidHive"
          :value="formatCurrency(stats.solidHiveRevenue)"
          :icon="Wallet"
          description="Commissions perçues"
          icon-bg-color="bg-[#009B78]/10"
          icon-color="text-[#009B78]"
        />
      </div>

      <!-- Statistiques des associations par statut -->
      <Card>
        <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle class="font-title text-base sm:text-lg">Gestion des Associations</CardTitle>
        </CardHeader>
        <CardContent class="px-3 py-4 sm:px-6">
          <div
            v-if="!isLoadingAssociations"
            class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5"
          >
            <div
              class="flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 md:p-4"
            >
              <Building2 class="text-muted-foreground mb-1 h-6 w-6 sm:mb-2 sm:h-8 sm:w-8" />
              <span class="text-lg font-bold sm:text-xl md:text-2xl">
                {{ associationStats.total }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">Total</span>
            </div>
            <div
              class="flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 md:p-4"
            >
              <Clock class="mb-1 h-6 w-6 text-orange-500 sm:mb-2 sm:h-8 sm:w-8" />
              <span class="text-lg font-bold sm:text-xl md:text-2xl">
                {{ associationStats.pending }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">En attente</span>
            </div>
            <div
              class="flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 md:p-4"
            >
              <CheckCircle class="mb-1 h-6 w-6 text-green-600 sm:mb-2 sm:h-8 sm:w-8" />
              <span class="text-lg font-bold sm:text-xl md:text-2xl">
                {{ associationStats.accepted }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">Acceptées</span>
            </div>
            <div
              class="flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 md:p-4"
            >
              <XCircle class="mb-1 h-6 w-6 text-red-600 sm:mb-2 sm:h-8 sm:w-8" />
              <span class="text-lg font-bold sm:text-xl md:text-2xl">
                {{ associationStats.rejected }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">Rejetées</span>
            </div>
            <div
              class="flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 md:p-4"
            >
              <AlertCircle class="mb-1 h-6 w-6 text-blue-600 sm:mb-2 sm:h-8 sm:w-8" />
              <span class="text-lg font-bold sm:text-xl md:text-2xl">
                {{ associationStats.additionalRequest }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">Info supp.</span>
            </div>
          </div>
          <div v-else class="p-8 text-center">
            <p class="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>

      <!-- Section Métriques et Performance -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DonationsEvolutionChart :monthly-donations="stats.monthlyDonations" />
        </div>
        <MetricsRadarChart
          :donations-count="stats.donationsCount"
          :users-count="stats.usersCount"
          :associations-count="stats.associationsCount"
          :active-fundraisings="stats.activeFundraisings"
          :acceptance-rate="stats.acceptanceRate"
        />
      </div>

      <!-- Section Financière -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <FinancialChart
          :total-amount-collected="stats.totalAmountCollected"
          :solid-hive-revenue="stats.solidHiveRevenue"
          :average-donation="stats.averageDonation"
        />
        <UsersAssociationsChart
          :users-count="stats.usersCount"
          :associations-count="stats.associationsCount"
        />
      </div>

      <!-- Section Classements -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <TopAssociationsChart :top5-associations="stats.top5Associations" />
        <ActiveAssociationChart :most-active-association="stats.mostActiveAssociation" />
      </div>

      <!-- Statistiques additionnelles -->
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        <Card>
          <CardContent class="p-3 sm:p-4 md:p-6">
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
              <TrendingUp
                class="text-primary h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9 md:h-10 md:w-10"
              />
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs sm:text-sm">Don Moyen</p>
                <p class="truncate text-lg font-bold sm:text-xl md:text-2xl">
                  {{ formatCurrency(stats.averageDonation) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-3 sm:p-4 md:p-6">
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Rocket class="text-accent h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9 md:h-10 md:w-10" />
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs sm:text-sm">Cagnottes Actives</p>
                <p class="text-lg font-bold sm:text-xl md:text-2xl">
                  {{ stats.activeFundraisings }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-3 sm:p-4 md:p-6">
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Building2
                class="text-secondary h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9 md:h-10 md:w-10"
              />
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs sm:text-sm">Nouvelles (30j)</p>
                <p class="text-lg font-bold sm:text-xl md:text-2xl">{{ stats.newAssociations }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-3 sm:p-4 md:p-6">
            <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Target class="h-8 w-8 flex-shrink-0 text-[#009B78] sm:h-9 sm:w-9 md:h-10 md:w-10" />
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs sm:text-sm">Taux Acceptation</p>
                <p class="text-lg font-bold sm:text-xl md:text-2xl">
                  {{ stats.acceptanceRate.toFixed(1) }}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import Database from '@/utils/database.utils';
  import Header from '@/components/dashboard/Header.vue';
  import EnhancedStatCard from '@/components/admin-dashboard/statistics/EnhancedStatCard.vue';
  import UsersAssociationsChart from '@/components/admin-dashboard/statistics/UsersAssociationsChart.vue';
  import FinancialChart from '@/components/admin-dashboard/statistics/FinancialChart.vue';
  import TopAssociationsChart from '@/components/admin-dashboard/statistics/TopAssociationsChart.vue';
  import ActiveAssociationChart from '@/components/admin-dashboard/statistics/ActiveAssociationChart.vue';
  import DonationsEvolutionChart from '@/components/admin-dashboard/statistics/DonationsEvolutionChart.vue';
  import MetricsRadarChart from '@/components/admin-dashboard/statistics/MetricsRadarChart.vue';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import {
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    Heart,
    TrendingUp,
    Wallet,
    Rocket,
    Target,
  } from 'lucide-vue-next';
  import type { Association } from '@/interfaces/association.interface';
  import { Status } from '@/enums/status';

  const associations = ref<Association[]>([]);
  const isLoadingAssociations = ref(false);
  const isLoadingStats = ref(false);

  interface Statistics {
    associationsCount: number;
    usersCount: number;
    donationsCount: number;
    totalAmountCollected: number;
    solidHiveRevenue: number;
    averageDonation: number;
    top5Associations: Array<{
      association: { name: string } | null;
      totalAmount: number;
    }>;
    topDonationAssociation: {
      association: { name: string } | null;
      totalAmount: number;
    } | null;
    donationsGrowth: number;
    activeFundraisings: number;
    newAssociations: number;
    acceptanceRate: number;
    mostActiveAssociation: {
      association: { name: string } | null;
      donationCount: number;
    } | null;
    monthlyDonations: Array<{ month: string; count: number }>;
  }

  const stats = ref<Statistics>({
    associationsCount: 0,
    usersCount: 0,
    donationsCount: 0,
    totalAmountCollected: 0,
    solidHiveRevenue: 0,
    averageDonation: 0,
    top5Associations: [],
    topDonationAssociation: null,
    donationsGrowth: 0,
    activeFundraisings: 0,
    newAssociations: 0,
    acceptanceRate: 0,
    mostActiveAssociation: null,
    monthlyDonations: [],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const associationStats = computed(() => {
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
    // Charger les associations
    isLoadingAssociations.value = true;
    try {
      const response = await Database.getAll('admin/associations');
      associations.value = Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des associations:', error);
      associations.value = [];
    } finally {
      isLoadingAssociations.value = false;
    }

    // Charger les statistiques globales
    isLoadingStats.value = true;
    try {
      const response = await Database.getAll('statistics');
      stats.value = response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      isLoadingStats.value = false;
    }
  });
</script>
