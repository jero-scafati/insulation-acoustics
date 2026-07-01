import { calcularFrecuenciaCritica } from './iso12354.js';

/**
 * Calculates sound transmission loss using Sharp's model (1978) matching the TP requirements.
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
  
  const nu = material.poisson !== undefined ? material.poisson : 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const etaInt = material.amortiguamiento || 0.01;
  
  const rho0 = 1.18; // standard density of air
  const c0 = 343;    // speed of sound in air

  // Helper function to calculate R below 0.5 fc
  const calcR_below = (f) => {
    return 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) - 5.5;
  };

  // Helper function to calculate R above fc
  const calcR_above = (f) => {
    const etaTotal = etaInt + m / (485 * Math.sqrt(f));
    const ratio_f = f / fc;
    let sigma = 2.5;
    if (ratio_f > 1.0) {
      const diff = 1.0 - (1.0 / ratio_f);
      if (diff > 0) {
        sigma = 1.0 / Math.sqrt(diff);
      }
    }
    sigma = isNaN(sigma) ? 2.5 : Math.min(2.5, sigma); // Cap to prevent division by zero / infinity near fc
    
    const R1 = 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) +
               10 * Math.log10((2 * etaTotal * sigma) / Math.PI);
               
    const R2 = 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) - 5.5;
    
    return Math.min(R1, R2);
  };

  // Calculate critical values at the boundaries of the interpolation range
  const f_low = 0.5 * fc;
  const R_A = calcR_below(f_low);
  const R_B = calcR_above(fc);

  return frecuencias.map(f => {
    if (f < f_low) {
      // 1. Below 0.5 fc
      const R = calcR_below(f);
      return Math.max(0, parseFloat(R.toFixed(1)));
    } else if (f >= fc) {
      // 2. Above fc
      const R = calcR_above(f);
      return Math.max(0, parseFloat(R.toFixed(1)));
    } else {
      // 3. Between 0.5 fc and fc (linear interpolation)
      const ratio = (f - f_low) / (fc - f_low);
      const R = R_A + ratio * (R_B - R_A);
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
  });
}
