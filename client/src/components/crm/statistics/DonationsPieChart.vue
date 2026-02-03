<template>
  <div v-if="direct + fundraisings > 0" class="h-48 sm:h-56 md:h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
  <div v-else class="flex h-48 items-center justify-center sm:h-56 md:h-64">
    <p class="text-muted-foreground text-xs sm:text-sm">Il n'y a pas de données pour le moment</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

  Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

  interface Props {
    direct: number;
    fundraisings: number;
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
      type: 'doughnut',
      data: {
        labels: ['Dons directs', 'Cagnottes'],
        datasets: [
          {
            data: [props.direct, props.fundraisings],
            backgroundColor: ['#510d6d', '#0497af'],
            borderColor: ['#510d6d', '#0497af'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: window.innerWidth < 640 ? 'bottom' : 'right',
            labels: {
              padding: window.innerWidth < 640 ? 8 : 12,
              font: {
                size: window.innerWidth < 640 ? 10 : 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                return `${context.label}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
              },
            },
          },
        },
      },
    });
  };

  onMounted(() => {
    createChart();
  });

  watch([() => props.direct, () => props.fundraisings], createChart);
</script>
