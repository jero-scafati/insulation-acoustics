/**
 * Calculates the Weighted Sound Reduction Index (Rw) according to ISO 717-1.
 * Rw is calculated based on the 1/3 octave band values from 100 Hz to 3150 Hz.
 * 
 * @param {number[]} frecuencias - Full array of 1/3 octave band frequencies
 * @param {number[]} R_vals - Corresponding sound reduction index values (dB)
 * @returns {number} Rw value in dB
 */
export function calcularRw(frecuencias, R_vals) {
  // ISO 717-1 Reference frequencies and values
  const refFreqs = [
    100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150
  ];
  const refVals = [
    -19, -16, -13, -10, -7, -4, -1, 0, 1, 2, 3, 4, 4, 4, 4, 4
  ];

  // Extract the R values corresponding to the reference frequencies
  const R_ref = refFreqs.map(freq => {
    // Find closest frequency index in the input frequencies list
    const idx = frecuencias.findIndex(f => Math.abs(f - freq) < 1.0);
    return idx !== -1 ? R_vals[idx] : 0;
  });

  // Shift the reference curve to find the maximum shift that satisfies the criteria:
  // The sum of unfavorable deviations (shifted_ref_val - R_val) must not exceed 32.0 dB.
  // We can search from shift = 0 dB to shift = 100 dB (a reasonable range for single walls)
  let bestShift = 0;
  
  // Let's do a search. A shift can be positive or negative.
  for (let shift = -20; shift <= 100; shift++) {
    let unfavorableDeviationsSum = 0;
    
    for (let i = 0; i < refVals.length; i++) {
      const shiftedRef = refVals[i] + shift;
      const deviation = shiftedRef - R_ref[i];
      if (deviation > 0) {
        unfavorableDeviationsSum += deviation;
      }
    }
    
    if (unfavorableDeviationsSum <= 32.0) {
      bestShift = shift;
    } else {
      // Since unfavorable deviations increase as shift increases,
      // once we exceed 32 dB, we can stop the search.
      break;
    }
  }

  // The Rw value is the shifted reference value at 500 Hz.
  // Since the reference value at 500 Hz is 0 dB, Rw is exactly the shift value.
  return bestShift;
}
