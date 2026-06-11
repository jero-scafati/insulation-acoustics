/**
 * Acoustic engine: Mass Law Calculations
 * Mass Law provides the baseline sound reduction index for a limp, infinite panel.
 */

/**
 * Calculates transmission loss using the theoretical diffuse-field Mass Law.
 * R = 20 * log10(m * f) - 47 dB
 * 
 * @param {Object} material - The selected material properties.
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number[]} frecuencias - Array of frequencies (Hz)
 * @returns {number[]} Array of R values in dB
 */
export function calcularLeyMasasTeorica(material, frecuencias) {
  const m = material.densidad * material.espesor; // Surface mass (kg/m²)
  if (m <= 0) return frecuencias.map(() => 0);
  
  return frecuencias.map(f => {
    const R = 20 * Math.log10(m * f) - 47;
    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}

/**
 * Calculates transmission loss using the corrected (field) Mass Law,
 * which accounts for a limiting angle of incidence (typically 78 degrees)
 * or empirical field corrections.
 * R = R_teorica - 10 * log10(0.23 * R_teorica)
 * Or simplified: R = 20 * log10(m * f) - 48 dB (with field factor offset)
 * 
 * @param {Object} material
 * @param {number[]} frecuencias
 * @returns {number[]}
 */
export function calcularLeyMasasCorregida(material, frecuencias) {
  const m = material.densidad * material.espesor;
  if (m <= 0) return frecuencias.map(() => 0);
  
  return frecuencias.map(f => {
    // Normal incidence mass law
    const Rn = 20 * Math.log10(m * f) - 42.4;
    // Field correction using limiting angle or empirical 5 dB offset
    const R = Rn - 5;
    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}
