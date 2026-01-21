<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">
        Répartition Utilisateurs et Associations
      </CardTitle>
    </CardHeader>
    <CardContent class="px-2 pb-4 sm:px-4 md:px-6">
      <div class="h-[200px] sm:h-[250px] md:h-[300px]">
        <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
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
    usersCount: number;
    associationsCount: number;
  }

  const props = defineProps<Props>();

  const chartData = computed(() => ({
    labels: ['Utilisateurs', 'Associations'],
    datasets: [
      {
        data: [props.usersCount, props.associationsCount],
        backgroundColor: ['#0497af', '#510d6d'],
        hoverBackgroundColor: ['#05b3d0', '#6d1494'],
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
            return `${label}: ${value}`;
          },
        },
      },
    },
  };
</script>
