<template>
  <div class="bg-white border border-slate-300 rounded-lg p-3 flex flex-col h-full overflow-hidden shrink-0">
    <div class="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0 mb-2">
      <div>
        <h3 class="text-xs font-bold tracking-wider text-slate-800 uppercase">Tabla de Valores</h3>
        <p class="text-[10px] text-slate-400 mt-0.5">Pérdida de Transmisión R (dB) por banda</p>
      </div>
      <span class="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">
        fc = {{ fc.toFixed(0) }} Hz
      </span>
    </div>

    <!-- Table Container: supports horizontal scroll on mobile with min-width -->
    <div class="flex-grow overflow-x-auto overflow-y-auto rounded border border-slate-200 min-h-0 bg-white">
      <table class="w-full text-left border-collapse min-w-[520px]">
        <thead class="bg-slate-100 sticky top-0 z-10 text-[9px] font-bold text-slate-600 border-b border-slate-200">
          <tr>
            <th class="px-2.5 py-2 text-left font-bold w-16 bg-slate-100 border-r border-slate-200 sticky left-0 z-20">Frec. [Hz]</th>
            <th v-if="activeModels.massLawTheoretical" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #38bdf8;"></span>
              <span class="align-middle">M. Teor.</span>
            </th>
            <th v-if="activeModels.massLawCorrected" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #0284c7;"></span>
              <span class="align-middle">M. Corr.</span>
            </th>
            <th v-if="activeModels.iso12354" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #10b981;"></span>
              <span class="align-middle">ISO 12354</span>
            </th>
            <th v-if="activeModels.cremer" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #a855f7;"></span>
              <span class="align-middle">Cremer</span>
            </th>
            <th v-if="activeModels.sharp" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #ec4899;"></span>
              <span class="align-middle">Sharp</span>
            </th>
            <th v-if="activeModels.davy" class="px-2 py-2 font-bold truncate">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style="background-color: #eab308;"></span>
              <span class="align-middle">Davy</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-[10px] font-medium text-slate-700 font-mono">
          <tr 
            v-for="(f, idx) in frecuencias" 
            :key="f"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-2.5 py-1 text-slate-500 font-bold bg-slate-50 font-sans border-r border-slate-200 sticky left-0 z-10">
              {{ f }}
            </td>
            <td v-if="activeModels.massLawTheoretical" class="px-2 py-1 text-slate-600">
              {{ predictions.massLawTheoretical[idx] }}
            </td>
            <td v-if="activeModels.massLawCorrected" class="px-2 py-1 text-slate-600">
              {{ predictions.massLawCorrected[idx] }}
            </td>
            <td v-if="activeModels.iso12354" class="px-2 py-1" :class="{'text-emerald-700 font-bold bg-emerald-50/30': isCoincidence(f)}">
              {{ predictions.iso12354[idx] }}
            </td>
            <td v-if="activeModels.cremer" class="px-2 py-1" :class="{'text-purple-700 font-bold bg-purple-50/30': isCoincidence(f)}">
              {{ predictions.cremer[idx] }}
            </td>
            <td v-if="activeModels.sharp" class="px-2 py-1" :class="{'text-pink-700 font-bold bg-pink-50/30': isCoincidence(f)}">
              {{ predictions.sharp[idx] }}
            </td>
            <td v-if="activeModels.davy" class="px-2 py-1" :class="{'text-amber-700 font-bold bg-amber-50/30': isCoincidence(f)}">
              {{ predictions.davy[idx] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  frecuencias: {
    type: Array,
    required: true
  },
  predictions: {
    type: Object,
    required: true
  },
  fc: {
    type: Number,
    default: 0
  },
  activeModels: {
    type: Object,
    required: true
  }
});

// Highlight frequencies close to critical frequency (coincidence band)
const isCoincidence = (f) => {
  if (!props.fc) return false;
  return f >= props.fc * 0.75 && f <= props.fc * 1.25;
};
</script>

<style scoped>
/* Scrollbar settings for the table */
::-webkit-scrollbar {
  width: 5px;
  height: 5px; /* Added height for horizontal scrollbar */
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
