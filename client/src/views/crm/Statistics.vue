<template>
  <Header>
    <template #header>Statistiques</template>
    <template #description>Consultez les performances et l'activité de votre association</template>
  </Header>
  <div class="px-3 py-3 sm:px-4 sm:py-4 md:px-8 lg:px-12">
    <div class="mx-auto max-w-[1600px] space-y-3 sm:space-y-4 md:space-y-6">
      <!-- Loading -->
      <LoadingOverlay v-if="isLoading" :show="true" message="Chargement des statistiques..." />

      <!-- Stats Grid -->
      <template v-else>
        <!-- Cartes principales -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-3">
          <StatCard
            title="Dons reçus"
            :value="statistics.donations.total"
            :growth="statistics.donations.growth"
            icon="Heart"
            color="primary"
          />
          <StatCard
            title="Montant collecté"
            :value="formatCurrency(statistics.donations.amount)"
            icon="Euro"
            color="success"
            custom-color="#009B78"
          />
          <StatCard
            title="Don moyen"
            :value="formatCurrency(statistics.donations.average)"
            icon="TrendingUp"
            color="secondary"
          />
        </div>

        <!-- Graphiques -->
        <div class="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          <!-- Évolution des dons -->
          <div class="bg-card border-border rounded-xl border p-4 shadow-sm sm:p-6">
            <h2 class="font-subtitle text-foreground mb-3 text-sm sm:mb-4 sm:text-base md:text-lg">
              Évolution des dons
            </h2>
            <DonationsChart :data="statistics.monthlyDonations" />
          </div>

          <!-- Répartition des dons -->
          <div class="bg-card border-border rounded-xl border p-4 shadow-sm sm:p-6">
            <h2 class="font-subtitle text-foreground mb-3 text-sm sm:mb-4 sm:text-base md:text-lg">
              Répartition des dons
            </h2>
            <DonationsPieChart
              :direct="statistics.donations.direct.amount"
              :fundraisings="statistics.donations.fundraisings.amount"
            />
          </div>
        </div>

        <!-- Top cagnottes -->
        <div class="bg-card border-border rounded-xl border p-4 shadow-sm sm:p-6">
          <h2 class="font-subtitle text-foreground mb-3 text-sm sm:mb-4 sm:text-base md:text-lg">
            Top 5 cagnottes
          </h2>
          <TopFundraisingsTable :fundraisings="statistics.fundraisings.top" />
        </div>

        <!-- Stats secondaires -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            title="Cagnottes totales"
            :value="statistics.fundraisings.total"
            icon="Target"
            color="warning"
            :subtitle="`${statistics.fundraisings.active} actives`"
          />
          <StatCard
            title="Événements"
            :value="statistics.events.total"
            icon="Calendar"
            color="accent"
            :subtitle="`${statistics.events.upcoming} à venir`"
          />
          <StatCard
            title="Revenus événements"
            :value="formatCurrency(statistics.events.revenue)"
            icon="Ticket"
            color="success"
            custom-color="#009B78"
          />
          <StatCard
            title="Membres"
            :value="statistics.members.total"
            icon="UserCheck"
            color="secondary"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Header from '@/components/dashboard/Header.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import StatCard from '@/components/crm/statistics/StatCard.vue';
  import DonationsChart from '@/components/crm/statistics/DonationsChart.vue';
  import DonationsPieChart from '@/components/crm/statistics/DonationsPieChart.vue';
  import TopFundraisingsTable from '@/components/crm/statistics/TopFundraisingsTable.vue';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import { useCrmStore } from '@/stores/crm';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';

  const crmStore = useCrmStore();
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);

  const isLoading = ref(true);
  const statistics = ref<any>({
    donations: {
      total: 0,
      amount: 0,
      average: 0,
      growth: 0,
      direct: { count: 0, amount: 0 },
      fundraisings: { count: 0, amount: 0 },
    },
    events: {
      total: 0,
      upcoming: 0,
      revenue: 0,
      participants: 0,
    },
    fundraisings: {
      total: 0,
      active: 0,
      top: [],
    },
    members: {
      total: 0,
    },
    totalRevenue: 0,
    monthlyDonations: [],
  });

  const associationId = computed(() => crmStore.currentAssociationId || '');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const loadStatistics = async () => {
    try {
      isLoading.value = true;
      const data = await Database.getOne(`associations/${associationId.value}/statistics`, '');
      statistics.value = data;
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Impossible de charger les statistiques');
    } finally {
      isLoading.value = false;
    }
  };

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.STATISTICS_VIEW
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: {
          id: route.params.id,
        },
      });
      return;
    }

    if (!crmAccess.canAccessToStatistics) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    loadStatistics();
  });
</script>
