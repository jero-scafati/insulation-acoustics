<template>
  <div class="h-screen w-screen flex flex-col bg-[#edf1f5] text-slate-800 text-xs overflow-hidden font-sans select-none">
    
    <!-- 1. Top Classical Menu Bar (Desktop Software Style) -->
    <header class="h-8 bg-white border-b border-slate-300 flex items-center justify-between px-3 shrink-0">
      <div class="flex items-center gap-4">
        <span class="font-black text-[#0b5b8c] tracking-tight">AcoustiCAD v1.2</span>
        <div class="flex gap-3 text-slate-600">
          <button class="hover:text-black font-semibold cursor-pointer">Archivo</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="triggerImport">Importar...</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="exportToExcel">Exportar Reporte...</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="showInfoModal = true">Ayuda / Acerca de</button>
        </div>
      </div>
      <div class="flex items-center gap-2 text-[10px] text-slate-400">
        <span>Norma de referencia: ISO 12354-1 / ISO 717-1</span>
      </div>
    </header>

    <!-- Hidden file input for import -->
    <input 
      type="file" 
      ref="importInput" 
      accept=".xlsx, .xls, .json"
      @change="onFileImport" 
      class="hidden"
    />

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- 2. Left Shortcut Toolbar (Icon-driven CAD Panel) -->
      <aside class="w-14 bg-white border-r border-slate-300 flex flex-col items-center py-4 justify-between shrink-0">
        <div class="flex flex-col items-center gap-3.5 w-full">
          <!-- Open File Database -->
          <button 
            @click="triggerImport"
            class="w-10 h-10 hover:bg-slate-100 text-slate-600 hover:text-[#0b5b8c] rounded border border-transparent hover:border-slate-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Cargar base de datos (Excel)"
          >
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>

          <!-- Save Report Excel -->
          <button 
            @click="exportToExcel"
            class="w-10 h-10 hover:bg-slate-100 text-slate-600 hover:text-[#0b5b8c] rounded border border-transparent hover:border-slate-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Exportar Reporte (Excel)"
          >
            <svg class="w-5 h-5 text-[#0b5b8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <!-- Toggle All Models ON/OFF -->
          <button 
            @click="toggleAllModels"
            class="w-10 h-10 hover:bg-slate-100 text-slate-600 hover:text-[#0b5b8c] rounded border border-transparent hover:border-slate-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Activar/Desactivar todos los modelos"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col items-center gap-3">
          <!-- Info modal trigger -->
          <button 
            @click="showInfoModal = true"
            class="w-10 h-10 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded flex items-center justify-center transition-all active:scale-95"
            title="Información Técnica"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </aside>

      <!-- 3. Central Canvas Area (Dynamic visual wall and output header) -->
      <main class="flex-1 flex flex-col bg-white overflow-hidden">
        
        <!-- Header de Resultados (Top Panel in Main) -->
        <div class="h-16 border-b border-slate-300 flex justify-between items-center px-6 bg-[#f8fafc] shrink-0">
          <!-- Left side: Material mechanical summaries -->
          <div class="flex items-center gap-6">
            <div>
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paramento de Ensayo</div>
              <div class="text-sm font-black text-slate-800">{{ activeMaterial.nombre }}</div>
            </div>
            <div class="h-8 w-[1px] bg-slate-300"></div>
            <div>
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Masa Superficial</div>
              <div class="text-xs font-bold text-slate-700">
                {{ (activeMaterial.densidad * activeMaterial.espesor).toFixed(2) }} <span class="text-[10px] font-medium text-slate-500">kg/m²</span>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-slate-300"></div>
            <div>
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Frecuencia Crítica (fc)</div>
              <div class="text-xs font-bold text-yellow-600 font-mono">{{ fc.toFixed(1) }} Hz</div>
            </div>
          </div>

          <!-- Right side: Huge Rw Single-Number Rating Display (INSUL style) -->
          <div class="flex items-center gap-4">
            <div class="flex flex-col text-right">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cálculo Global (ISO 717-1)</span>
              
              <!-- Mini selector for primary model display -->
              <select 
                v-model="primaryModel"
                class="bg-transparent text-[10px] font-bold text-[#0b5b8c] border-b border-transparent hover:border-[#0b5b8c] focus:outline-none cursor-pointer p-0 text-right uppercase"
              >
                <option v-for="opt in modelOptions" :key="opt.key" :value="opt.key">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            
            <div class="flex items-center gap-3 bg-[#edf1f5] px-4 py-1 rounded border border-slate-300 shadow-sm">
              <div class="flex flex-col items-center">
                <span class="text-3xl font-black text-[#0b5b8c] font-mono leading-none">
                  {{ primaryRwInfo.val }}
                </span>
                <span class="text-[9px] text-[#0b5b8c]/80 font-bold uppercase tracking-tight mt-0.5">dB</span>
              </div>
              <div class="flex flex-col justify-center text-[10px] font-mono text-slate-500 leading-normal border-l border-slate-300 pl-2">
                <span>C: {{ primaryRwInfo.C }} dB</span>
                <span>Ctr: {{ primaryRwInfo.Ctr }} dB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Three.js Canvas Container -->
        <div class="flex-1 relative bg-white min-h-0">
          <Canvas3D 
            ref="canvas3dRef"
            :espesor="activeMaterial.espesor"
            :color="activeMaterial.color"
          />
        </div>
      </main>

      <!-- 4. Right Sidebar: Configuration and Analysis Stack (Width 500px) -->
      <aside class="w-[500px] border-l border-slate-300 flex flex-col bg-[#f8fafc] shrink-0 overflow-hidden">
        
        <!-- Top Half: Configuration Panel (Single/Double/Triple tabs inside) -->
        <div class="h-1/2 border-b border-slate-300 min-h-0">
          <SidebarMaterials 
            v-model="activeMaterial"
            :presets="presets"
            @addPresets="addNewPresets"
          />
        </div>

        <!-- Bottom Half: Analysis Panel (Togglable Chart vs Table tabs) -->
        <div class="h-1/2 flex flex-col bg-white min-h-0">
          <!-- Chart / Table selection tab bar -->
          <div class="flex border-b border-slate-300 bg-slate-100 shrink-0">
            <button 
              @click="activeAnalysisTab = 'chart'"
              class="px-4 py-2 border-r border-slate-300 font-bold text-[11px] uppercase tracking-wide transition-all"
              :class="activeAnalysisTab === 'chart' 
                ? 'bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]' 
                : 'text-slate-500 hover:text-slate-800 bg-slate-200/50'"
            >
              Gráfico de Aislamiento (Chart)
            </button>
            <button 
              @click="activeAnalysisTab = 'table'"
              class="px-4 py-2 border-r border-slate-300 font-bold text-[11px] uppercase tracking-wide transition-all"
              :class="activeAnalysisTab === 'table' 
                ? 'bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]' 
                : 'text-slate-500 hover:text-slate-800 bg-slate-200/50'"
            >
              Tabla de Frecuencias (Table)
            </button>
          </div>

          <!-- Tab display area -->
          <div class="flex-grow min-h-0 relative p-3 bg-white">
            <AcousticChart 
              v-show="activeAnalysisTab === 'chart'"
              :frecuencias="FRECUENCIAS_TERCIO"
              :predictions="predictions"
              :activeModels="activeModels"
            />
            <ResultsTable 
              v-show="activeAnalysisTab === 'table'"
              :frecuencias="FRECUENCIAS_TERCIO"
              :predictions="predictions"
              :fc="fc"
              :activeModels="activeModels"
            />
          </div>
        </div>
      </aside>

      <!-- 5. Rightmost Control Strip (Auxiliary CAD actions) -->
      <aside class="w-12 bg-[#edf1f5] border-l border-slate-300 flex flex-col items-center py-4 justify-between shrink-0 select-none">
        <!-- Top Toolbar List -->
        <div class="flex flex-col items-center gap-3 w-full">
          <!-- Active models checkboxes as a tool vertical layout -->
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest writing-mode-vertical rotate-180 mb-2">Modelos</span>
          
          <button 
            v-for="model in modelOptions" 
            :key="model.key"
            @click="toggleModel(model.key)"
            class="w-8 h-8 rounded flex items-center justify-center transition-all border shadow-sm relative group active:scale-95"
            :class="activeModels[model.key] 
              ? 'bg-white border-slate-400 text-slate-800 font-bold' 
              : 'bg-slate-200/60 border-slate-300 text-slate-400'"
            :title="`Mostrar/Ocultar: ${model.label}`"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: activeModels[model.key] ? model.color : '#94a3b8' }"></span>
            
            <!-- Tooltip helper -->
            <span class="absolute right-10 bg-slate-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
              {{ model.label }}
            </span>
          </button>
        </div>

        <!-- Bottom tools -->
        <div class="flex flex-col items-center gap-3">
          <button 
            @click="reset3D"
            class="w-8 h-8 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center transition-all border border-slate-300 bg-white shadow-sm"
            title="Centrar Visualizador 3D"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </aside>

    </div>

    <!-- Technical Info / Acerca de Modal -->
    <div 
      v-if="showInfoModal"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showInfoModal = false"
    >
      <div class="bg-white border border-slate-400 rounded-lg shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="bg-[#0b5b8c] text-white px-4 py-3 flex items-center justify-between">
          <span class="font-bold text-sm">Información de AcoustiCAD</span>
          <button @click="showInfoModal = false" class="hover:text-slate-200 text-white cursor-pointer font-bold">
            &times;
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="p-5 flex flex-col gap-3 text-slate-700 leading-relaxed text-xs">
          <p class="font-bold text-slate-800 text-sm border-b border-slate-200 pb-1.5">
            AcoustiCAD - Simulador de Aislamiento Acústico
          </p>
          <p>
            Desarrollado para la materia <strong>Acústica y Psicoacústica II (TP1)</strong>. Calcula la pérdida de transmisión mecánica ($R$) para paramentos homogéneos simples en bandas de tercio de octava.
          </p>
          <div class="bg-slate-100 border border-slate-300 p-3 rounded font-mono text-[10px] flex flex-col gap-1">
            <span>• Ley de Masas: Campo Teórico y Corregido (Difuso)</span>
            <span>• Norma ISO 12354-1: Modelado de Coincidencia</span>
            <span>• Sharp: Modelo por Tramos de Ben Sharp (1978)</span>
            <span>• Davy: Pérdida por radiación de John Davy (2009)</span>
            <span>• Clasificación Rw: Calculada según ISO 717-1</span>
          </div>
          <p>
            Alimentado completamente en el cliente mediante <strong>Vue 3, Three.js, Chart.js y SheetJS</strong>.
          </p>
        </div>
        
        <!-- Modal Footer -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end">
          <button 
            @click="showInfoModal = false"
            class="bg-[#0b5b8c] hover:bg-[#07476e] text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { utils, read, writeFile } from 'xlsx';

// Presets JSON
import materialPresets from './assets/materiales.json';

// Acoustic Engine modules
import { calcularLeyMasasTeorica, calcularLeyMasasCorregida } from './acousticEngine/massLaw.js';
import { calcularISO12354, calcularFrecuenciaCritica } from './acousticEngine/iso12354.js';
import { calcularSharp } from './acousticEngine/sharp.js';
import { calcularDavy } from './acousticEngine/davy.js';
import { calcularRw } from './acousticEngine/weightedIndex.js';

// Components
import SidebarMaterials from './components/SidebarMaterials.vue';
import Canvas3D from './components/Canvas3D.vue';
import AcousticChart from './components/AcousticChart.vue';
import ResultsTable from './components/ResultsTable.vue';

// 1/3 Octave band frequencies
const FRECUENCIAS_TERCIO = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315,
  400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
  5000, 6300, 8000, 10000, 12500, 16000, 20000
];

const presets = ref([...materialPresets]);
const activeMaterial = ref({ ...presets.value[0] });

// UI conmutable tab states
const activeAnalysisTab = ref('chart');
const primaryModel = ref('davy');
const showInfoModal = ref(false);

const canvas3dRef = ref(null);
const importInput = ref(null);

// Models checkboxes
const activeModels = ref({
  massLawTheoretical: true,
  massLawCorrected: true,
  iso12354: true,
  sharp: true,
  davy: true
});

const modelOptions = [
  { key: 'massLawTheoretical', label: 'L. Masas Teórica', color: '#38bdf8' },
  { key: 'massLawCorrected', label: 'L. Masas Corregida', color: '#0284c7' },
  { key: 'iso12354', label: 'Norma ISO 12354', color: '#10b981' },
  { key: 'sharp', label: 'Modelo Sharp (1978)', color: '#ec4899' },
  { key: 'davy', label: 'Modelo Davy (2009)', color: '#eab308' }
];

const toggleModel = (key) => {
  const activeCount = Object.keys(activeModels.value).filter(k => activeModels.value[k]).length;
  if (activeCount === 1 && activeModels.value[key]) {
    alert("Debe haber al menos un modelo seleccionado.");
    return;
  }
  activeModels.value[key] = !activeModels.value[key];
};

const toggleAllModels = () => {
  const allOn = Object.values(activeModels.value).every(v => v);
  Object.keys(activeModels.value).forEach(k => {
    activeModels.value[k] = !allOn;
  });
  // Make sure at least one is on
  if (!allOn) {
    activeModels.value.davy = true;
  }
};

const triggerImport = () => {
  if (importInput.value) importInput.value.click();
};

const addNewPresets = (newPresets) => {
  newPresets.forEach(preset => {
    const idx = presets.value.findIndex(p => p.id === preset.id || p.nombre === preset.nombre);
    if (idx !== -1) {
      presets.value[idx] = preset;
    } else {
      presets.value.push(preset);
    }
  });
};

const fc = computed(() => {
  const nu = activeMaterial.value.poisson || 0;
  return calcularFrecuenciaCritica(
    activeMaterial.value.young,
    activeMaterial.value.densidad,
    activeMaterial.value.espesor,
    nu
  );
});

const predictions = computed(() => {
  const material = activeMaterial.value;
  return {
    massLawTheoretical: calcularLeyMasasTeorica(material, FRECUENCIAS_TERCIO),
    massLawCorrected: calcularLeyMasasCorregida(material, FRECUENCIAS_TERCIO),
    iso12354: calcularISO12354(material, FRECUENCIAS_TERCIO),
    sharp: calcularSharp(material, FRECUENCIAS_TERCIO),
    davy: calcularDavy(material, FRECUENCIAS_TERCIO)
  };
});

const rwVals = computed(() => {
  const preds = predictions.value;
  return {
    massLawTheoretical: calcularRw(FRECUENCIAS_TERCIO, preds.massLawTheoretical),
    massLawCorrected: calcularRw(FRECUENCIAS_TERCIO, preds.massLawCorrected),
    iso12354: calcularRw(FRECUENCIAS_TERCIO, preds.iso12354),
    sharp: calcularRw(FRECUENCIAS_TERCIO, preds.sharp),
    davy: calcularRw(FRECUENCIAS_TERCIO, preds.davy)
  };
});

// Primary Rw information card computed properties
const primaryRwInfo = computed(() => {
  const key = primaryModel.value;
  const val = rwVals.value[key] || 0;
  
  // Pink noise correction (C) and road traffic correction (Ctr) estimation
  const C = -1;
  const Ctr = -Math.round(2 + val * 0.05);
  
  const label = modelOptions.find(o => o.key === key)?.label || 'Modelo';
  return { val, C, Ctr, name: label };
});

const reset3D = () => {
  if (canvas3dRef.value) canvas3dRef.value.resetCamera();
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
          addNewPresets(materials);
          activeMaterial.value = materials[0];
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
          addNewPresets(importedPresets);
          activeMaterial.value = importedPresets[0];
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

const exportToExcel = () => {
  const material = activeMaterial.value;
  
  // Sheet 1: Material properties
  const materialData = [
    { "Propiedad": "Material", "Valor": material.nombre },
    { "Propiedad": "Descripción", "Valor": material.descripcion || '' },
    { "Propiedad": "Espesor (mm)", "Valor": Number((material.espesor * 1000).toFixed(1)) },
    { "Propiedad": "Densidad (kg/m³)", "Valor": material.densidad },
    { "Propiedad": "Módulo de Young (GPa)", "Valor": Number((material.young / 1e9).toFixed(3)) },
    { "Propiedad": "Factor de Amortiguamiento (eta)", "Valor": material.amortiguamiento },
    { "Propiedad": "Coeficiente de Poisson (nu)", "Valor": material.poisson },
    { "Propiedad": "Masa Superficial Calculada (kg/m²)", "Valor": Number((material.densidad * material.espesor).toFixed(2)) },
    { "Propiedad": "Frecuencia Crítica Calculada fc (Hz)", "Valor": Number(fc.value.toFixed(1)) }
  ];
  const wsProps = utils.json_to_sheet(materialData);
  
  // Sheet 2: Rw values comparison
  const rwData = [];
  if (activeModels.value.massLawTheoretical) rwData.push({ "Modelo Acústico": "Ley de Masas Teórica", "Rw (dB)": rwVals.value.massLawTheoretical });
  if (activeModels.value.massLawCorrected) rwData.push({ "Modelo Acústico": "Ley de Masas Corregida", "Rw (dB)": rwVals.value.massLawCorrected });
  if (activeModels.value.iso12354) rwData.push({ "Modelo Acústico": "Norma ISO 12354-1", "Rw (dB)": rwVals.value.iso12354 });
  if (activeModels.value.sharp) rwData.push({ "Modelo Acústico": "Modelo Sharp (1978)", "Rw (dB)": rwVals.value.sharp });
  if (activeModels.value.davy) rwData.push({ "Modelo Acústico": "Modelo Davy (2009)", "Rw (dB)": rwVals.value.davy });
  
  const wsRw = utils.json_to_sheet(rwData);
  
  // Sheet 3: Full Curve Values table
  const curveData = FRECUENCIAS_TERCIO.map((f, idx) => {
    const row = { "Frecuencia (Hz)": f };
    if (activeModels.value.massLawTheoretical) row["Ley de Masas Teórica (dB)"] = predictions.value.massLawTheoretical[idx];
    if (activeModels.value.massLawCorrected) row["Ley de Masas Corregida (dB)"] = predictions.value.massLawCorrected[idx];
    if (activeModels.value.iso12354) row["ISO 12354-1 (dB)"] = predictions.value.iso12354[idx];
    if (activeModels.value.sharp) row["Modelo Sharp (dB)"] = predictions.value.sharp[idx];
    if (activeModels.value.davy) row["Modelo Davy (dB)"] = predictions.value.davy[idx];
    return row;
  });
  const wsCurve = utils.json_to_sheet(curveData);

  wsProps['!cols'] = [{ wch: 35 }, { wch: 45 }];
  wsRw['!cols'] = [{ wch: 30 }, { wch: 10 }];
  
  const curveCols = [{ wch: 15 }];
  Object.keys(activeModels.value).forEach(k => {
    if (activeModels.value[k]) curveCols.push({ wch: 22 });
  });
  wsCurve['!cols'] = curveCols;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, wsProps, "Propiedades del Paramento");
  utils.book_append_sheet(wb, wsRw, "Índices Globales Rw");
  utils.book_append_sheet(wb, wsCurve, "Curvas de Aislamiento");
  
  const filename = `Reporte_Aislamiento_${material.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  writeFile(wb, filename);
};
</script>

<style>
/* CSS transition for range inputs */
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

/* Custom layout vertical writing support */
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
