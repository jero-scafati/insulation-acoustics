<template>
  <div class="h-screen w-screen flex flex-col bg-[#edf1f5] text-slate-800 text-xs overflow-hidden font-sans select-none">
    
    <!-- 1. Top Menu Bar (Desktop text links, Mobile action icons) -->
    <header class="h-10 bg-white border-b border-slate-300 flex items-center justify-between px-3 shrink-0 z-30">
      <div class="flex items-center gap-3">
        <span class="font-black text-[#0b5b8c] tracking-tight text-xs sm:text-sm">AcoustiCAD v1.2</span>
        
        <!-- Desktop menu options -->
        <div class="hidden md:flex gap-3 text-slate-600">
          <button class="hover:text-black font-semibold cursor-pointer">Archivo</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="triggerImport">Importar...</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="exportToExcel">Exportar Reporte...</button>
          <button class="hover:text-black font-semibold cursor-pointer" @click="showInfoModal = true">Ayuda / Acerca de</button>
        </div>
      </div>

      <!-- Mobile menu action icons -->
      <div class="flex md:hidden items-center gap-4">
        <button 
          @click="triggerImport"
          class="p-1 text-slate-600 hover:text-[#0b5b8c] active:scale-95"
          title="Importar base de datos (Excel)"
        >
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        <button 
          @click="exportToExcel"
          class="p-1 text-[#0b5b8c] active:scale-95"
          title="Exportar Reporte (Excel)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button 
          @click="showInfoModal = true"
          class="p-1 text-slate-400 hover:text-slate-600 active:scale-95"
          title="Acerca de"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div class="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
        <span>Norma: ISO 12354-1 / ISO 717-1</span>
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

    <!-- Main Workspace (Vertical tabs on mobile, full grid on desktop) -->
    <div class="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0 bg-[#edf1f5]">
      
      <!-- 2. Left Shortcut Toolbar (Hidden on mobile) -->
      <aside class="hidden lg:flex w-14 bg-white border-r border-slate-300 flex-col items-center py-4 justify-between shrink-0">
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
      </aside>      <!-- 3. Central Analysis Dashboard (Fills screen on mobile for results/canvas) -->
      <main 
        class="w-full lg:w-0 lg:flex-1 h-full flex flex-col bg-[#edf1f5] overflow-hidden min-h-0"
        :class="mobileTab !== 'config' ? 'flex' : 'hidden lg:flex'"
      >
        <!-- Header de Resultados (Compact, responsive columns) -->
        <div class="h-auto min-h-[64px] border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-2 sm:py-0 bg-[#f8fafc] shrink-0 gap-2">
          <!-- Left side: Material mechanical summaries -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4">
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Paramento</div>
              <div class="text-xs sm:text-sm font-black text-[#0b5b8c] mt-0.5">{{ activeMaterial.nombre }}</div>
            </div>
            <div class="h-6 w-[1px] bg-slate-200"></div>
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Masa Sup.</div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-700 mt-0.5">
                {{ (activeMaterial.densidad * activeMaterial.espesor).toFixed(2) }} <span class="text-[9px] font-medium text-slate-500">kg/m²</span>
              </div>
            </div>
            <div class="h-6 w-[1px] bg-slate-200"></div>
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Rigidez (B)</div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-700 font-mono mt-0.5">
                {{ stiffnessB.toExponential(2) }} <span class="text-[8px] font-medium text-slate-500">N·m</span>
              </div>
            </div>
            <div class="h-6 w-[1px] bg-slate-200"></div>
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Modo (f11)</div>
              <div class="text-[10px] sm:text-xs font-bold text-slate-700 font-mono mt-0.5">{{ f11Val.toFixed(1) }} Hz</div>
            </div>
            <div class="h-6 w-[1px] bg-slate-200"></div>
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Frec. Crítica (fc)</div>
              <div class="text-[10px] sm:text-xs font-bold text-yellow-600 font-mono mt-0.5">{{ fc.toFixed(1) }} Hz</div>
            </div>
            <div class="h-6 w-[1px] bg-slate-200"></div>
            <div>
              <div class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Frec. Densidad (fd)</div>
              <div class="text-[10px] sm:text-xs font-bold text-yellow-600 font-mono mt-0.5">{{ fdVal.toFixed(1) }} Hz</div>
            </div>
          </div>

          <!-- Right side: Huge Rw Single-Number Rating Display -->
          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200 pt-1.5 sm:pt-0 shrink-0">
            <div class="flex flex-col text-left sm:text-right leading-none">
              <span class="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rw Ponderado</span>
              <select 
                v-model="primaryModel"
                class="bg-transparent text-[9px] sm:text-[10px] font-black text-[#0b5b8c] border-b border-transparent hover:border-[#0b5b8c] focus:outline-none cursor-pointer p-0 text-left sm:text-right uppercase mt-0.5"
              >
                <option v-for="opt in modelOptions" :key="opt.key" :value="opt.key">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            
            <div class="flex items-center gap-2.5 bg-[#edf1f5] px-3 py-0.5 rounded border border-slate-300 shadow-sm shrink-0">
              <div class="flex flex-col items-center">
                <span class="text-2xl sm:text-3xl font-black text-[#0b5b8c] font-mono leading-none">
                  {{ primaryRwInfo.val }}
                </span>
                <span class="text-[8px] text-[#0b5b8c]/80 font-bold uppercase mt-0.5 leading-none">dB</span>
              </div>
              <div class="flex flex-col justify-center text-[9px] font-mono text-slate-500 leading-tight border-l border-slate-300 pl-2">
                <span>C: {{ primaryRwInfo.C }} dB</span>
                <span>Ctr: {{ primaryRwInfo.Ctr }} dB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Bar for Central Viewport -->
        <div class="flex border-b border-slate-300 bg-slate-200/50 shrink-0">
          <button 
            @click="activeCentralTab = 'chart'"
            class="px-5 py-2 border-r border-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer select-none"
            :class="activeCentralTab === 'chart' 
              ? 'bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]' 
              : 'text-slate-500 hover:text-slate-800 bg-slate-200/30'"
          >
            Gráfico Acústico
          </button>
          <button 
            @click="activeCentralTab = 'table'"
            class="px-5 py-2 border-r border-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer select-none"
            :class="activeCentralTab === 'table' 
              ? 'bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]' 
              : 'text-slate-500 hover:text-slate-800 bg-slate-200/30'"
          >
            Tabla de Valores
          </button>
          <button 
            @click="activeCentralTab = 'canvas3d'"
            class="px-5 py-2 border-r border-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer select-none"
            :class="activeCentralTab === 'canvas3d' 
              ? 'bg-white text-[#0b5b8c] border-b border-b-transparent -mb-[1px]' 
              : 'text-slate-500 hover:text-slate-800 bg-slate-200/30'"
          >
            Vista 3D Interactiva
          </button>
        </div>

        <!-- Central Viewport Display -->
        <div class="flex-grow min-h-0 relative p-3 bg-[#edf1f5]">
          <!-- Acoustic Chart Tab -->
          <div 
            v-show="activeCentralTab === 'chart'"
            class="w-full h-full flex flex-col gap-2"
          >
            <!-- Model Toggles inside the chart container -->
            <div class="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg shrink-0">
              <button 
                v-for="model in modelOptions" 
                :key="model.key"
                @click="toggleModel(model.key)"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold transition-all active:scale-95 cursor-pointer"
                :class="activeModels[model.key] 
                  ? 'bg-white border-slate-400 text-slate-800' 
                  : 'bg-slate-100 text-slate-400 border-slate-200'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: activeModels[model.key] ? model.color : '#cbd5e1' }"></span>
                {{ model.label }}
              </button>
            </div>

            <AcousticChart 
              class="w-full h-full"
              :frecuencias="FRECUENCIAS_TERCIO"
              :predictions="predictions"
              :activeModels="activeModels"
            />
          </div>

          <!-- Results Table Tab -->
          <div 
            v-show="activeCentralTab === 'table'"
            class="w-full h-full"
          >
            <ResultsTable 
              class="w-full h-full"
              :frecuencias="FRECUENCIAS_TERCIO"
              :predictions="predictions"
              :fc="fc"
              :activeModels="activeModels"
            />
          </div>

          <!-- 3D Canvas Tab -->
          <div 
            v-show="activeCentralTab === 'canvas3d'"
            class="w-full h-full relative"
          >
            <Canvas3D 
              ref="canvas3dRef"
              :espesor="activeMaterial.espesor"
              :lx="activeMaterial.lx !== undefined ? activeMaterial.lx : 1.5"
              :ly="activeMaterial.ly !== undefined ? activeMaterial.ly : 1.2"
              :color="activeMaterial.color"
              :materialNombre="activeMaterial.nombre"
              :rwValue="primaryRwInfo.val"
              :visible="activeCentralTab === 'canvas3d'"
              class="w-full h-full animate-fade-in"
            />
          </div>
        </div>
      </main>

      <!-- 4. Right Sidebar Area (Only visible on mobile if 'config' tab active) -->
      <aside 
        class="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-300 flex flex-col bg-[#f8fafc] shrink-0 min-h-0 overflow-hidden h-full"
        :class="mobileTab === 'config' ? 'flex' : 'hidden lg:flex'"
      >
        <!-- Config Panel: preset list & mechanical parameters -->
        <div class="flex-grow flex flex-col min-h-0 overflow-y-auto">
          <SidebarMaterials 
            v-model="activeMaterial"
            :presets="presets"
            @addPresets="addNewPresets"
            @savePreset="onSavePreset"
          />
        </div>
      </aside>
    </div>

    <!-- 6. Mobile Bottom Navigation Bar (Fitted to bottom, hidden on desktop) -->
    <nav class="h-12 bg-white border-t border-slate-300 flex items-center justify-around shrink-0 lg:hidden z-30">
      <!-- Button 1: Gráfico -->
      <button 
        @click="mobileTab = 'canvas'; activeCentralTab = 'chart'"
        class="flex flex-col items-center gap-0.5 py-1 px-3 text-[9px] font-bold uppercase tracking-wider transition-all"
        :class="(mobileTab === 'canvas' && activeCentralTab === 'chart') ? 'text-[#0b5b8c]' : 'text-slate-400 hover:text-slate-600'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Gráfico</span>
      </button>

      <!-- Button 2: Tabla -->
      <button 
        @click="mobileTab = 'canvas'; activeCentralTab = 'table'"
        class="flex flex-col items-center gap-0.5 py-1 px-3 text-[9px] font-bold uppercase tracking-wider transition-all"
        :class="(mobileTab === 'canvas' && activeCentralTab === 'table') ? 'text-[#0b5b8c]' : 'text-slate-400 hover:text-slate-600'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-3-8v8m6-8v8M3 6h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
        <span>Tabla</span>
      </button>

      <!-- Button 3: Vista 3D -->
      <button 
        @click="mobileTab = 'canvas'; activeCentralTab = 'canvas3d'"
        class="flex flex-col items-center gap-0.5 py-1 px-3 text-[9px] font-bold uppercase tracking-wider transition-all"
        :class="(mobileTab === 'canvas' && activeCentralTab === 'canvas3d') ? 'text-[#0b5b8c]' : 'text-slate-400 hover:text-slate-600'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>3D</span>
      </button>

      <!-- Button 4: Ajustes -->
      <button 
        @click="mobileTab = 'config'"
        class="flex flex-col items-center gap-0.5 py-1 px-3 text-[9px] font-bold uppercase tracking-wider transition-all"
        :class="mobileTab === 'config' ? 'text-[#0b5b8c]' : 'text-slate-400 hover:text-slate-600'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Ajustes</span>
      </button>
    </nav>

    <!-- Technical Info / Acerca de Modal -->
    <div 
      v-if="showInfoModal"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showInfoModal = false"
    >
      <div class="bg-white border border-slate-400 rounded shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="bg-[#0b5b8c] text-white px-4 py-3 flex items-center justify-between">
          <span class="font-bold text-sm">Información de AcoustiCAD</span>
          <button @click="showInfoModal = false" class="hover:text-slate-200 text-white cursor-pointer font-bold text-lg leading-none">
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
import { calcularISO12354, calcularFrecuenciaCritica, calcularRigidezFlexion, calcularF11, calcularFd } from './acousticEngine/iso12354.js';
import { calcularCremer } from './acousticEngine/cremer.js';
import { calcularSharp } from './acousticEngine/sharp.js';
import { calcularDavy } from './acousticEngine/davy.js';
import { calcularParedSimpleZonal } from './acousticEngine/simpleWallZonal.js';
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
const activeMaterial = ref({ 
  ...presets.value.find(p => p.id === 'vidrio') || presets.value[12],
  lx: 1.5,
  ly: 1.2
});

// UI conmutable tab states
const activeAnalysisTab = ref('chart');
const activeCentralTab = ref('chart'); // 'chart', 'table', 'canvas3d'
const primaryModel = ref('davy');
const showInfoModal = ref(false);
const mobileTab = ref('canvas'); // 'canvas', 'config', 'results' for 100% mobile optimization

const canvas3dRef = ref(null);
const importInput = ref(null);

// Models checkboxes
const activeModels = ref({
  massLawTheoretical: true,
  massLawCorrected: true,
  iso12354: true,
  cremer: true,
  sharp: true,
  davy: true,
  simpleWallZonal: true
});

const modelOptions = [
  { key: 'massLawTheoretical', label: 'L. Masas Teórica', color: '#38bdf8' },
  { key: 'massLawCorrected', label: 'L. Masas Corregida', color: '#0284c7' },
  { key: 'iso12354', label: 'Norma ISO 12354', color: '#10b981' },
  { key: 'cremer', label: 'Modelo Cremer (Teor.)', color: '#a855f7' },
  { key: 'sharp', label: 'Modelo Sharp (1978)', color: '#ec4899' },
  { key: 'davy', label: 'Modelo Davy (2009)', color: '#eab308' },
  { key: 'simpleWallZonal', label: 'Pared Simple (Zonas)', color: '#f97316' }
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

const onSavePreset = (newPreset) => {
  const idx = presets.value.findIndex(p => p.id === newPreset.id || p.nombre.toLowerCase() === newPreset.nombre.toLowerCase());
  if (idx !== -1) {
    presets.value[idx] = newPreset;
  } else {
    presets.value.push(newPreset);
  }
  activeMaterial.value = newPreset;
};

const fc = computed(() => {
  const nu = activeMaterial.value.poisson !== undefined ? activeMaterial.value.poisson : 0.3;
  return calcularFrecuenciaCritica(
    activeMaterial.value.young,
    activeMaterial.value.densidad,
    activeMaterial.value.espesor,
    nu
  );
});

const stiffnessB = computed(() => {
  const nu = activeMaterial.value.poisson !== undefined ? activeMaterial.value.poisson : 0.3;
  return calcularRigidezFlexion(activeMaterial.value.young, activeMaterial.value.espesor, nu);
});

const f11Val = computed(() => {
  const m = activeMaterial.value.densidad * activeMaterial.value.espesor;
  const lx = activeMaterial.value.lx !== undefined ? activeMaterial.value.lx : 1.5;
  const ly = activeMaterial.value.ly !== undefined ? activeMaterial.value.ly : 1.2;
  return calcularF11(stiffnessB.value, m, lx, ly);
});

const fdVal = computed(() => {
  const nu = activeMaterial.value.poisson !== undefined ? activeMaterial.value.poisson : 0.3;
  return calcularFd(activeMaterial.value.young, activeMaterial.value.densidad, activeMaterial.value.espesor, nu);
});

const predictions = computed(() => {
  const material = activeMaterial.value;
  const lx = material.lx !== undefined ? material.lx : 1.5;
  const ly = material.ly !== undefined ? material.ly : 1.2;
  return {
    massLawTheoretical: calcularLeyMasasTeorica(material, FRECUENCIAS_TERCIO),
    massLawCorrected: calcularLeyMasasCorregida(material, FRECUENCIAS_TERCIO),
    iso12354: calcularISO12354(material, FRECUENCIAS_TERCIO),
    cremer: calcularCremer(material, FRECUENCIAS_TERCIO),
    sharp: calcularSharp(material, FRECUENCIAS_TERCIO),
    davy: calcularDavy(material, FRECUENCIAS_TERCIO, lx, ly),
    simpleWallZonal: calcularParedSimpleZonal(material, FRECUENCIAS_TERCIO, lx, ly)
  };
});

const rwVals = computed(() => {
  const preds = predictions.value;
  return {
    massLawTheoretical: calcularRw(FRECUENCIAS_TERCIO, preds.massLawTheoretical),
    massLawCorrected: calcularRw(FRECUENCIAS_TERCIO, preds.massLawCorrected),
    iso12354: calcularRw(FRECUENCIAS_TERCIO, preds.iso12354),
    cremer: calcularRw(FRECUENCIAS_TERCIO, preds.cremer),
    sharp: calcularRw(FRECUENCIAS_TERCIO, preds.sharp),
    davy: calcularRw(FRECUENCIAS_TERCIO, preds.davy),
    simpleWallZonal: calcularRw(FRECUENCIAS_TERCIO, preds.simpleWallZonal)
  };
});

const primaryRwInfo = computed(() => {
  const key = primaryModel.value;
  const val = rwVals.value[key] || 0;
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
  const materialData = [
    { "Propiedad": "Material", "Valor": material.nombre },
    { "Propiedad": "Descripción", "Valor": material.descripcion || '' },
    { "Propiedad": "Espesor (mm)", "Valor": Number((material.espesor * 1000).toFixed(1)) },
    { "Propiedad": "Densidad (kg/m³)", "Valor": material.densidad },
    { "Propiedad": "Módulo de Young (GPa)", "Valor": Number((material.young / 1e9).toFixed(3)) },
    { "Propiedad": "Factor de Amortiguamiento (eta)", "Valor": material.amortiguamiento },
    { "Propiedad": "Coeficiente de Poisson (nu)", "Valor": material.poisson },
    { "Propiedad": "Masa Superficial Calculada (kg/m²)", "Valor": Number((material.densidad * material.espesor).toFixed(2)) },
    { "Propiedad": "Rigidez a la Flexión B (N·m)", "Valor": stiffnessB.value.toExponential(3) },
    { "Propiedad": "Frecuencia Modo Fundamental f11 (Hz)", "Valor": Number(f11Val.value.toFixed(1)) },
    { "Propiedad": "Frecuencia Crítica Calculada fc (Hz)", "Valor": Number(fc.value.toFixed(1)) },
    { "Propiedad": "Frecuencia de Densidad fd (Hz)", "Valor": Number(fdVal.value.toFixed(1)) }
  ];
  const wsProps = utils.json_to_sheet(materialData);
  
  const rwData = [];
  modelOptions.forEach(opt => {
    if (activeModels.value[opt.key]) {
      rwData.push({
        "Modelo Acústico": opt.label,
        "Rw (dB)": rwVals.value[opt.key]
      });
    }
  });
  const wsRw = utils.json_to_sheet(rwData);
  
  const curveData = FRECUENCIAS_TERCIO.map((f, idx) => {
    const row = { "Frecuencia (Hz)": f };
    modelOptions.forEach(opt => {
      if (activeModels.value[opt.key]) {
        row[`${opt.label} (dB)`] = predictions.value[opt.key][idx];
      }
    });
    return row;
  });
  const wsCurve = utils.json_to_sheet(curveData);

  wsProps['!cols'] = [{ wch: 35 }, { wch: 45 }];
  wsRw['!cols'] = [{ wch: 30 }, { wch: 10 }];
  
  const curveCols = [{ wch: 15 }];
  modelOptions.forEach(opt => {
    if (activeModels.value[opt.key]) curveCols.push({ wch: 24 });
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
