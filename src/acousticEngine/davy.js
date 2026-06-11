import { calcularFrecuenciaCritica } from './iso12354.js';

/**
 * Acoustic engine: Davy's Model (2009)
 * Davy's model accounts for the finite size of the panel and includes
 * radiation efficiency calculations to yield a more detailed sound transmission loss curve.
 * 
 * @param {Object} material
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number} material.young - Young's Modulus (Pa)
 * @param {number} material.amortiguamiento - Damping loss factor (eta)
 * @param {number} [material.poisson=0.3] - Poisson's ratio
 * @param {number[]} frecuencias
 * @param {number} [ancho=1.0] - Width of the wall (m)
 * @param {number} [alto=1.5] - Height of the wall (m)
 * @returns {number[]} Array of R values in dB
 */
export function calcularDavy(material, frecuencias, ancho = 1.0, alto = 1.5) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);
  
  const nu = material.poisson || 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const eta = material.amortiguamiento || 0.01;
  const S = ancho * alto; // Area of the panel
  
  return frecuencias.map(f => {
    // Air density & sound speed
    const rho0 = 1.21;
    const c0 = 343;
    const k0 = (2 * Math.PI * f) / c0; // wave number in air
    
    // Davy's model utilizes radiation efficiency (sigma)
    // Below fc: forced radiation efficiency
    // Above fc: resonant radiation efficiency
    let sigma;
    
    if (f < fc) {
      // forced radiation efficiency (approximate for finite size panel)
      // depends on k0 and dimensions (S = Area)
      const w = 2 * Math.PI * f;
      const U = 2 * (ancho + alto); // perimeter
      const g = 0.5 * (Math.log(k0 * Math.sqrt(S)) + 0.16);
      sigma = Math.min(1.0, Math.max(0.01, g / (k0 * Math.sqrt(S))));
      
      // Calculate forced transmission loss
      const R_forced = 20 * Math.log10(m * f) - 47.5 - 10 * Math.log10(sigma);
      
      // If we are close to fc, there is a transitional reduction due to coincidence onset
      if (f > fc / 2) {
        const R_fc = 20 * Math.log10(m * fc) - 47.5 + 10 * Math.log10(eta) - 5;
        const ratio = (f - fc / 2) / (fc - fc / 2);
        return Math.max(0, parseFloat((R_forced + ratio * (R_fc - R_forced)).toFixed(1)));
      }
      
      return Math.max(0, parseFloat(R_forced.toFixed(1)));
    } else {
      // Above fc: resonant radiation efficiency
      // Cremer's formula with limit
      const ratio_f = f / fc;
      sigma = 1.0 / Math.sqrt(1 - (1 / ratio_f));
      // Cap sigma to prevent infinity
      sigma = Math.min(2.5, sigma);
      
      // Davy's resonant sound reduction index above fc
      const R = 20 * Math.log10(m * f) - 47.5 + 10 * Math.log10(eta) + 10 * Math.log10(f / fc) - 10 * Math.log10(sigma) - 2;
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
  });
}
