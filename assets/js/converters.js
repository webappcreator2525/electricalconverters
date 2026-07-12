/**
 * converters.js — electricalconverters.com
 *
 * Pure electrical-unit calculation functions.
 * Rules:
 *   • No DOM access
 *   • No side effects
 *   • Return null for any invalid / zero / negative input
 *
 * Browser usage:  all functions live on the global `Converters` namespace.
 * Node.js usage:  also exported via `module.exports` for testing.
 */

/* ============================================================
   INTERNAL HELPERS
   ============================================================ */

const SQRT3 = Math.sqrt(3); // ≈ 1.7320508…

/**
 * Returns true when every argument is a finite, positive number.
 * @param  {...number} nums
 * @returns {boolean}
 */
function _allPositive(...nums) {
  return nums.every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0);
}

/**
 * Returns true when the value is a valid power factor: (0, 1].
 * @param {number} pf
 * @returns {boolean}
 */
function _validPF(pf) {
  return typeof pf === 'number' && Number.isFinite(pf) && pf > 0 && pf <= 1;
}


/* ============================================================
   1. WATTS TO AMPS
   DC            : A = W / V
   AC Single-phase: A = W / (V × PF)
   AC Three-phase : A = W / (V × PF × √3)
   ============================================================ */

/**
 * Convert watts to amps.
 *
 * @param {number}  watts       - Real power in watts (W > 0)
 * @param {number}  volts       - Voltage in volts (V > 0)
 * @param {number}  [powerFactor=1] - Power factor, 0 < PF ≤ 1 (ignored for DC)
 * @param {string}  [phase='dc']    - 'dc' | 'single' | 'three'
 * @returns {number|null}
 */
function wattsToAmps(watts, volts, powerFactor = 1, phase = 'dc') {
  if (!_allPositive(watts, volts)) return null;

  switch (phase) {
    case 'dc':
      return watts / volts;

    case 'single':
      if (!_validPF(powerFactor)) return null;
      return watts / (volts * powerFactor);

    case 'three':
      if (!_validPF(powerFactor)) return null;
      return watts / (volts * powerFactor * SQRT3);

    default:
      return null;
  }
}


/* ============================================================
   2. KVA TO KW
   kW = kVA × PF
   ============================================================ */

/**
 * Convert apparent power (kVA) to real power (kW).
 *
 * @param {number} kva         - Apparent power in kilovolt-amps (kVA > 0)
 * @param {number} powerFactor - Power factor, 0 < PF ≤ 1
 * @returns {number|null}
 */
function kvaToKw(kva, powerFactor) {
  if (!_allPositive(kva)) return null;
  if (!_validPF(powerFactor)) return null;
  return kva * powerFactor;
}


/* ============================================================
   2b. VA TO WATTS
   W = VA × PF
   ============================================================ */

/**
 * Convert apparent power (volt-amperes) to real power (watts).
 *
 * W = VA × PF
 *
 * @param {number} va          - Apparent power in volt-amperes (VA > 0)
 * @param {number} powerFactor - Power factor, 0 < PF ≤ 1
 * @returns {number|null}
 */
function vaToWatts(va, powerFactor) {
  if (!_allPositive(va)) return null;
  if (!_validPF(powerFactor)) return null;
  return va * powerFactor;
}

/**
 * Convert apparent power (volt-amperes) to real power (kilowatts).
 *
 * kW = (VA × PF) / 1000
 *
 * @param {number} va          - Apparent power in volt-amperes (VA > 0)
 * @param {number} powerFactor - Power factor, 0 < PF ≤ 1
 * @returns {number|null}
 */
function vaToKw(va, powerFactor) {
  const w = vaToWatts(va, powerFactor);
  return w !== null ? w / 1000 : null;
}



/* ============================================================
   3. KWH TO WATTS
   W = kWh × 1000 / hours
   ============================================================ */

/**
 * Convert energy (kWh) consumed over a time period to average power (W).
 *
 * @param {number} kwh   - Energy in kilowatt-hours (kWh > 0)
 * @param {number} hours - Time period in hours (hours > 0)
 * @returns {number|null}
 */
function kwhToWatts(kwh, hours) {
  if (!_allPositive(kwh, hours)) return null;
  return (kwh * 1000) / hours;
}


/* ============================================================
   3b. WATTS TO KWH
   kWh = (W × hours) / 1000
   ============================================================ */

/**
 * Convert power (watts) consumed over time to energy (kilowatt-hours).
 * Reverse of kwhToWatts.
 *
 * kWh = (W × hours) / 1000
 *
 * @param {number} watts - Power in watts (W > 0)
 * @param {number} hours - Time in hours (hours > 0)
 * @returns {number|null}
 */
function wattsToKwh(watts, hours) {
  if (!_allPositive(watts, hours)) return null;
  return (watts * hours) / 1000;
}


/* ============================================================
   4. KVA TO AMPS
   Single-phase: A = (kVA × 1000) / V
   Three-phase : A = (kVA × 1000) / (V × √3)
   ============================================================ */

/**
 * Convert apparent power (kVA) to current (amps).
 *
 * @param {number} kva           - Apparent power in kVA (kVA > 0)
 * @param {number} volts         - Voltage in volts (V > 0)
 * @param {string} [phase='single'] - 'single' | 'three'
 * @returns {number|null}
 */
function kvaToAmps(kva, volts, phase = 'single') {
  if (!_allPositive(kva, volts)) return null;

  switch (phase) {
    case 'single':
      return (kva * 1000) / volts;

    case 'three':
      return (kva * 1000) / (volts * SQRT3);

    default:
      return null;
  }
}


/* ============================================================
   5. MAH TO WH
   Wh = mAh × V / 1000
   ============================================================ */

/**
 * Convert battery capacity (mAh) at a given voltage to energy (Wh).
 *
 * @param {number} mah   - Capacity in milliamp-hours (mAh > 0)
 * @param {number} volts - Nominal voltage (V > 0)
 * @returns {number|null}
 */
function mahToWh(mah, volts) {
  if (!_allPositive(mah, volts)) return null;
  return (mah * volts) / 1000;
}


/* ============================================================
   5b. WH TO MAH  (reverse of mahToWh)
   mAh = (Wh × 1000) / V
   ============================================================ */

/**
 * Convert energy (watt-hours) to battery capacity (milliamp-hours).
 * Wh to mAh is the reverse of mAh to Wh.
 *
 * mAh = (Wh × 1000) / V
 *
 * @param {number} wh    - Energy in watt-hours (Wh > 0)
 * @param {number} volts - Nominal voltage (V > 0)
 * @returns {number|null}
 */
function whToMah(wh, volts) {
  if (!_allPositive(wh, volts)) return null;
  return (wh * 1000) / volts;
}



/* ============================================================
   6. AMPS TO WATTS  (reverse of wattsToAmps)
   DC            : W = A × V
   AC Single-phase: W = A × V × PF
   AC Three-phase : W = A × V × PF × √3
   ============================================================ */

/**
 * Convert current (amps) to power (watts).
 *
 * @param {number}  amps             - Current in amps (A > 0)
 * @param {number}  volts            - Voltage in volts (V > 0)
 * @param {number}  [powerFactor=1]  - Power factor, 0 < PF ≤ 1 (ignored for DC)
 * @param {string}  [phase='dc']     - 'dc' | 'single' | 'three'
 * @returns {number|null}
 */
function ampsToWatts(amps, volts, powerFactor = 1, phase = 'dc') {
  if (!_allPositive(amps, volts)) return null;

  switch (phase) {
    case 'dc':
      return amps * volts;

    case 'single':
      if (!_validPF(powerFactor)) return null;
      return amps * volts * powerFactor;

    case 'three':
      if (!_validPF(powerFactor)) return null;
      return amps * volts * powerFactor * SQRT3;

    default:
      return null;
  }
}


/* ============================================================
   6b. AMPS TO VOLTS
   V = I × R
   ============================================================ */

/**
 * Convert electric current (amps) to voltage (volts) using Ohm's Law.
 *
 * V = I × R
 *
 * @param {number} amps  - Current in amps (A > 0)
 * @param {number} ohms  - Resistance in ohms (Ω > 0)
 * @returns {number|null}
 */
function ampsToVolts(amps, ohms) {
  if (!_allPositive(amps, ohms)) return null;
  return amps * ohms;
}


/* ============================================================
   7. WATTS TO VOLTS
   Mode 'amps-dc'   : V = W / A
   Mode 'amps-ac'   : V = W / (A × PF)
   Mode 'resistance': V = √(W × R)
   ============================================================ */

/**
 * Convert power (watts) to voltage (volts).
 *
 * Two independent calculation modes — cannot mix them:
 *
 * Mode 'amps-dc'  : V = W / A          (DC using current)
 * Mode 'amps-ac'  : V = W / (A × PF)   (AC single-phase using current + PF)
 * Mode 'resistance': V = √(W × R)      (DC or AC using resistance via Ohm's Law)
 *
 * @param {number} watts           - Power in watts (W > 0)
 * @param {number} ampsOrOhms      - Current in amps (modes amps-*) OR resistance
 *                                   in ohms (mode 'resistance'). Must be > 0.
 * @param {string} [mode='amps-dc']
 * @param {number} [powerFactor=1] - Only used in mode 'amps-ac', 0 < PF ≤ 1
 * @returns {number|null}
 */
function wattsToVolts(watts, ampsOrOhms, mode = 'amps-dc', powerFactor = 1) {
  if (!_allPositive(watts, ampsOrOhms)) return null;
  switch (mode) {
    case 'amps-dc':     return watts / ampsOrOhms;
    case 'amps-ac':     if (!_validPF(powerFactor)) return null;
                        return watts / (ampsOrOhms * powerFactor);
    case 'resistance':  return Math.sqrt(watts * ampsOrOhms);
    default:            return null;
  }
}


/* ============================================================
   8. KW TO KVA  (reverse of kvaToKw)
   kVA = kW / PF
   ============================================================ */

/**
 * Convert real power (kW) to apparent power (kVA).
 *
 * @param {number} kw          - Real power in kilowatts (kW > 0)
 * @param {number} powerFactor - Power factor, 0 < PF ≤ 1
 * @returns {number|null}
 */
function kwToKva(kw, powerFactor) {
  if (!_allPositive(kw)) return null;
  if (!_validPF(powerFactor)) return null;
  return kw / powerFactor;
}


/* ============================================================
   8. KW TO AMPS
   DC                        : A = (kW × 1000) / V
   AC Single-phase           : A = (kW × 1000) / (V × PF)
   AC Three-phase (line-to-line)   : A = (kW × 1000) / (√3 × V × PF)
   AC Three-phase (line-to-neutral): A = (kW × 1000) / (3 × V × PF)
   ============================================================ */

/**
 * Convert real power (kW) to electric current (amps).
 *
 * DC            : A = (kW × 1000) / V
 * AC Single-phase: A = (kW × 1000) / (V × PF)
 * AC Three-phase (line-to-line): A = (kW × 1000) / (√3 × V × PF)
 * AC Three-phase (line-to-neutral): A = (kW × 1000) / (3 × V × PF)
 *
 * @param {number} kw          - Real power in kilowatts (kW > 0)
 * @param {number} volts       - Voltage in volts (V > 0)
 * @param {number} [powerFactor=1] - Power factor, 0 < PF ≤ 1
 * @param {string} [phase='dc']    - 'dc' | 'single' | 'three-ll' | 'three-ln'
 * @returns {number|null}
 */
function kwToAmps(kw, volts, powerFactor = 1, phase = 'dc') {
  if (!_allPositive(kw, volts)) return null;
  switch (phase) {
    case 'dc':       return (kw * 1000) / volts;
    case 'single':   if (!_validPF(powerFactor)) return null;
                     return (kw * 1000) / (volts * powerFactor);
    case 'three-ll': if (!_validPF(powerFactor)) return null;
                     return (kw * 1000) / (SQRT3 * volts * powerFactor);
    case 'three-ln': if (!_validPF(powerFactor)) return null;
                     return (kw * 1000) / (3 * volts * powerFactor);
    default:         return null;
  }
}


/* ============================================================
   9. AMPS TO KW  (reverse of kwToAmps)
   DC             : kW = (A × V) / 1000
   AC Single-phase: kW = (A × V × PF) / 1000
   AC Three-phase : kW = (√3 × A × V × PF) / 1000   (line-to-line)
   ============================================================ */

/**
 * Convert current (amps) to real power (kilowatts).
 *
 * @param {number}  amps            - Current in amps (A > 0)
 * @param {number}  volts           - Voltage in volts (V > 0)
 * @param {number}  [powerFactor=1] - Power factor, 0 < PF ≤ 1 (ignored for DC)
 * @param {string}  [phase='dc']    - 'dc' | 'single' | 'three'
 * @returns {number|null}
 */
function ampsToKw(amps, volts, powerFactor = 1, phase = 'dc') {
  if (!_allPositive(amps, volts)) return null;
  switch (phase) {
    case 'dc':
      return (amps * volts) / 1000;
    case 'single':
      if (!_validPF(powerFactor)) return null;
      return (amps * volts * powerFactor) / 1000;
    case 'three':
      if (!_validPF(powerFactor)) return null;
      return (amps * volts * powerFactor * SQRT3) / 1000;
    default:
      return null;
  }
}


/* ============================================================
   10. VOLTS TO AMPS
   Mode 'power-dc'   : A = P / V
   Mode 'power-ac'   : A = P / (V × PF)
   Mode 'resistance' : A = V / R          (Ohm's Law)
   ============================================================ */

/**
 * Convert voltage (volts) to current (amps) by one of two paths.
 *
 * Mode 'power-dc'   : A = P / V         (needs power, DC)
 * Mode 'power-ac'   : A = P / (V × PF)  (needs power, AC single-phase)
 * Mode 'resistance' : A = V / R         (needs resistance, Ohm's Law)
 *
 * @param {number} volts            - Voltage in volts (V > 0)
 * @param {number} powerOrOhms      - Power in watts (power-* modes) OR resistance
 *                                    in ohms (mode 'resistance'). Must be > 0.
 * @param {string} [mode='power-dc']
 * @param {number} [powerFactor=1]  - Only used in mode 'power-ac', 0 < PF ≤ 1
 * @returns {number|null}
 */
function voltsToAmps(volts, powerOrOhms, mode = 'power-dc', powerFactor = 1) {
  if (!_allPositive(volts, powerOrOhms)) return null;
  switch (mode) {
    case 'power-dc':    return powerOrOhms / volts;
    case 'power-ac':    if (!_validPF(powerFactor)) return null;
                        return powerOrOhms / (volts * powerFactor);
    case 'resistance':  return volts / powerOrOhms;
    default:            return null;
  }
}


/* ============================================================
   11. VOLTS TO WATTS
   DC             : W = V × A
   AC Single-phase: W = V × A × PF
   AC Three-phase : W = √3 × V × A × PF   (line-to-line)
   ============================================================ */

/**
 * Convert voltage (volts) to power (watts) given the current.
 *
 * @param {number}  volts           - Voltage in volts (V > 0)
 * @param {number}  amps            - Current in amps (A > 0)
 * @param {number}  [powerFactor=1] - Power factor, 0 < PF ≤ 1 (ignored for DC)
 * @param {string}  [phase='dc']    - 'dc' | 'single' | 'three'
 * @returns {number|null}
 */
function voltsToWatts(volts, amps, powerFactor = 1, phase = 'dc') {
  if (!_allPositive(volts, amps)) return null;
  switch (phase) {
    case 'dc':
      return volts * amps;
    case 'single':
      if (!_validPF(powerFactor)) return null;
      return volts * amps * powerFactor;
    case 'three':
      if (!_validPF(powerFactor)) return null;
      return SQRT3 * volts * amps * powerFactor;
    default:
      return null;
  }
}


/* ============================================================
   12. WH TO KWH
   kWh = Wh / 1000
   ============================================================ */

/**
 * Convert energy in watt-hours to kilowatt-hours.
 *
 * @param {number} wh - Energy in watt-hours (Wh > 0)
 * @returns {number|null}
 */
function whToKwh(wh) {
  if (!_allPositive(wh)) return null;
  return wh / 1000;
}


/* ============================================================
   13. AH TO WH
   Wh = Ah × V
   ============================================================ */

/**
 * Convert battery capacity (amp-hours) at a given voltage to energy (Wh).
 *
 * @param {number} ah    - Capacity in amp-hours (Ah > 0)
 * @param {number} volts - Nominal voltage (V > 0)
 * @returns {number|null}
 */
function ahToWh(ah, volts) {
  if (!_allPositive(ah, volts)) return null;
  return ah * volts;
}


/* ============================================================
   14. MAH TO AH
   Ah = mAh / 1000
   ============================================================ */

/**
 * Convert battery capacity in milliamp-hours to amp-hours.
 *
 * @param {number} mah - Capacity in milliamp-hours (mAh > 0)
 * @returns {number|null}
 */
function mahToAh(mah) {
  if (!_allPositive(mah)) return null;
  return mah / 1000;
}


/* ============================================================
   15. JOULES TO WATTS
   W = J / s
   ============================================================ */

/**
 * Convert energy (joules) delivered over a time period to average power (watts).
 *
 * @param {number} joules  - Energy in joules (J > 0)
 * @param {number} seconds - Time in seconds (s > 0)
 * @returns {number|null}
 */
function joulesToWatts(joules, seconds) {
  if (!_allPositive(joules, seconds)) return null;
  return joules / seconds;
}


/* ============================================================
   16. HP TO KW  /  KW TO HP
   1 electrical (mechanical) horsepower = 745.7 W = 0.7457 kW.
   Metric hp (PS) = 735.5 W — not used here; noted on the pages.
   ============================================================ */

const HP_W = 745.7; // watts per (electrical) horsepower

/**
 * Convert (electrical) horsepower to kilowatts.
 *
 * kW = (hp × 745.7) ÷ 1,000
 *
 * @param {number} hp - Power in horsepower (hp > 0)
 * @returns {number|null}
 */
function hpToKw(hp) {
  if (!_allPositive(hp)) return null;
  return (hp * HP_W) / 1000;
}

/**
 * Convert kilowatts to (electrical) horsepower.
 *
 * hp = (kW × 1,000) ÷ 745.7
 *
 * @param {number} kw - Power in kilowatts (kW > 0)
 * @returns {number|null}
 */
function kwToHp(kw) {
  if (!_allPositive(kw)) return null;
  return (kw * 1000) / HP_W;
}


/* ============================================================
   17. HP TO AMPS  (motor full-load current, FLA)
   Electrical input power = (hp × 745.7) ÷ efficiency.
   DC             : A = (hp × 745.7) ÷ (V × eff)
   AC Single-phase: A = (hp × 745.7) ÷ (V × PF × eff)
   AC Three-phase : A = (hp × 745.7) ÷ (√3 × V × PF × eff)   (line-to-line)
   ============================================================ */

/**
 * Convert motor horsepower to full-load current (amps).
 *
 * Shaft power (hp) is scaled up to electrical input power by the motor
 * efficiency, then divided by the voltage / PF / phase term.
 *
 * @param {number}  hp              - Motor output power in hp (hp > 0)
 * @param {number}  volts           - Voltage in volts (V > 0)
 * @param {number}  [powerFactor=1] - Power factor, 0 < PF ≤ 1 (ignored for DC)
 * @param {number}  [efficiency=1]  - Motor efficiency, 0 < η ≤ 1
 * @param {string}  [phase='single']- 'dc' | 'single' | 'three'
 * @returns {number|null}
 */
function hpToAmps(hp, volts, powerFactor = 1, efficiency = 1, phase = 'single') {
  if (!_allPositive(hp, volts)) return null;
  if (!_validPF(efficiency)) return null; // efficiency shares the (0,1] domain
  const wattsIn = (hp * HP_W) / efficiency;
  switch (phase) {
    case 'dc':
      return wattsIn / volts;
    case 'single':
      if (!_validPF(powerFactor)) return null;
      return wattsIn / (volts * powerFactor);
    case 'three':
      if (!_validPF(powerFactor)) return null;
      return wattsIn / (SQRT3 * volts * powerFactor);
    default:
      return null;
  }
}


/* ============================================================
   18. WATTS TO KVA  (reverse of vaToWatts, kVA scale)
   kVA = W ÷ (PF × 1,000)
   ============================================================ */

/**
 * Convert real power (watts) to apparent power (kVA).
 *
 * kVA = W ÷ (PF × 1,000)
 *
 * @param {number} watts       - Real power in watts (W > 0)
 * @param {number} powerFactor - Power factor, 0 < PF ≤ 1
 * @returns {number|null}
 */
function wattsToKva(watts, powerFactor) {
  if (!_allPositive(watts)) return null;
  if (!_validPF(powerFactor)) return null;
  return watts / (powerFactor * 1000);
}


/* ============================================================
   19. AMPS TO KVA  (reverse of kvaToAmps)
   Single-phase: kVA = (A × V) ÷ 1,000
   Three-phase : kVA = (√3 × A × V) ÷ 1,000   (line-to-line)
   ============================================================ */

/**
 * Convert current (amps) to apparent power (kVA). Apparent power ignores
 * power factor, so no PF is needed.
 *
 * @param {number} amps            - Current in amps (A > 0)
 * @param {number} volts           - Voltage in volts (V > 0)
 * @param {string} [phase='single']- 'single' | 'three'
 * @returns {number|null}
 */
function ampsToKva(amps, volts, phase = 'single') {
  if (!_allPositive(amps, volts)) return null;
  switch (phase) {
    case 'single':
      return (amps * volts) / 1000;
    case 'three':
      return (SQRT3 * amps * volts) / 1000;
    default:
      return null;
  }
}


/* ============================================================
   FORMAT HELPER
   ============================================================ */

/**
 * Format a numeric result for display.
 * - Rounds to `decimals` decimal places.
 * - Adds comma thousand separators to the integer part.
 * - Returns "—" for null / non-finite values.
 *
 * @param {number|null} value
 * @param {number}      [decimals=4]
 * @returns {string}
 *
 * @example
 * formatResult(1234.5678)     // "1,234.5678"
 * formatResult(0.003456)      // "0.0035"
 * formatResult(null)          // "—"
 */
function formatResult(value, decimals = 4) {
  if (value === null || !Number.isFinite(value)) return '\u2014'; // em dash

  // Round to `decimals` decimal places
  const rounded = Number(value.toFixed(decimals));

  // Split into integer and decimal parts
  const [intPart, decPart] = rounded.toFixed(decimals).split('.');

  // Add comma separators to the integer part
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Re-join; omit trailing decimal if decimals === 0
  return decimals === 0 ? intFormatted : `${intFormatted}.${decPart}`;
}


/* ============================================================
   PUBLIC API
   ============================================================ */

const Converters = {
  // Original functions
  wattsToAmps,
  ampsToWatts,
  kvaToKw,
  kwToKva,
  kwhToWatts,
  kvaToAmps,
  mahToWh,
  // New functions (added across Prompts 1–6)
  kwToAmps,
  wattsToVolts,
  whToMah,
  ampsToVolts,
  wattsToKwh,
  vaToWatts,
  vaToKw,
  // Phase 6 additions
  ampsToKw,
  voltsToAmps,
  voltsToWatts,
  whToKwh,
  ahToWh,
  mahToAh,
  joulesToWatts,
  // Phase 8 additions (motor / apparent power)
  hpToKw,
  kwToHp,
  hpToAmps,
  wattsToKva,
  ampsToKva,
  // Formatter
  formatResult,
};

// Browser global
if (typeof window !== 'undefined') {
  window.Converters = Converters;
}

// Node.js / CommonJS export
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Converters;
}


/* ============================================================
   SELF-TEST  (runs only in Node.js / non-browser environments)
   Usage:  node assets/js/converters.js
   ============================================================ */
if (typeof window === 'undefined') {

  const PASS = '\x1b[32m✓ PASS\x1b[0m';
  const FAIL = '\x1b[31m✗ FAIL\x1b[0m';

  /**
   * Compares two numbers within a tolerance.
   * @param {number|null} actual
   * @param {number|null} expected
   * @param {number} [tol=1e-9]
   */
  function assert(label, actual, expected, tol = 1e-9) {
    let ok;
    if (expected === null) {
      ok = actual === null;
    } else {
      ok = actual !== null && Math.abs(actual - expected) <= tol;
    }
    const tag = ok ? PASS : FAIL;
    console.log(`${tag}  ${label}`);
    if (!ok) {
      console.log(`       expected: ${expected}`);
      console.log(`       actual  : ${actual}`);
    }
  }

  console.log('\n=== converters.js self-test ===\n');

  // ----------------------------------------------------------
  // 1. wattsToAmps
  // ----------------------------------------------------------
  console.log('--- wattsToAmps ---');
  // DC: 1000 W / 120 V = 8.3333…
  assert('DC 1000 W, 120 V',
    wattsToAmps(1000, 120, 1, 'dc'),
    1000 / 120);

  // AC single-phase: 500 W / (240 V × 0.9 PF) = 2.3148…
  assert('AC single 500 W, 240 V, PF 0.9',
    wattsToAmps(500, 240, 0.9, 'single'),
    500 / (240 * 0.9));

  // AC three-phase: 3000 W / (400 V × 0.85 × √3) = 5.1026…
  assert('AC three 3000 W, 400 V, PF 0.85',
    wattsToAmps(3000, 400, 0.85, 'three'),
    3000 / (400 * 0.85 * SQRT3));

  // Edge: zero watts → null
  assert('Edge: zero watts → null', wattsToAmps(0, 120), null);

  // ----------------------------------------------------------
  // 2. kvaToKw
  // ----------------------------------------------------------
  console.log('\n--- kvaToKw ---');
  // 10 kVA × 0.8 PF = 8 kW
  assert('10 kVA, PF 0.8', kvaToKw(10, 0.8), 8);

  // 5 kVA × 1.0 PF = 5 kW
  assert('5 kVA, PF 1.0', kvaToKw(5, 1.0), 5);

  // 2.5 kVA × 0.95 PF = 2.375 kW
  assert('2.5 kVA, PF 0.95', kvaToKw(2.5, 0.95), 2.5 * 0.95);

  // Edge: invalid PF > 1 → null
  assert('Edge: PF 1.2 → null', kvaToKw(10, 1.2), null);

  // ----------------------------------------------------------
  // 3. kwhToWatts
  // ----------------------------------------------------------
  console.log('\n--- kwhToWatts ---');
  // 1 kWh / 1 h = 1000 W
  assert('1 kWh over 1 h', kwhToWatts(1, 1), 1000);

  // 5 kWh / 2 h = 2500 W
  assert('5 kWh over 2 h', kwhToWatts(5, 2), 2500);

  // 0.5 kWh / 0.25 h = 2000 W
  assert('0.5 kWh over 0.25 h', kwhToWatts(0.5, 0.25), 2000);

  // Edge: zero hours → null
  assert('Edge: zero hours → null', kwhToWatts(1, 0), null);

  // ----------------------------------------------------------
  // 4. kvaToAmps
  // ----------------------------------------------------------
  console.log('\n--- kvaToAmps ---');
  // Single-phase: (10 × 1000) / 230 = 43.4782…
  assert('Single 10 kVA, 230 V',
    kvaToAmps(10, 230, 'single'),
    10000 / 230);

  // Three-phase: (15 × 1000) / (400 × √3) = 21.6506…
  assert('Three 15 kVA, 400 V',
    kvaToAmps(15, 400, 'three'),
    15000 / (400 * SQRT3));

  // Single-phase: (1 × 1000) / 120 = 8.3333…
  assert('Single 1 kVA, 120 V',
    kvaToAmps(1, 120, 'single'),
    1000 / 120);

  // Edge: negative volts → null
  assert('Edge: negative volts → null', kvaToAmps(10, -230), null);

  // ----------------------------------------------------------
  // 5. mahToWh
  // ----------------------------------------------------------
  console.log('\n--- mahToWh ---');
  // 3000 mAh × 3.7 V / 1000 = 11.1 Wh
  assert('3000 mAh, 3.7 V', mahToWh(3000, 3.7), (3000 * 3.7) / 1000);

  // 10000 mAh × 5 V / 1000 = 50 Wh
  assert('10000 mAh, 5 V', mahToWh(10000, 5), 50);

  // 500 mAh × 12 V / 1000 = 6 Wh
  assert('500 mAh, 12 V', mahToWh(500, 12), 6);

  // Edge: zero mAh → null
  assert('Edge: zero mAh → null', mahToWh(0, 3.7), null);

  // ----------------------------------------------------------
  // 6. ampsToWatts
  // ----------------------------------------------------------
  console.log('\n--- ampsToWatts ---');
  // DC: 10 A × 12 V = 120 W
  assert('DC 10 A, 12 V', ampsToWatts(10, 12, 1, 'dc'), 120);

  // AC single: 5 A × 240 V × 0.9 = 1080 W
  assert('AC single 5 A, 240 V, PF 0.9',
    ampsToWatts(5, 240, 0.9, 'single'),
    5 * 240 * 0.9);

  // AC three: 20 A × 400 V × 0.85 × √3 = 11,821.…
  assert('AC three 20 A, 400 V, PF 0.85',
    ampsToWatts(20, 400, 0.85, 'three'),
    20 * 400 * 0.85 * SQRT3);

  // Edge: zero amps → null
  assert('Edge: zero amps → null', ampsToWatts(0, 12), null);

  // ----------------------------------------------------------
  // 7. kwToKva
  // ----------------------------------------------------------
  console.log('\n--- kwToKva ---');
  // 8 kW / 0.8 PF = 10 kVA
  assert('8 kW, PF 0.8', kwToKva(8, 0.8), 10);

  // 5 kW / 1.0 PF = 5 kVA
  assert('5 kW, PF 1.0', kwToKva(5, 1.0), 5);

  // 2.375 kW / 0.95 PF = 2.5 kVA
  assert('2.375 kW, PF 0.95', kwToKva(2.375, 0.95), 2.375 / 0.95);

  // Edge: PF = 0 → null
  assert('Edge: PF 0 → null', kwToKva(5, 0), null);

  // ----------------------------------------------------------
  // 9. ampsToKw
  // ----------------------------------------------------------
  console.log('\n--- ampsToKw ---');
  // DC: 30 A × 240 V / 1000 = 7.2 kW
  assert('DC 30 A, 240 V', ampsToKw(30, 240, 1, 'dc'), 7.2);
  // AC single: 20 A × 240 V × 0.9 / 1000 = 4.32 kW
  assert('AC single 20 A, 240 V, PF 0.9', ampsToKw(20, 240, 0.9, 'single'), (20 * 240 * 0.9) / 1000);
  // AC three: √3 × 20 A × 400 V × 0.85 / 1000
  assert('AC three 20 A, 400 V, PF 0.85', ampsToKw(20, 400, 0.85, 'three'), (SQRT3 * 20 * 400 * 0.85) / 1000);
  // Round-trip against kwToAmps: 10 kW → A → kW
  assert('Round-trip kwToAmps 10 kW', ampsToKw(kwToAmps(10, 400, 0.85, 'three-ll'), 400, 0.85, 'three'), 10);
  // Edge: zero amps → null
  assert('Edge: zero amps → null', ampsToKw(0, 240), null);

  // ----------------------------------------------------------
  // 10. voltsToAmps
  // ----------------------------------------------------------
  console.log('\n--- voltsToAmps ---');
  // Power DC: 60 W / 120 V = 0.5 A
  assert('Power DC 60 W, 120 V', voltsToAmps(120, 60, 'power-dc'), 0.5);
  // Power AC: 1000 W / (230 V × 0.9) = 4.8309…
  assert('Power AC 1000 W, 230 V, PF 0.9', voltsToAmps(230, 1000, 'power-ac', 0.9), 1000 / (230 * 0.9));
  // Resistance: 12 V / 4 Ω = 3 A
  assert('Resistance 12 V, 4 Ω', voltsToAmps(12, 4, 'resistance'), 3);
  // Edge: zero volts → null
  assert('Edge: zero volts → null', voltsToAmps(0, 60, 'power-dc'), null);

  // ----------------------------------------------------------
  // 11. voltsToWatts
  // ----------------------------------------------------------
  console.log('\n--- voltsToWatts ---');
  // DC: 120 V × 5 A = 600 W
  assert('DC 120 V, 5 A', voltsToWatts(120, 5, 1, 'dc'), 600);
  // AC single: 240 V × 10 A × 0.85 = 2040 W
  assert('AC single 240 V, 10 A, PF 0.85', voltsToWatts(240, 10, 0.85, 'single'), 240 * 10 * 0.85);
  // AC three: √3 × 400 V × 15 A × 0.9
  assert('AC three 400 V, 15 A, PF 0.9', voltsToWatts(400, 15, 0.9, 'three'), SQRT3 * 400 * 15 * 0.9);
  // Edge: zero amps → null
  assert('Edge: zero amps → null', voltsToWatts(120, 0), null);

  // ----------------------------------------------------------
  // 12. whToKwh
  // ----------------------------------------------------------
  console.log('\n--- whToKwh ---');
  assert('500 Wh → 0.5 kWh', whToKwh(500), 0.5);
  assert('2400 Wh → 2.4 kWh', whToKwh(2400), 2.4);
  assert('Edge: zero Wh → null', whToKwh(0), null);

  // ----------------------------------------------------------
  // 13. ahToWh
  // ----------------------------------------------------------
  console.log('\n--- ahToWh ---');
  assert('100 Ah × 12 V → 1200 Wh', ahToWh(100, 12), 1200);
  assert('2.5 Ah × 3.7 V → 9.25 Wh', ahToWh(2.5, 3.7), 9.25);
  assert('Edge: zero volts → null', ahToWh(100, 0), null);

  // ----------------------------------------------------------
  // 14. mahToAh
  // ----------------------------------------------------------
  console.log('\n--- mahToAh ---');
  assert('20000 mAh → 20 Ah', mahToAh(20000), 20);
  assert('500 mAh → 0.5 Ah', mahToAh(500), 0.5);
  assert('Edge: zero mAh → null', mahToAh(0), null);

  // ----------------------------------------------------------
  // 15. joulesToWatts
  // ----------------------------------------------------------
  console.log('\n--- joulesToWatts ---');
  assert('3600 J over 60 s → 60 W', joulesToWatts(3600, 60), 60);
  assert('30000 J over 10 s → 3000 W', joulesToWatts(30000, 10), 3000);
  assert('Edge: zero seconds → null', joulesToWatts(3600, 0), null);

  // ----------------------------------------------------------
  // 16. hpToKw / kwToHp
  // ----------------------------------------------------------
  console.log('\n--- hpToKw / kwToHp ---');
  assert('5 hp → 3.7285 kW', hpToKw(5), 5 * 745.7 / 1000);
  assert('1 hp → 0.7457 kW', hpToKw(1), 0.7457);
  assert('7.5 kW → hp', kwToHp(7.5), 7500 / 745.7);
  assert('Round-trip 10 hp', kwToHp(hpToKw(10)), 10);
  assert('Edge: zero hp → null', hpToKw(0), null);

  // ----------------------------------------------------------
  // 17. hpToAmps (motor FLA)
  // ----------------------------------------------------------
  console.log('\n--- hpToAmps ---');
  // Single-phase: 5 hp, 230 V, PF 0.85, eff 0.9
  assert('Single 5 hp, 230 V, PF 0.85, eff 0.9',
    hpToAmps(5, 230, 0.85, 0.9, 'single'),
    (5 * 745.7 / 0.9) / (230 * 0.85));
  // Three-phase: 10 hp, 460 V, PF 0.85, eff 0.9
  assert('Three 10 hp, 460 V, PF 0.85, eff 0.9',
    hpToAmps(10, 460, 0.85, 0.9, 'three'),
    (10 * 745.7 / 0.9) / (SQRT3 * 460 * 0.85));
  // DC: 2 hp, 90 V, eff 0.85
  assert('DC 2 hp, 90 V, eff 0.85',
    hpToAmps(2, 90, 1, 0.85, 'dc'),
    (2 * 745.7 / 0.85) / 90);
  // Edge: efficiency > 1 → null
  assert('Edge: eff 1.1 → null', hpToAmps(5, 230, 0.85, 1.1, 'single'), null);
  // Edge: zero volts → null
  assert('Edge: zero volts → null', hpToAmps(5, 0, 0.85, 0.9, 'single'), null);

  // ----------------------------------------------------------
  // 18. wattsToKva
  // ----------------------------------------------------------
  console.log('\n--- wattsToKva ---');
  assert('1500 W, PF 0.8 → 1.875 kVA', wattsToKva(1500, 0.8), 1.875);
  assert('800 W, PF 1.0 → 0.8 kVA', wattsToKva(800, 1.0), 0.8);
  // Round-trip against vaToKw: W → kVA → (×PF) kW
  assert('Round-trip 2000 W', wattsToKva(2000, 0.8) * 0.8 * 1000, 2000);
  assert('Edge: PF 0 → null', wattsToKva(1500, 0), null);

  // ----------------------------------------------------------
  // 19. ampsToKva
  // ----------------------------------------------------------
  console.log('\n--- ampsToKva ---');
  assert('Single 40 A, 230 V → 9.2 kVA', ampsToKva(40, 230, 'single'), 9.2);
  assert('Three 100 A, 400 V', ampsToKva(100, 400, 'three'), (SQRT3 * 100 * 400) / 1000);
  // Round-trip against kvaToAmps: kVA → A → kVA
  assert('Round-trip 15 kVA three-phase',
    ampsToKva(kvaToAmps(15, 400, 'three'), 400, 'three'), 15);
  assert('Edge: zero amps → null', ampsToKva(0, 230, 'single'), null);

  // ----------------------------------------------------------
  // 8. formatResult
  // ----------------------------------------------------------
  console.log('\n--- formatResult ---');

  function assertStr(label, actual, expected) {
    const ok = actual === expected;
    console.log(`${ok ? PASS : FAIL}  ${label}`);
    if (!ok) {
      console.log(`       expected: "${expected}"`);
      console.log(`       actual  : "${actual}"`);
    }
  }

  assertStr('1234.5678 → "1,234.5678"',  formatResult(1234.5678),       '1,234.5678');
  assertStr('0.003456 → "0.0035"',        formatResult(0.003456),        '0.0035');
  assertStr('1000000 → "1,000,000.0000"', formatResult(1000000),         '1,000,000.0000');
  assertStr('null → "—"',                 formatResult(null),            '\u2014');
  assertStr('decimals=2: 99.999 → "100.00"', formatResult(99.999, 2),   '100.00');
  assertStr('decimals=0: 1234.9 → "1,235"',  formatResult(1234.9, 0),   '1,235');

  console.log('\n=== self-test complete ===\n');
}
