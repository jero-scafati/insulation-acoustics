<template>
  <div class="relative w-full h-full border border-slate-300 bg-white rounded-lg overflow-hidden flex flex-col">
    <!-- Header Controls -->
    <div class="absolute top-2 left-2 z-10 bg-white/95 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 pointer-events-none shadow-sm">
      VISTA DE DISEÑO 3D
    </div>
    
    <div class="absolute bottom-2 right-2 z-10">
      <button 
        @click="resetCamera"
        class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 p-1.5 rounded transition-all active:scale-95 shadow-sm"
        title="Restablecer Vista"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
        </svg>
      </button>
    </div>

    <!-- Projected 3D Dimension Badge -->
    <div 
      v-if="labelPosition"
      :style="labelPosition"
      class="absolute z-10 bg-white border border-slate-400 px-2 py-0.5 rounded shadow-md text-[10px] font-mono font-bold text-slate-800 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center gap-1.5 whitespace-nowrap"
    >
      <span class="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
      {{ (espesor * 1000).toFixed(1) }} mm
    </div>

    <!-- Canvas Container -->
    <div ref="canvasContainer" class="w-full flex-grow relative cursor-grab active:cursor-grabbing bg-white"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const props = defineProps({
  espesor: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#64748b'
  }
});

const canvasContainer = ref(null);
const labelPosition = ref(null);
let scene, camera, renderer, controls;
let wallMesh, wireframeMesh;
let dimensionLine, tick1, tick2;
let animationFrameId;

const init3D = () => {
  if (!canvasContainer.value) return;

  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight || 300;

  // 1. Create Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff'); // Pure white scene for engineering look

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
  camera.position.set(2.2, 1.2, 2.2);

  // 3. Create Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.value.appendChild(renderer.domElement);

  // 4. Create Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.minDistance = 1.0;
  controls.maxDistance = 10.0;

  // 5. Lighting (Bright studio layout)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(6, 8, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.3);
  fillLight.position.set(-6, 3, -6);
  scene.add(fillLight);

  // 6. Wall Geometry & Material
  const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.0);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(props.color),
    roughness: 0.4,
    metalness: 0.1
  });

  wallMesh = new THREE.Mesh(geometry, material);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  // Subtle dark outlines
  const wireframeGeom = new THREE.EdgesGeometry(geometry);
  const wireframeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 1.5 });
  wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
  wallMesh.add(wireframeMesh);

  // Create dimension lines
  drawDimensionLines(props.espesor);

  // 7. Animation Loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateLabelPosition(); // Project label coordinate
  };
  
  animate();
};

const drawDimensionLines = (thickness) => {
  // Remove existing helper lines
  if (dimensionLine) scene.remove(dimensionLine);
  if (tick1) scene.remove(tick1);
  if (tick2) scene.remove(tick2);

  const visualScale = Math.min(1.8, Math.max(0.04, thickness * 4));
  const zHalf = visualScale / 2;

  // Clean grey dimension line material
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.5 });

  // Main Z-axis line at X = 0.8, Y = -0.75
  const points = [
    new THREE.Vector3(0.8, -0.75, -zHalf),
    new THREE.Vector3(0.8, -0.75, zHalf)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  dimensionLine = new THREE.Line(geometry, lineMaterial);
  scene.add(dimensionLine);

  // Tick Mark 1
  const t1Points = [
    new THREE.Vector3(0.7, -0.75, -zHalf),
    new THREE.Vector3(0.9, -0.75, -zHalf)
  ];
  const t1Geom = new THREE.BufferGeometry().setFromPoints(t1Points);
  tick1 = new THREE.Line(t1Geom, lineMaterial);
  scene.add(tick1);

  // Tick Mark 2
  const t2Points = [
    new THREE.Vector3(0.7, -0.75, zHalf),
    new THREE.Vector3(0.9, -0.75, zHalf)
  ];
  const t2Geom = new THREE.BufferGeometry().setFromPoints(t2Points);
  tick2 = new THREE.Line(t2Geom, lineMaterial);
  scene.add(tick2);
};

const updateWallThickness = (thickness) => {
  if (!wallMesh) return;
  const visualScale = Math.min(1.8, Math.max(0.04, thickness * 4));
  wallMesh.scale.z = visualScale;
  drawDimensionLines(thickness);
};

const updateWallColor = (hexColor) => {
  if (!wallMesh) return;
  wallMesh.material.color.set(hexColor);
};

const resetCamera = () => {
  if (camera && controls) {
    camera.position.set(2.2, 1.2, 2.2);
    controls.target.set(0, 0, 0);
    controls.update();
  }
};

const updateLabelPosition = () => {
  if (!camera || !renderer || !canvasContainer.value) return;
  
  // Coordinate of the label (near the Z dimension line center)
  const tempV = new THREE.Vector3(0.95, -0.75, 0);
  tempV.project(camera);
  
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  
  // Scale to screen pixel coordinates
  const x = (tempV.x * 0.5 + 0.5) * width;
  const y = (-tempV.y * 0.5 + 0.5) * height;
  
  labelPosition.value = {
    left: `${x}px`,
    top: `${y}px`
  };
};

const handleResize = () => {
  if (!canvasContainer.value || !renderer || !camera) return;
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight || 300;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// Watchers
watch(() => props.espesor, (newVal) => {
  updateWallThickness(newVal);
});

watch(() => props.color, (newVal) => {
  updateWallColor(newVal);
});

onMounted(() => {
  init3D();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cancelAnimationFrame(animationFrameId);
  if (renderer) renderer.dispose();
  if (wallMesh) {
    wallMesh.geometry.dispose();
    wallMesh.material.dispose();
  }
  if (dimensionLine) dimensionLine.geometry.dispose();
  if (tick1) tick1.geometry.dispose();
  if (tick2) tick2.geometry.dispose();
});
</script>

<style scoped>
/* Dimensions styling */
</style>
