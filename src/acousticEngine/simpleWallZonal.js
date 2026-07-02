import { calcularFrecuenciaCritica, calcularFd } from './iso12354.js';

/**
 * Calculates sound transmission loss (R) for a simple wall matching exact 
 * cathedral/cátedra model (Ecuación 13, 14 y Zona III por f_d).
 * 
 * Zona I (f < fc): Ley de Masas: R = 20*log10(ms * f) - 47 (o 20*log10(m*f) - 47 dB)
 * Zona II (fc <= f < fd): Coincidencia exacta:
 *   R = 20*log10((w * ms)/(2*rho0*c0)) + 10*log10(pi / (4*eta)) - 10*log10(w / wc) - 10*log10(1 - wc/w) + 5
 * Zona III (f >= fd): Retorno a Ley de Masas.
 * 
 * @param {Object} material - Material physical properties
 * @param {number} material.densidad - Density (kg/m³)
 * @param {number} material.espesor - Thickness (m)
 * @param {number} material.young - Young's Modulus (Pa)
 * @param {number} material.amortiguamiento - Internal loss factor (eta)
 * @param {number} [material.poisson=0.3] - Poisson's ratio
 * @param {number[]} frecuencias - 1/3 octave center frequencies (Hz)
 * @returns {number[]} Array of R values in dB per frequency band
 */
export function calcularParedSimpleZonal(material, frecuencias) {
  const ms = material.densidad * material.espesor;
  if (ms <= 0) return frecuencias.map(() => 0);

  const nu = material.poisson !== undefined ? material.poisson : 0.3;
  const fc = calcularFrecuenciaCritica(material.young, material.densidad, material.espesor, nu);
  const fd = calcularFd(material.young, material.densidad, material.espesor, nu);
  const eta = material.amortiguamiento || 0.01;

  return frecuencias.map(f => {
    // Base Ley de Masas de Cátedra (campo difuso): R = 20*log10(ms * f) - 47
    const R_masas = 20 * Math.log10(ms * f) - 47;

    // Zona I: f < fc -> Ley de Masas pura
    if (f < fc) {
      return Math.max(0, parseFloat(R_masas.toFixed(1)));
    }

    // Zona III: f >= fd -> Retorno a Ley de Masas
    if (f >= fd) {
      return Math.max(0, parseFloat(R_masas.toFixed(1)));
    }

    // Zona II: fc <= f < fd -> Región de Coincidencia
    // R = R_masas + 10*log10(eta) + 10*log10(f / fc) + 10*log10(1 - fc / f)
    // Para evitar la singularidad en f = fc, limitamos el término (1 - fc/f) a un mínimo de 0.05
    const diff = Math.max(0.05, 1 - (fc / f));
    const R = R_masas + 10 * Math.log10(eta) + 10 * Math.log10(f / fc) + 10 * Math.log10(diff);

    return Math.max(0, parseFloat(R.toFixed(1)));
  });
}
