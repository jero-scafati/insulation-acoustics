import { calcularFrecuenciaCritica, calcularRigidezFlexion, calcularF11, calcularFd } from './iso12354.js';

/**
 * Calculates sound transmission loss (R) for a single simple homogeneous wall
 * structured explicitly by frequency zones:
 * - Zone I (f < f11): Stiffness and fundamental resonance controlled region.
 * - Zone II (f11 <= f < 0.5 * fc): Mass law controlled region (diffuse field).
 * - Zone III (0.5 * fc <= f < fc): Coincidence transition region (controlled by internal damping).
 * - Zone IV (f >= fc): Coincidence region above fc with radiation efficiency adjustment.
 *
 * @param {Object} material - Material physical properties
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number} material.young - Young's Modulus (Pa)
 * @param {number} material.amortiguamiento - Internal loss factor (eta)
 * @param {number} [material.poisson=0.3] - Poisson's ratio
 * @param {number[]} frecuencias - 1/3 octave center frequencies (Hz)
 * @param {number} [lx=1.5] - Wall width (m)
 * @param {number} [ly=1.2] - Wall height (m)
 * @returns {number[]} Array of R values in dB per frequency band
 */
export function calcularParedSimpleZonal(material, frecuencias, lx = 1.5, ly = 1.2) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);

  const nu = material.poisson !== undefined ? material.poisson : 0.3;
  const B = calcularRigidezFlexion(material.young, material.espesor, nu);
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const f11 = calcularF11(B, m, lx, ly);
  const etaInt = material.amortiguamiento || 0.01;

  const rho0 = 1.18; // Air density (kg/m³)
  const c0 = 343;    // Speed of sound in air (m/s)

  // Mass law base helper
  const R_mass = (f) => 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) - 5.5;

  const f_low = 0.5 * fc;

  return frecuencias.map(f => {
    const etaTotal = etaInt + m / (485 * Math.sqrt(f));

    // ZONA I: f < f11 (Stiffness/Resonance region below fundamental mode)
    if (f < f11) {
      // Below f11, transmission is stiffness-limited.
      // R stays higher or flat compared to pure mass law due to boundary stiffness.
      const R_f11 = R_mass(f11);
      const stiffnessFactor = 20 * Math.log10(f11 / Math.max(1, f));
      const R = R_f11 + 0.5 * stiffnessFactor;
      return Math.max(0, parseFloat(R.toFixed(1)));
    }

    // ZONA II: f11 <= f < 0.5 * fc (Mass Law Region)
    if (f < f_low) {
      const R = R_mass(f);
      return Math.max(0, parseFloat(R.toFixed(1)));
    }

    // ZONA III: 0.5 * fc <= f < fc (Transition / Coincidence dip onset)
    if (f < fc) {
      const R_low = R_mass(f_low);
      
      // Calculate R at fc considering damping dip
      const ratio_fc = 1.0;
      const sigma_fc = 2.5;
      const R_fc = 10 * Math.log10(1 + Math.pow((Math.PI * m * fc) / (rho0 * c0), 2)) +
                   10 * Math.log10((2 * etaTotal * sigma_fc) / Math.PI);

      // Linear interpolation in log-frequency space
      const fraction = (Math.log10(f) - Math.log10(f_low)) / (Math.log10(fc) - Math.log10(f_low));
      const R = R_low + fraction * (R_fc - R_low);
      return Math.max(0, parseFloat(R.toFixed(1)));
    }

    // ZONA IV: f >= fc (Above Coincidence)
    const ratio_f = f / fc;
    let sigma = 2.5;
    if (ratio_f > 1.0) {
      const diff = 1.0 - (1.0 / ratio_f);
      if (diff > 0) {
        sigma = 1.0 / Math.sqrt(diff);
      }
    }
    sigma = isNaN(sigma) ? 2.5 : Math.min(2.5, sigma);

    const R_coinc = 10 * Math.log10(1 + Math.pow((Math.PI * m * f) / (rho0 * c0), 2)) +
                    10 * Math.log10((2 * etaTotal * sigma) / Math.PI);
    
    // Cap at mass law corrected upper bound
    const R = Math.min(R_coinc, R_mass(f));
    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}
