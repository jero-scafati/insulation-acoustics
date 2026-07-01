/**
 * Acoustic engine: ISO 12354-1 Calculations
 * ISO 12354-1 Annex B provides a method for calculating sound transmission loss 
 * based on mass, stiffness, and internal loss factor (damping).
 */

/**
 * Calculates the critical frequency (fc) of a homogeneous panel.
 * fc = (c^2 / (2 * pi * h)) * sqrt(12 * rho * (1 - nu^2) / E)
 * 
 * @param {number} E - Young's Modulus (Pa)
 * @param {number} densidad - Density (kg/m³)
 * @param {number} espesor - Thickness (m)
 * @param {number} [nu=0.3] - Poisson's ratio (default 0.3)
 * @param {number} [c=343] - Speed of sound in air (default 343 m/s)
 * @returns {number} Critical frequency (Hz)
 */
export function calcularFrecuenciaCritica(E, densidad, espesor, nu = 0.3, c = 343) {
  if (E <= 0 || densidad <= 0 || espesor <= 0) return 0;
  const fc = (Math.pow(c, 2) / (2 * Math.PI * espesor)) * 
             Math.sqrt((12 * densidad * (1 - Math.pow(nu, 2))) / E);
  return fc;
}

/**
 * Calculates the bending stiffness (B) of a plate.
 * B = (E * t^3) / (12 * (1 - nu^2))
 */
export function calcularRigidezFlexion(E, espesor, nu = 0.3) {
  if (E <= 0 || espesor <= 0) return 0;
  return (E * Math.pow(espesor, 3)) / (12 * (1 - Math.pow(nu, 2)));
}

/**
 * Calculates the fundamental Mode (1,1) frequency of a rectangular simply supported plate.
 * f11 = (pi / 2) * sqrt(B / m) * (1 / lx^2 + 1 / ly^2)
 */
export function calcularF11(B, m, lx = 1.0, ly = 1.5) {
  if (B <= 0 || m <= 0 || lx <= 0 || ly <= 0) return 0;
  return (Math.PI / 2) * Math.sqrt(B / m) * (1 / Math.pow(lx, 2) + 1 / Math.pow(ly, 2));
}

/**
 * Calculates the dilatational frequency (fd) of a plate.
 * fd = (cL / (2 * pi * t)) where cL = sqrt(E * (1 - nu) / (rho * (1 + nu) * (1 - 2*nu)))
 */
export function calcularFd(E, densidad, thickness, nu = 0.3) {
  if (E <= 0 || densidad <= 0 || thickness <= 0) return 0;
  const nu_safe = nu >= 0.5 ? 0.49 : nu; // Prevent division by zero
  const cL = Math.sqrt((E * (1 - nu_safe)) / (densidad * (1 + nu_safe) * (1 - 2 * nu_safe)));
  return cL / (2 * Math.PI * thickness);
}


/**
 * Calculates transmission loss using the ISO 12354-1 Annex B method.
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
export function calcularISO12354(material, frecuencias) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);
  
  const nu = material.poisson || 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const eta = material.amortiguamiento || 0.01;
  
  return frecuencias.map(f => {
    // 1. Below critical frequency (mass-controlled)
    if (f < fc / 2) {
      const R = 20 * Math.log10(m * f) - 47;
      return Math.max(0, parseFloat(R.toFixed(1)));
    } 
    
    // 2. Coincidence Dip frequency
    const R_fc = 20 * Math.log10(m * fc) - 47 + 10 * Math.log10(eta) - 2.5;
    
    // 3. Above critical frequency (damping-controlled)
    if (f > fc) {
      const R = 20 * Math.log10(m * f) - 47 + 10 * Math.log10(eta) + 10 * Math.log10(f / fc) - 2;
      return Math.max(0, parseFloat(R.toFixed(1)));
    }
    
    // 4. In transition (linear interpolation in dB between fc/2 and fc)
    const R_fc2 = 20 * Math.log10(m * (fc / 2)) - 47;
    const ratio = (f - fc / 2) / (fc - fc / 2);
    const R = R_fc2 + ratio * (R_fc - R_fc2);
    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}
