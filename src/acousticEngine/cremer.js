import { calcularFrecuenciaCritica, calcularFd } from './iso12354.js';

/**
 * Calculates sound transmission loss using the classic Cremer theoretical model.
 * 
 * @param {Object} material - Material parameters
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number} material.young - Young's modulus (Pa)
 * @param {number} material.amortiguamiento - Internal loss factor (eta)
 * @param {number} [material.poisson=0.3] - Poisson's ratio
 * @param {number[]} frecuencias - 1/3 octave band frequencies
 * @returns {number[]} Array of transmission loss R values in dB
 */
export function calcularCremer(material, frecuencias) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);
  
  const nu = material.poisson !== undefined ? material.poisson : 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const fd = calcularFd(material.young, material.densidad, material.espesor, nu);
  const etaInt = material.amortiguamiento || 0.01;
  
  const rho0 = 1.18; // Standard density of air required by the prompt
  const c0 = 343;    // Speed of sound in air required by the prompt

  return frecuencias.map(f => {
    // eta_TOTAL = eta_interno + m / (485 * sqrt(f))
    const etaTotal = etaInt + m / (485 * Math.sqrt(f));
    
    if (f < fc) {
      // 1. Below critical frequency (mass law region)
      // R = 10 * log10( 1 + (pi * m * f / (rho0 * c0))^2 ) - 5.5
      const R = 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) - 5.5;
      return Math.max(0, parseFloat(R.toFixed(1)));
    } else if (f < fd) {
      // 2. Coincidence region (fc <= f < fd)
      // R = R_ley_masas + 10 * log10( (2 * etaTotal * sigma) / pi )
      const ratio_f = f / fc;
      let sigma = 2.5;
      if (ratio_f > 1.0) {
        const diff = 1.0 - (1.0 / ratio_f);
        if (diff > 0) {
          sigma = 1.0 / Math.sqrt(diff);
        }
      }
      sigma = isNaN(sigma) ? 2.5 : Math.min(2.5, sigma); // Cap radiation efficiency to prevent singularity at fc
      
      const R = 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) +
                10 * Math.log10((2 * etaTotal * sigma) / Math.PI);
      return Math.max(0, parseFloat(R.toFixed(1)));
    } else {
      // 3. Above dilatational frequency (f >= fd, shear wave dominated)
      // We evaluate the coincidence formula at fd to maintain continuity, and apply a 20*log10(f/fd) slope.
      const ratio_fd = fd / fc;
      let sigma_d = 2.5;
      if (ratio_fd > 1.0) {
        const diff_d = 1.0 - (1.0 / ratio_fd);
        if (diff_d > 0) {
          sigma_d = 1.0 / Math.sqrt(diff_d);
        }
      }
      sigma_d = isNaN(sigma_d) ? 2.5 : Math.min(2.5, sigma_d);
      
      const etaTotal_d = etaInt + m / (485 * Math.sqrt(fd));
      
      const R_fd = 10 * Math.log10(1 + Math.pow((Math.PI * m * fd) / (rho0 * c0), 2)) +
                   10 * Math.log10((2 * etaTotal_d * sigma_d) / Math.PI);
      
      const R = R_fd + 20 * Math.log10(f / fd);
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
  });
}
