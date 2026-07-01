<template>
  <div class="relative w-full h-full border border-slate-300 bg-white rounded-lg overflow-hidden flex flex-col">
    <!-- Header Controls -->
    <div class="absolute top-2 left-2 z-10 bg-white/95 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 pointer-events-none shadow-sm flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
      SIMULACIÓN DE PROPAGACIÓN ONDAS
    </div>
    
    <div class="absolute bottom-2 right-2 z-10">
      <button 
        @click="resetCamera"
        class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 p-1.5 rounded transition-all active:scale-95 shadow-sm cursor-pointer"
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
    
    <!-- Legend for Waves -->
    <div class="absolute bottom-2 left-2 z-10 bg-white/90 border border-slate-200 p-1.5 rounded text-[8px] font-bold text-slate-500 pointer-events-none shadow-sm flex flex-col gap-1 leading-none">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-0.5 bg-[#0284c7]"></span>
        <span>Onda Incidente (Sonido)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-0.5 bg-[#ec4899]"></span>
        <span>Onda Transmitida (Pérdida)</span>
      </div>
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
  },
  materialNombre: {
    type: String,
    default: 'Personalizado'
  },
  rwValue: {
    type: Number,
    default: 30
  },
  visible: {
    type: Boolean,
    default: true
  }
});

const canvasContainer = ref(null);
const labelPosition = ref(null);
let scene, camera, renderer, controls;
let wallMesh, wireframeMesh;
let dimensionLine, tick1, tick2;
let animationFrameId;

// Wave lists
const incidentRings = [];
const transmittedRings = [];

// Procedural materials definition based on physical properties
const getMaterialProps = (name, baseColor) => {
  const normName = name.toLowerCase();
  
  if (normName.includes('vidrio') || normName.includes('glass') || normName.includes('acrílico') || normName.includes('crit')) {
    return {
      color: new THREE.Color('#cbd5e1'),
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      transmission: 0.8,
      thickness: 0.5
    };
  }
  
  if (
    normName.includes('acero') || 
    normName.includes('aluminio') || 
    normName.includes('plomo') || 
    normName.includes('metal') || 
    normName.includes('steel') || 
    normName.includes('aluminum') ||
    normName.includes('chapa')
  ) {
    return {
      color: new THREE.Color(baseColor),
      roughness: 0.25,
      metalness: 0.85,
      transparent: false,
      opacity: 1.0,
      transmission: 0
    };
  }
  
  if (
    normName.includes('madera') || 
    normName.includes('plywood') || 
    normName.includes('mdf') || 
    normName.includes('fenólico') ||
    normName.includes('aglomerado')
  ) {
    return {
      color: new THREE.Color(baseColor),
      roughness: 0.85,
      metalness: 0.05,
      transparent: false,
      opacity: 1.0,
      transmission: 0
    };
  }
  
  // Default concrete/bricks/rubbers (matte roughness)
  return {
    color: new THREE.Color(baseColor),
    roughness: 0.9,
    metalness: 0.05,
    transparent: false,
    opacity: 1.0,
    transmission: 0
  };
};

const init3D = () => {
  if (!canvasContainer.value) return;

  const width = canvasContainer.value.clientWidth || 400;
  const height = canvasContainer.value.clientHeight || 240;

  // 1. Create Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
  camera.position.set(2.4, 1.4, 2.4);

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

  // 5. Lighting (Bright studio engineering lighting)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.35);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // 6. Wall Geometry & Material
  const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.0);
  
  const matProps = getMaterialProps(props.materialNombre, props.color);
  const material = new THREE.MeshPhysicalMaterial({
    color: matProps.color,
    roughness: matProps.roughness,
    metalness: matProps.metalness,
    transparent: matProps.transparent,
    opacity: matProps.opacity,
    transmission: matProps.transmission || 0,
    thickness: matProps.thickness || 0,
    clearcoat: matProps.transmission ? 1.0 : 0.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });

  wallMesh = new THREE.Mesh(geometry, material);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  // Subtle outlines
  const wireframeGeom = new THREE.EdgesGeometry(geometry);
  const wireframeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 1.5 });
  wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
  wallMesh.add(wireframeMesh);

  // Create dimension lines
  drawDimensionLines(props.espesor);

  // 7. Setup Wave Geometry
  // We make rings in XY plane centered on Z
  const ringGeom = new THREE.RingGeometry(0.3, 0.315, 64);

  // Incident waves (left, blue)
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // incident blue
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeom, mat);
    scene.add(ring);
    incidentRings.push({
      mesh: ring,
      phase: i / 3
    });
  }

  // Transmitted waves (right, pink)
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xec4899, // transmitted pink
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeom, mat);
    scene.add(ring);
    transmittedRings.push({
      mesh: ring,
      phase: i / 3
    });
  }

  // 8. Animation Loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();

    // Wave animation timing
    const time = Date.now() * 0.0018;
    const visualScale = Math.min(1.8, Math.max(0.04, props.espesor * 4));
    const zHalf = visualScale / 2;

    // 1. Update Incident rings (traveling from Z = -2.2 to Z = -zHalf)
    incidentRings.forEach((ring) => {
      let progress = (time * 0.4 + ring.phase) % 1.0;
      
      const zStart = -2.2;
      const zEnd = -zHalf;
      ring.mesh.position.z = zStart + (zEnd - zStart) * progress;

      // Scale expands slightly as it propagates
      const scaleVal = 0.4 + progress * 0.9;
      ring.mesh.scale.set(scaleVal, scaleVal, 1);

      // Opacity peaks in the middle and fades out near the wall
      ring.mesh.material.opacity = Math.sin(progress * Math.PI) * 0.45;
    });

    // 2. Update Transmitted rings (emerging from Z = zHalf to Z = 2.2)
    // Transmitted wave strength is modulated by Rw value
    // High Rw (> 50 dB) -> waves barely visible
    // Low Rw (< 20 dB) -> waves highly visible
    const attenuation = Math.max(0, Math.min(1.0, (60 - props.rwValue) / 45));

    transmittedRings.forEach((ring) => {
      let progress = (time * 0.4 + ring.phase) % 1.0;

      const zStart = zHalf;
      const zEnd = 2.2;
      ring.mesh.position.z = zStart + (zEnd - zStart) * progress;

      // Scale expands
      const scaleVal = 0.4 + progress * 0.9;
      ring.mesh.scale.set(scaleVal, scaleVal, 1);

      // Opacity modulated by attenuation
      ring.mesh.material.opacity = Math.sin(progress * Math.PI) * 0.45 * attenuation;
    });

    renderer.render(scene, camera);
    updateLabelPosition();
  };
  
  animate();
};

const drawDimensionLines = (thickness) => {
  if (dimensionLine) scene.remove(dimensionLine);
  if (tick1) scene.remove(tick1);
  if (tick2) scene.remove(tick2);

  const visualScale = Math.min(1.8, Math.max(0.04, thickness * 4));
  const zHalf = visualScale / 2;

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.5 });

  // Main dimension line offset
  const points = [
    new THREE.Vector3(0.8, -0.75, -zHalf),
    new THREE.Vector3(0.8, -0.75, zHalf)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  dimensionLine = new THREE.Line(geometry, lineMaterial);
  scene.add(dimensionLine);

  // Tick 1
  const t1Points = [
    new THREE.Vector3(0.7, -0.75, -zHalf),
    new THREE.Vector3(0.9, -0.75, -zHalf)
  ];
  const t1Geom = new THREE.BufferGeometry().setFromPoints(t1Points);
  tick1 = new THREE.Line(t1Geom, lineMaterial);
  scene.add(tick1);

  // Tick 2
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

const updateWallMaterialType = () => {
  if (!wallMesh) return;
  const matProps = getMaterialProps(props.materialNombre, props.color);
  
  wallMesh.material.color.copy(matProps.color);
  wallMesh.material.roughness = matProps.roughness;
  wallMesh.material.metalness = matProps.metalness;
  wallMesh.material.transparent = matProps.transparent;
  wallMesh.material.opacity = matProps.opacity;
  wallMesh.material.transmission = matProps.transmission || 0;
  wallMesh.material.thickness = matProps.thickness || 0;
  wallMesh.material.clearcoat = matProps.transmission ? 1.0 : 0.0;
  wallMesh.material.needsUpdate = true;
};

const resetCamera = () => {
  if (camera && controls) {
    camera.position.set(2.4, 1.4, 2.4);
    controls.target.set(0, 0, 0);
    controls.update();
  }
};

const updateLabelPosition = () => {
  if (!camera || !renderer || !canvasContainer.value) return;
  
  const tempV = new THREE.Vector3(0.95, -0.75, 0);
  tempV.project(camera);
  
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  
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
  const height = canvasContainer.value.clientHeight || 240;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// Watchers
watch(() => props.espesor, (newVal) => {
  updateWallThickness(newVal);
});

watch(() => [props.color, props.materialNombre], () => {
  updateWallMaterialType();
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      handleResize();
    }, 60);
  }
});

onMounted(() => {
  init3D();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cancelAnimationFrame(animationFrameId);
  
  // Dispose of all custom geometry and materials
  if (renderer) renderer.dispose();
  if (wallMesh) {
    wallMesh.geometry.dispose();
    wallMesh.material.dispose();
  }
  if (dimensionLine) dimensionLine.geometry.dispose();
  if (tick1) tick1.geometry.dispose();
  if (tick2) tick2.geometry.dispose();

  incidentRings.forEach(ring => {
    ring.mesh.geometry.dispose();
    ring.mesh.material.dispose();
  });
  
  transmittedRings.forEach(ring => {
    ring.mesh.geometry.dispose();
    ring.mesh.material.dispose();
  });
});

defineExpose({ resetCamera });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
