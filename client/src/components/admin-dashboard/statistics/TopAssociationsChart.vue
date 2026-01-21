<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">Top 5 Associations</CardTitle>
    </CardHeader>
    <CardContent class="px-2 pb-4 sm:px-4 md:px-6">
      <div class="h-[250px] sm:h-[350px] md:h-[400px]">
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Bar } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  interface Props {
    top5Associations?: Array<{
      association: { name: string } | null;
      totalAmount: number;
    }>;
  }

  const props = defineProps<Props>();

  const chartData = computed(() => {
    if (!props.top5Associations || props.top5Associations.length === 0) {
      return null;
    }

    const labels = props.top5Associations.map(
      (item) => item.association?.name || 'Association inconnue'
    );
    const data = props.top5Associations.map((item) => item.totalAmount);

    return {
      labels,
      datasets: [
        {
          label: 'Montant total (€)',
          backgroundColor: ['#510d6d', '#0497af', '#009B78', '#f26639', '#8574B3'],
          data,
        },
      ],
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.x.toFixed(2)} €`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value + ' €';
          },
        },
      },
    },
  };
</script>
