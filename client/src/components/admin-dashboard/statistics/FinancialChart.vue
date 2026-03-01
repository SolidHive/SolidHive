<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">Performance Financière</CardTitle>
    </CardHeader>
    <CardContent class="px-2 pb-4 sm:px-4 md:px-6">
      <div v-if="totalAmountCollected > 0" class="space-y-4">
        <div class="h-[200px] sm:h-[250px] md:h-[300px]">
          <Doughnut :data="chartData" :options="chartOptions" />
        </div>
        <div class="space-y-1 sm:space-y-2">
          <div class="flex items-center justify-between text-xs sm:text-sm">
            <span class="text-muted-foreground truncate pr-2">Montant total collecté:</span>
            <span class="font-semibold whitespace-nowrap">
              {{ formatCurrency(totalAmountCollected) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs sm:text-sm">
            <span class="text-muted-foreground truncate pr-2">Revenus SolidHive:</span>
            <span class="text-accent font-semibold whitespace-nowrap">
              {{ formatCurrency(solidHiveRevenue) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs sm:text-sm">
            <span class="text-muted-foreground truncate pr-2">Don moyen:</span>
            <span class="font-semibold whitespace-nowrap">
              {{ formatCurrency(averageDonation) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center sm:h-[250px] md:h-[300px]">
        <p class="text-muted-foreground text-xs sm:text-sm">
          Il n'y a pas de données pour le moment
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Doughnut } from 'vue-chartjs';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  ChartJS.register(ArcElement, Tooltip, Legend);

  interface Props {
    totalAmountCollected: number;
    solidHiveRevenue: number;
    premiumRevenue: number;
    averageDonation: number;
  }

  const props = defineProps<Props>();

  const associationsRevenue = computed(
    () => props.totalAmountCollected - (props.solidHiveRevenue - props.premiumRevenue)
  );

  const chartData = computed(() => ({
    labels: ['Associations', 'SolidHive'],
    datasets: [
      {
        data: [associationsRevenue.value, props.solidHiveRevenue],
        backgroundColor: ['#510d6d', '#0497af'],
        hoverBackgroundColor: ['#6d1494', '#05b3d0'],
      },
    ],
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)} €`;
          },
        },
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
</script>
