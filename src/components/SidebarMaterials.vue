<template>
  <div class="flex flex-col h-full bg-[#f8fafc] text-slate-700 text-xs">
    <!-- Main Tabs: Single | Double | Triple -->
    <div class="flex border-b border-slate-300 bg-slate-200/50 shrink-0">
      <button 
        class="px-4 py-2 border-r border-slate-300 font-bold bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]"
      >
        Pared Simple (Single)
      </button>
      <button 
        disabled 
        class="px-4 py-2 border-r border-slate-300 text-slate-400 bg-slate-200/30 cursor-not-allowed"
        title="No habilitado en TP1"
      >
        Doble (Double)
      </button>
      <button 
        disabled 
        class="px-4 py-2 border-r border-slate-300 text-slate-400 bg-slate-200/30 cursor-not-allowed"
        title="No habilitado en TP1"
      >
        Triple (Triple)
      </button>
    </div>

    <!-- Sub Tabs: Panel 1 | Frame 1 | Leak -->
    <div class="flex border-b border-slate-300 bg-slate-100/60 shrink-0">
      <button 
        class="px-3.5 py-1.5 border-r border-slate-300 font-semibold bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]"
      >
        Paramento 1 (Panel)
      </button>
      <button 
        disabled 
        class="px-3.5 py-1.5 border-r border-slate-300 text-slate-400 bg-slate-100/20 cursor-not-allowed"
      >
        Estructura (Frame)
      </button>
      <button 
        disabled 
        class="px-3.5 py-1.5 border-r border-slate-300 text-slate-400 bg-slate-100/20 cursor-not-allowed"
      >
        Fugas (Leak)
      </button>
    </div>

    <!-- Panel Scrollable Workspace -->
    <div class="flex-grow overflow-y-auto p-3 flex flex-col gap-4 min-h-0 bg-[#f8fafc]">
      <!-- Database Preset Selection: INSUL listbox style -->
      <div class="flex flex-col gap-1.5 shrink-0">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Base de datos de Materiales Preset</label>
        <select 
          :value="modelValue.id" 
          @change="onPresetChange($event.target.value)"
          size="4"
          class="w-full bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 text-slate-800 font-medium cursor-pointer"
        >
          <option value="custom">-- Personalizado (Ajuste Manual) --</option>
          <option v-for="mat in presets" :key="mat.id" :value="mat.id">
            {{ mat.nombre }} ({{ mat.densidad }} kg/m³)
          </option>
        </select>
        
        <!-- Actions for Presets -->
        <div class="flex gap-2 mt-1 shrink-0">
          <button 
            type="button"
            @click="createNewCustomMaterial"
            class="flex-grow py-1.5 px-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded font-bold text-[10px] text-center cursor-pointer transition-all active:scale-[0.98] shadow-sm select-none"
          >
            Nuevo Material
          </button>
          <button 
            type="button"
            @click="saveCurrentAsPreset"
            class="flex-grow py-1.5 px-2 bg-[#0b5b8c] hover:bg-[#07476e] text-white rounded font-bold text-[10px] text-center cursor-pointer transition-all active:scale-[0.98] shadow-sm select-none"
          >
            Guardar en Lista
          </button>
        </div>
      </div>

      <!-- Nombre del Material -->
      <div class="flex flex-col gap-1.5 shrink-0">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nombre del Material</label>
        <input 
          type="text" 
          :value="modelValue.nombre" 
          @input="updateProp('nombre', $event.target.value)"
          placeholder="Nombre del material..."
          class="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- Mechanical Properties -->
      <div class="flex flex-col gap-4 shrink-0">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1">Propiedades Físicas Principales</span>
        
        <!-- Espesor (mm) -->
        <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
          <div class="flex items-center justify-between md:col-span-5">
            <span class="text-slate-600 font-bold md:font-medium">Espesor (mm)</span>
            <input 
              type="number" 
              :value="Number((modelValue.espesor * 1000).toFixed(1))" 
              @input="updateProp('espesor', $event.target.value / 1000)"
              step="0.1"
              min="0.1"
              class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="col-span-4 flex items-center">
            <input 
              type="range" 
              :value="modelValue.espesor * 1000"
              @input="updateProp('espesor', $event.target.value / 1000)"
              min="1"
              max="300"
              step="0.5"
              class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
          <div class="hidden md:block md:col-span-3">
            <input 
              type="number" 
              :value="Number((modelValue.espesor * 1000).toFixed(1))" 
              @input="updateProp('espesor', $event.target.value / 1000)"
              step="0.1"
              min="0.1"
              class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Ancho (m) -->
        <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
          <div class="flex items-center justify-between md:col-span-5">
            <span class="text-slate-600 font-bold md:font-medium">Ancho (m)</span>
            <input 
              type="number" 
              :value="modelValue.lx !== undefined ? modelValue.lx : 1.5" 
              @input="updateProp('lx', Number($event.target.value))"
              step="0.1"
              min="0.1"
              class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="col-span-4 flex items-center">
            <input 
              type="range" 
              :value="modelValue.lx !== undefined ? modelValue.lx : 1.5"
              @input="updateProp('lx', Number($event.target.value))"
              min="0.2"
              max="15.0"
              step="0.1"
              class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
          <div class="hidden md:block md:col-span-3">
            <input 
              type="number" 
              :value="modelValue.lx !== undefined ? modelValue.lx : 1.5" 
              @input="updateProp('lx', Number($event.target.value))"
              step="0.1"
              min="0.1"
              class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Alto (m) -->
        <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
          <div class="flex items-center justify-between md:col-span-5">
            <span class="text-slate-600 font-bold md:font-medium">Alto (m)</span>
            <input 
              type="number" 
              :value="modelValue.ly !== undefined ? modelValue.ly : 1.2" 
              @input="updateProp('ly', Number($event.target.value))"
              step="0.1"
              min="0.1"
              class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="col-span-4 flex items-center">
            <input 
              type="range" 
              :value="modelValue.ly !== undefined ? modelValue.ly : 1.2"
              @input="updateProp('ly', Number($event.target.value))"
              min="0.2"
              max="15.0"
              step="0.1"
              class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
          <div class="hidden md:block md:col-span-3">
            <input 
              type="number" 
              :value="modelValue.ly !== undefined ? modelValue.ly : 1.2" 
              @input="updateProp('ly', Number($event.target.value))"
              step="0.1"
              min="0.1"
              class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Toggle Modo Avanzado -->
        <div class="mt-2 shrink-0">
          <button 
            type="button"
            @click="showAdvanced = !showAdvanced"
            class="w-full flex items-center justify-between py-2 px-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded text-[10px] font-bold text-slate-700 cursor-pointer select-none transition-all active:scale-[0.99] shadow-sm"
          >
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {{ showAdvanced ? 'Ocultar Parámetros Avanzados' : 'Modo Avanzado (Densidad, Young, etc.)' }}
            </span>
            <svg class="w-3 h-3 transform transition-transform duration-200" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Advanced Mechanical Properties Section -->
        <div v-show="showAdvanced" class="flex flex-col gap-4 border-t border-slate-200 pt-3 mt-1 animate-fade-in">
          <!-- Densidad (kg/m3) -->
          <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
            <div class="flex items-center justify-between md:col-span-5">
              <span class="text-slate-600 font-bold md:font-medium">Densidad (kg/m³)</span>
              <input 
                type="number" 
                :value="modelValue.densidad" 
                @input="updateProp('densidad', Number($event.target.value))"
                class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-4 flex items-center">
              <input 
                type="range" 
                :value="modelValue.densidad"
                @input="updateProp('densidad', Number($event.target.value))"
                min="100"
                max="8000"
                step="50"
                class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
            <div class="hidden md:block md:col-span-3">
              <input 
                type="number" 
                :value="modelValue.densidad" 
                @input="updateProp('densidad', Number($event.target.value))"
                class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Young (GPa) -->
          <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
            <div class="flex items-center justify-between md:col-span-5">
              <span class="text-slate-600 font-bold md:font-medium">Módulo Young (GPa)</span>
              <input 
                type="number" 
                :value="parseFloat((modelValue.young / 1e9).toFixed(3))" 
                @input="updateProp('young', Number($event.target.value) * 1e9)"
                step="0.001"
                class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-4 flex items-center">
              <input 
                type="range" 
                :value="modelValue.young / 1e9"
                @input="updateProp('young', Number($event.target.value) * 1e9)"
                min="0.1"
                max="200"
                step="0.5"
                class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
            <div class="hidden md:block md:col-span-3">
              <input 
                type="number" 
                :value="parseFloat((modelValue.young / 1e9).toFixed(3))" 
                @input="updateProp('young', Number($event.target.value) * 1e9)"
                step="0.001"
                class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Amortiguamiento (eta) -->
          <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
            <div class="flex items-center justify-between md:col-span-5">
              <span class="text-slate-600 font-bold md:font-medium">Amortiguamiento (&eta;)</span>
              <input 
                type="number" 
                :value="modelValue.amortiguamiento" 
                @input="updateProp('amortiguamiento', Number($event.target.value))"
                step="0.0001"
                class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-4 flex items-center">
              <input 
                type="range" 
                :value="modelValue.amortiguamiento"
                @input="updateProp('amortiguamiento', Number($event.target.value))"
                min="0.0001"
                max="0.1"
                step="0.001"
                class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
            <div class="hidden md:block md:col-span-3">
              <input 
                type="number" 
                :value="modelValue.amortiguamiento" 
                @input="updateProp('amortiguamiento', Number($event.target.value))"
                step="0.0001"
                class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Poisson (nu) -->
          <div class="flex flex-col gap-1.5 md:grid md:grid-cols-12 md:items-center md:gap-2">
            <div class="flex items-center justify-between md:col-span-5">
              <span class="text-slate-600 font-bold md:font-medium">Módulo Poisson (&nu;)</span>
              <input 
                type="number" 
                :value="modelValue.poisson" 
                @input="updateProp('poisson', Number($event.target.value))"
                step="0.01"
                class="w-16 text-right md:hidden bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-4 flex items-center">
              <input 
                type="range" 
                :value="modelValue.poisson"
                @input="updateProp('poisson', Number($event.target.value))"
                min="0.0"
                max="0.49"
                step="0.01"
                class="w-full accent-[#0b5b8c] h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
            <div class="hidden md:block md:col-span-3">
              <input 
                type="number" 
                :value="modelValue.poisson" 
                @input="updateProp('poisson', Number($event.target.value))"
                step="0.01"
                class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Excel Upload Actions (Bottom bar of top config card) -->
    <div class="p-2.5 border-t border-slate-300 bg-slate-100 flex items-center justify-between gap-2 shrink-0">
      <input 
        type="file" 
        id="sideImport" 
        accept=".xlsx, .xls, .json"
        @change="onFileImport" 
        class="hidden"
      />
      <label 
        for="sideImport"
        class="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded cursor-pointer font-bold transition-all shadow-sm select-none active:scale-[0.98] text-[11px]"
      >
        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Cargar base de datos (Excel)
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { read, utils } from 'xlsx';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  presets: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'addPresets', 'savePreset']);

const showAdvanced = ref(false);

const onPresetChange = (presetId) => {
  if (presetId === 'custom') {
    emit('update:modelValue', {
      ...props.modelValue,
      id: 'custom',
      nombre: 'Personalizado',
      descripcion: 'Propiedades físicas ajustadas manualmente.'
    });
    return;
  }
  
  const selected = props.presets.find(p => p.id === presetId);
  if (selected) {
    emit('update:modelValue', { 
      ...selected,
      lx: props.modelValue.lx !== undefined ? props.modelValue.lx : 1.5,
      ly: props.modelValue.ly !== undefined ? props.modelValue.ly : 1.2
    });
  }
};

const updateProp = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    // Keep custom prefix if already custom, otherwise flag it as custom
    id: props.modelValue.id === 'custom' || props.modelValue.id.startsWith('custom_') ? props.modelValue.id : 'custom',
    [key]: value
  });
};

const saveCurrentAsPreset = () => {
  const defaultName = props.modelValue.nombre === 'Personalizado' ? 'Nuevo Material' : props.modelValue.nombre;
  const name = prompt("Nombre del material para guardar en la base de datos:", defaultName);
  if (!name) return;
  
  const savedMaterial = {
    ...props.modelValue,
    id: `custom_${Date.now()}`,
    nombre: name
  };
  emit('savePreset', savedMaterial);
};

const createNewCustomMaterial = () => {
  const newMat = {
    id: `custom_${Date.now()}`,
    nombre: 'Nuevo Material',
    densidad: 1000,
    young: 1e9,
    amortiguamiento: 0.01,
    espesor: 0.01,
    poisson: 0.3,
    lx: 1.5,
    ly: 1.2,
    color: '#64748b',
    descripcion: 'Material creado manualmente.'
  };
  emit('update:modelValue', newMat);
};

const onFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.name.endsWith('.json')) {
    reader.onload = (e) => {
      try {
        const materials = JSON.parse(e.target.result);
        if (Array.isArray(materials)) {
          emit('addPresets', materials);
        } else {
          alert('El archivo JSON debe contener un array de materiales.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  } else {
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = utils.sheet_to_json(worksheet);
        
        const importedPresets = rows.map((row, idx) => {
          return {
            id: `imported_${Date.now()}_${idx}`,
            nombre: row.nombre || row.Nombre || `Material ${idx + 1}`,
            densidad: Number(row.densidad || row.Densidad || 1000),
            young: Number(row.young || row.youngModulus || row.Módulo_Young || 1e9),
            amortiguamiento: Number(row.amortiguamiento || row.damping || row.Amortiguamiento || 0.01),
            espesor: Number(row.espesor || row.thickness || row.Espesor || 0.01),
            poisson: Number(row.poisson || row.poissonRatio || row.Poisson || 0.3),
            color: row.color || row.Color || '#64748b',
            descripcion: row.descripcion || row.Descripción || 'Material importado.'
          };
        });
        
        if (importedPresets.length > 0) {
          emit('addPresets', importedPresets);
          emit('update:modelValue', importedPresets[0]);
        } else {
          alert('No se encontraron filas con datos de materiales.');
        }
      } catch (err) {
        alert('Error al procesar el archivo de Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }
  
  event.target.value = '';
};
</script>

<style scoped>
/* Range Slider Styling for desktop CAD appearance */
input[type="range"]::-webkit-slider-thumb {
  border: 1px solid #475569;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #0b5b8c;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -4px;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
