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
