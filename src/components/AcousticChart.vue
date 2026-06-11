<template>
  <div class="relative w-full h-full rounded-lg bg-white border border-slate-300 p-3.5 flex flex-col gap-2.5">
    <!-- Header info -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
      <div>
        <h3 class="text-xs font-bold tracking-wider text-slate-800 uppercase">Gráfica Acústica</h3>
        <p class="text-[10px] text-slate-400 mt-0.5">Pérdida de Transmisión R (dB) vs Frecuencia (Hz)</p>
      </div>
      <span class="text-[10px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-bold">
        1/3 Octava
      </span>
    </div>

    <!-- Chart Canvas Container -->
    <div class="flex-grow w-full h-0 relative">
      <canvas ref="chartCanvas" class="absolute inset-0 w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  frecuencias: {
    type: Array,
    required: true
  },
  predictions: {
    type: Object,
    required: true
  },
  activeModels: {
    type: Object,
    required: true
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

const formatFrequency = (f) => {
  if (f >= 1000) {
    return `${f / 1000}k`;
  }
  return f.toString();
};

const getChartDatasets = () => {
  const datasets = [];

  if (props.activeModels.massLawTheoretical) {
    datasets.push({
      label: 'Ley de Masas Teórica',
      data: props.predictions.massLawTheoretical || [],
      borderColor: '#38bdf8', // blue
      backgroundColor: 'rgba(56, 189, 248, 0.05)',
      borderWidth: 1.5,
      borderDash: [4, 4],
      tension: 0.1,
      pointRadius: 1.5,
      pointHoverRadius: 4
    });
  }

  if (props.activeModels.massLawCorrected) {
    datasets.push({
      label: 'Ley de Masas Corregida',
      data: props.predictions.massLawCorrected || [],
      borderColor: '#0284c7', // darker blue
      backgroundColor: 'rgba(2, 132, 199, 0.05)',
      borderWidth: 1.5,
      tension: 0.1,
      pointRadius: 1.5,
      pointHoverRadius: 4
    });
  }

  if (props.activeModels.iso12354) {
    datasets.push({
      label: 'Norma ISO 12354-1',
      data: props.predictions.iso12354 || [],
      borderColor: '#10b981', // green
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 2,
      tension: 0.15,
      pointRadius: 2,
      pointHoverRadius: 5
    });
  }

  if (props.activeModels.sharp) {
    datasets.push({
      label: 'Modelo Sharp (1978)',
      data: props.predictions.sharp || [],
      borderColor: '#ec4899', // pink
      backgroundColor: 'rgba(236, 72, 153, 0.05)',
      borderWidth: 2,
      tension: 0.15,
      pointRadius: 2,
      pointHoverRadius: 5
    });
  }

  if (props.activeModels.davy) {
    datasets.push({
      label: 'Modelo Davy (2009)',
      data: props.predictions.davy || [],
      borderColor: '#eab308', // yellow
      backgroundColor: 'rgba(234, 179, 8, 0.05)',
      borderWidth: 2,
      tension: 0.15,
      pointRadius: 2,
      pointHoverRadius: 5
    });
  }

  return datasets;
};

const initChart = () => {
  if (!chartCanvas.value) return;

  const labels = props.frecuencias.map(formatFrequency);
  const datasets = getChartDatasets();

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Frecuencia [Hz]',
            color: '#475569',
            font: { size: 10, weight: 'bold' }
          },
          grid: {
            color: '#e2e8f0', // Clean grey grid for light mode
            drawBorder: false
          },
          ticks: {
            color: '#475569',
            font: { size: 9 }
          }
        },
        y: {
          title: {
            display: true,
            text: 'R [dB]',
            color: '#475569',
            font: { size: 10, weight: 'bold' }
          },
          grid: {
            color: '#e2e8f0',
            drawBorder: false
          },
          ticks: {
            color: '#475569',
            font: { size: 9 }
          },
          min: 0,
          suggestedMax: 80
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#334155', // Dark slate text
            boxWidth: 8,
            boxHeight: 8,
            padding: 8,
            font: { size: 9, family: "'Inter', sans-serif", weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#ffffffdd',
          titleColor: '#0f172a',
          bodyColor: '#334155',
          borderColor: '#cbd5e1',
          borderWidth: 1,
          padding: 8,
          titleFont: { size: 10, weight: 'bold' },
          bodyFont: { size: 9 },
          callbacks: {
            label: (context) => {
              return ` ${context.dataset.label}: ${context.parsed.y} dB`;
            }
          }
        }
      }
    }
  });
};

watch([() => props.predictions, () => props.activeModels], () => {
  if (chartInstance) {
    chartInstance.data.datasets = getChartDatasets();
    
    let maxVal = 50;
    Object.keys(props.predictions).forEach(key => {
      if (props.activeModels[key]) {
        const arr = props.predictions[key];
        if (Array.isArray(arr) && arr.length > 0) {
          const localMax = Math.max(...arr);
          if (localMax > maxVal) maxVal = localMax;
        }
      }
    });
    chartInstance.options.scales.y.suggestedMax = Math.ceil(maxVal / 10) * 10 + 10;
    
    chartInstance.update();
  }
}, { deep: true });

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
/* Scoped styles */
</style>
