import { calcularFrecuenciaCritica } from './iso12354.js';

/**
 * Acoustic engine: Sharp's Model (1978)
 * Sharp's model uses a piecewise approach to calculate transmission loss,
 * accounting for mass-controlled region, coincidence, and damping-controlled region.
 * 
 * @param {Object} material
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number} material.young - Young's Modulus (Pa)
 * @param {number} material.amortiguamiento - Damping loss factor (eta)
 * @param {number} [material.poisson=0.3] - Poisson's ratio
 * @param {number[]} frecuencias
 * @returns {number[]} Array of R values in dB
 */
export function calcularSharp(material, frecuencias) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);
  
  const nu = material.poisson || 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const eta = material.amortiguamiento || 0.01;
  
  return frecuencias.map(f => {
    // 1. Below critical frequency (mass-controlled)
    if (f < fc / 2) {
      const R = 20 * Math.log10(m * f) - 48;
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
    
    // 2. Value at critical frequency (coincidence dip)
    // Sharp's model dip is controlled heavily by the damping factor (loss factor)
    const R_fc = 20 * Math.log10(m * fc) - 48 + 10 * Math.log10(eta) - 4;
    
    // 3. Above critical frequency (damping and radiation-controlled)
    if (f > fc) {
      // Sound reduction index recovers above fc, increasing at 9dB per octave (10 log10(f/fc))
      const R = 20 * Math.log10(m * f) - 48 + 10 * Math.log10(eta) + 10 * Math.log10(f / fc) + 2;
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
    
    // 4. In transition region (fc/2 to fc)
    const R_fc2 = 20 * Math.log10(m * (fc / 2)) - 48;
    const ratio = (f - fc / 2) / (fc - fc / 2);
    const R = R_fc2 + ratio * (R_fc - R_fc2);
    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}
