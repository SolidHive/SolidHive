<template>
  <div v-if="data.length > 0" class="h-48 sm:h-56 md:h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
  <div v-else class="flex h-48 items-center justify-center sm:h-56 md:h-64">
    <p class="text-muted-foreground text-xs sm:text-sm">Il n'y a pas de données pour le moment</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

  Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

  interface Props {
    data: Array<{ month: string; amount: number; count: number }>;
  }

  const props = defineProps<Props>();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chartInstance: Chart | null = null;

  const createChart = () => {
    if (!chartCanvas.value) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: props.data.map((d) => d.month),
        datasets: [
          {
            label: 'Montant collecté (€)',
            data: props.data.map((d) => d.amount),
            backgroundColor: 'rgba(81, 13, 109, 0.8)',
            borderColor: '#510d6d',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            padding: window.innerWidth < 640 ? 8 : 12,
            titleFont: {
              size: window.innerWidth < 640 ? 11 : 13,
            },
            bodyFont: {
              size: window.innerWidth < 640 ? 10 : 12,
            },
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: window.innerWidth < 640 ? 9 : 11,
              },
              callback: (value) => {
                return `${value}€`;
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            ticks: {
              font: {
                size: window.innerWidth < 640 ? 9 : 11,
              },
              maxRotation: window.innerWidth < 640 ? 45 : 0,
              minRotation: window.innerWidth < 640 ? 45 : 0,
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  };

  onMounted(() => {
    createChart();
  });

  watch(() => props.data, createChart, { deep: true });
</script>
