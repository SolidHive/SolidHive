<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">Indicateurs Clés</CardTitle>
    </CardHeader>
    <CardContent class="px-2 pb-4 sm:px-4 md:px-6">
      <div v-if="hasData" class="h-[200px] sm:h-[250px] md:h-[300px]">
        <Radar :data="chartData" :options="chartOptions" />
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
  import { Radar } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

  interface Props {
    donationsCount: number;
    usersCount: number;
    associationsCount: number;
    activeFundraisings: number;
    acceptanceRate: number;
  }

  const props = defineProps<Props>();

  const hasData = computed(
    () =>
      props.donationsCount > 0 ||
      props.usersCount > 0 ||
      props.associationsCount > 0 ||
      props.activeFundraisings > 0 ||
      props.acceptanceRate > 0
  );

  const chartData = computed(() => {
    // Normaliser les valeurs sur 100
    const maxDonations = Math.max(props.donationsCount, 100);
    const maxUsers = Math.max(props.usersCount, 100);
    const maxAssociations = Math.max(props.associationsCount, 50);
    const maxFundraisings = Math.max(props.activeFundraisings, 20);

    return {
      labels: ['Dons', 'Utilisateurs', 'Associations', 'Cagnottes', 'Taux Acceptation'],
      datasets: [
        {
          label: 'Métriques',
          data: [
            (props.donationsCount / maxDonations) * 100,
            (props.usersCount / maxUsers) * 100,
            (props.associationsCount / maxAssociations) * 100,
            (props.activeFundraisings / maxFundraisings) * 100,
            props.acceptanceRate,
          ],
          backgroundColor: 'rgba(81, 13, 109, 0.2)',
          borderColor: '#510d6d',
          borderWidth: 2,
          pointBackgroundColor: '#510d6d',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#510d6d',
        },
      ],
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            let value = '';
            switch (label) {
              case 'Dons':
                value = `${props.donationsCount} dons`;
                break;
              case 'Utilisateurs':
                value = `${props.usersCount} utilisateurs`;
                break;
              case 'Associations':
                value = `${props.associationsCount} associations`;
                break;
              case 'Cagnottes':
                value = `${props.activeFundraisings} cagnottes`;
                break;
              case 'Taux Acceptation':
                value = `${props.acceptanceRate.toFixed(1)}%`;
                break;
            }
            return value;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function (value: any) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };
</script>
