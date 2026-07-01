import { calcularFrecuenciaCritica } from './iso12354.js';

/**
 * Calculates sound transmission loss using Davy's Model (2009) matching the TP requirements.
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
  const p = material.densidad;
  const t = material.espesor;
  const m = p * t;
  if (m <= 0) return frecuencias.map(() => 0);
  
  const E = material.young;
  const o = material.poisson !== undefined ? material.poisson : 0.3;
  const nint = material.amortiguamiento || 0.01;
  
  // Wall dimensions l1 (width) and l2 (height)
  const l1 = ancho;
  const l2 = alto;
  
  const B = (E / (1 - o * o)) * (Math.pow(t, 3) / 12);
  const c0 = 343;
  const Fc = (c0 * c0 / (2 * Math.PI)) * Math.sqrt(m / B);
  
  const averages = 3;
  const octave = 3; // tercio de octava
  const limit = Math.pow(2, 1 / (2 * octave));
  
  return frecuencias.map(f => {
    const Ntot = nint + m / (485 * Math.sqrt(f));
    const ratio = f / Fc;
    
    let TLost;
    if (ratio < 1 / limit || ratio > limit) {
      TLost = Single_leaf_Davy(f, p, E, o, t, Ntot, l2, l1);
    } else {
      let Avsingle_leaf = 0;
      for (let j = 1; j <= averages; j++) {
        const factor = Math.pow(2, (2 * j - 1 - averages) / (2 * averages * octave));
        const singleVal = Single_leaf_Davy(f * factor, p, E, o, t, Ntot, l2, l1);
        const aux = Math.pow(10, -singleVal / 10);
        Avsingle_leaf += aux;
      }
      TLost = -10 * Math.log10(Avsingle_leaf / averages);
    }
    
    return Math.max(0, parseFloat(TLost.toFixed(1)));
  });
}

/**
 * Single leaf transmission loss function by Davy.
 */
function Single_leaf_Davy(frequency, density, Young, Poisson, thickness, lossfactor, length, width) {
  const po = 1.18;
  const c0 = 343;
  const cos21Max = 0.9;
  const surface_density = density * thickness;
  
  const critical_frequency = Math.sqrt(12 * density * (1 - Poisson * Poisson) / Young) * (c0 * c0) / (2 * thickness * Math.PI);
  const normal = po * c0 / (Math.PI * frequency * surface_density);
  const normal2 = normal * normal;
  
  const e = 2 * length * width / (length + width);
  let cos2l = c0 / (2 * Math.PI * frequency * e);
  if (cos2l > cos21Max) {
    cos2l = cos21Max;
  }
  
  const tau1 = normal2 * Math.log((normal2 + 1) / (normal2 + cos2l)); // natural log (ln)
  
  const ratio = frequency / critical_frequency;
  let r = 1 - 1 / ratio;
  if (r < 0) {
    r = 0;
  }
  const G = Math.sqrt(r);
  const rad = Sigma(G, frequency, length, width);
  const rad2 = rad * rad;
  
  const netatotal = lossfactor + rad * normal;
  const z = 2 / netatotal;
  const y = Math.atan(z) - Math.atan(z * (1 - ratio));
  
  let tau2 = normal2 * rad2 * y / (netatotal * 2 * ratio);
  tau2 = tau2 * shear(frequency, density, Young, Poisson, thickness);
  
  let tau;
  if (frequency < critical_frequency) {
    tau = tau1 + tau2;
  } else {
    tau = tau2;
  }
  
  return -10 * Math.log10(tau);
}

/**
 * Radiation efficiency function Sigma by Davy.
 */
function Sigma(G, freq, width, length) {
  const c0 = 343;
  const w = 1.3;
  const beta = 0.234;
  const n = 2;
  
  const S = length * width;
  const U = 2 * (length + width);
  const twoa = 4 * S / U;
  const k = 2 * Math.PI * freq / c0;
  
  let f_val = w * Math.sqrt(Math.PI / (k * twoa));
  if (f_val > 1) {
    f_val = 1;
  }
  
  const denom = (Math.sqrt(k * twoa / Math.PI) * (2 / 3) - beta);
  const h = 1 / (Math.abs(denom) < 1e-6 ? 1e-6 : denom);
  const q = 2 * Math.PI / (k * k * S);
  const qn = Math.pow(q, n);
  
  let xn;
  if (G < f_val) {
    const alpha = h / f_val - 1;
    xn = Math.pow(h - alpha * G, n);
  } else {
    xn = Math.pow(G, n);
  }
  
  return Math.pow(xn + qn, -1 / n);
}

/**
 * Shear correction function by Davy.
 */
function shear(frequency, density, Young, Poisson, thickness) {
  const omega = 2 * Math.PI * frequency;
  let chi = (1 + Poisson) / (0.87 + 1.12 * Poisson);
  chi = chi * chi;
  const X = thickness * thickness / 12;
  const QP = Young / (1 - Poisson * Poisson);
  const C = -omega * omega;
  const B = C * (1 + 2 * chi / (1 - Poisson)) * X;
  const A = X * QP / density;
  
  // Solve quadratic: A * kbcor2^2 + B * kbcor2 + C = 0
  const kbcor2 = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
  const kb2 = Math.sqrt(-C / A);
  
  const G_mod = Young / (2 * (1 + Poisson));
  const kT2 = -C * density * chi / G_mod;
  const kL2 = -C * density / QP;
  const kS2 = kT2 + kL2;
  
  let ASI = 1 + X * (kbcor2 * kT2 / kL2 - kT2);
  ASI = ASI * ASI;
  
  const BSI = 1 - X * kT2 + kbcor2 * kS2 / (kb2 * kb2);
  const CSI = Math.sqrt(1 - X * kT2 + kS2 * kS2 / (4 * kb2 * kb2));
  
  return ASI / (BSI * CSI);
}
