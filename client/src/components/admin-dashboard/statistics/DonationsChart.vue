<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle>Aperçu des dons</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-[300px]">
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
        <div v-else class="flex h-full items-center justify-center">
          <p class="text-muted-foreground text-xs sm:text-sm">
            Il n'y a pas de données pour le moment
          </p>
        </div>
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
    topDonationAssociation?: {
      association: { name: string } | null;
      totalAmount: number;
    } | null;
    mostActiveAssociation?: {
      association: { name: string } | null;
      donationCount: number;
    } | null;
  }

  const props = defineProps<Props>();

  const chartData = computed(() => {
    const labels: string[] = [];
    const data: number[] = [];

    if (props.topDonationAssociation?.association) {
      labels.push(props.topDonationAssociation.association.name);
      data.push(props.topDonationAssociation.totalAmount);
    }

    if (
      props.mostActiveAssociation?.association &&
      props.mostActiveAssociation.association.name !==
        props.topDonationAssociation?.association?.name
    ) {
      labels.push(props.mostActiveAssociation.association.name);
      // Pour afficher le nombre de dons (on peut multiplier par 10 pour visualisation)
      data.push(props.mostActiveAssociation.donationCount * 10);
    }

    if (labels.length === 0) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Montant des dons (€)',
          backgroundColor: '#f26639',
          data,
        },
      ],
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} €`;
          },
        },
      },
    },
    scales: {
      y: {
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
