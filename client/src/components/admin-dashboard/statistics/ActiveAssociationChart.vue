<template>
  <Card class="h-full">
    <CardHeader class="px-4 py-3 sm:px-6 sm:py-4">
      <CardTitle class="text-sm sm:text-base md:text-lg">
        Association la plus active (30 derniers jours)
      </CardTitle>
    </CardHeader>
    <CardContent class="px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div v-if="mostActiveAssociation?.association" class="space-y-2 sm:space-y-4">
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1 space-y-0.5 pr-2 sm:space-y-1">
            <p class="truncate text-xs font-medium sm:text-sm">
              {{ mostActiveAssociation.association.name }}
            </p>
            <p class="text-muted-foreground text-[10px] sm:text-xs">
              {{ mostActiveAssociation.donationCount }} dons ce mois
            </p>
          </div>
          <div
            class="bg-accent/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
          >
            <TrendingUp class="text-accent h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        <div class="h-[150px] sm:h-[180px] md:h-[200px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <div v-else class="flex h-[200px] items-center justify-center sm:h-[230px] md:h-[250px]">
        <p class="text-muted-foreground text-xs sm:text-sm">Aucune donnée disponible</p>
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
  import { TrendingUp } from 'lucide-vue-next';

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

  interface Props {
    mostActiveAssociation?: {
      association: { name: string } | null;
      donationCount: number;
    } | null;
  }

  const props = defineProps<Props>();

  const chartData = computed(() => {
    // Simuler une progression sur 30 jours (à adapter avec de vraies données)
    const donationCount = props.mostActiveAssociation?.donationCount || 0;
    const labels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
    const data = [
      Math.floor(donationCount * 0.15),
      Math.floor(donationCount * 0.25),
      Math.floor(donationCount * 0.3),
      Math.floor(donationCount * 0.3),
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Nombre de dons',
          data,
          fill: true,
          borderColor: '#0497af',
          backgroundColor: 'rgba(4, 151, 175, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#0497af',
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
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y} dons`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
</script>
