<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">
        Évolution des Dons (12 derniers mois)
      </CardTitle>
    </CardHeader>
    <CardContent class="px-2 pb-4 sm:px-4 md:px-6">
      <div v-if="chartData" class="h-[200px] sm:h-[250px] md:h-[300px]">
        <Line :data="chartData" :options="chartOptions" />
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
  import { Line } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );

  interface MonthlyDonation {
    month: string;
    count: number;
  }

  interface Props {
    monthlyDonations: MonthlyDonation[];
  }

  const props = defineProps<Props>();

  const chartData = computed(() => {
    if (!props.monthlyDonations || props.monthlyDonations.length === 0) {
      return null;
    }

    const labels = props.monthlyDonations.map((d) => d.month);
    const data = props.monthlyDonations.map((d) => d.count);

    return {
      labels,
      datasets: [
        {
          label: 'Nombre de dons',
          data,
          fill: true,
          borderColor: '#510d6d',
          backgroundColor: 'rgba(81, 13, 109, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#510d6d',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y} dons`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
</script>
