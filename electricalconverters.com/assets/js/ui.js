/**
 * ui.js
 * DOM interaction and real-time input binding for electricalconverters.com
 *
 * Depends on: converters.js (must be loaded first)
 *
 * Rules:
 *  - All DOM manipulation lives here, NOT in converters.js
 *  - Each converter page initialises its own binding via a page-specific init function
 *  - Real-time updates are driven by `input` events (no submit required)
 */

/* ------------------------------------------------------------------ */
/*  Shared Utilities                                                    */
/* ------------------------------------------------------------------ */

/**
 * Safely parse a float from an input element's value.
 * Returns NaN if the field is empty or non-numeric.
 * @param {string} elementId
 * @returns {number}
 */
function getInputValue(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return NaN;
  return parseFloat(el.value);
}

/**
 * Write a formatted result into a DOM element.
 * Shows "—" when the result is not a finite number.
 * @param {string}  elementId
 * @param {number}  value
 * @param {number}  [decimals=4]
 * @param {string}  [unit='']
 */
function setOutputValue(elementId, value, decimals = 4, unit = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = Number.isFinite(value)
    ? `${value.toFixed(decimals)} ${unit}`.trim()
    : '—';
}

/* ------------------------------------------------------------------ */
/*  Page Initialisers  (called at bottom of each converter page)       */
/* ------------------------------------------------------------------ */

/**
 * Initialise the Watts → Amps converter page.
 * Expected input IDs:  #input-watts, #input-volts
 * Expected output IDs: #output-amps
 */
function initWattsToAmps() {
  // DOM binding logic to be implemented
}

/**
 * Initialise the kVA → kW converter page.
 * Expected input IDs:  #input-kva, #input-pf
 * Expected output IDs: #output-kw
 */
function initKvaToKw() {
  // DOM binding logic to be implemented
}

/**
 * Initialise the kWh → Watts converter page.
 * Expected input IDs:  #input-kwh, #input-hours
 * Expected output IDs: #output-watts
 */
function initKwhToWatts() {
  // DOM binding logic to be implemented
}

/**
 * Initialise the kVA → Amps converter page.
 * Expected input IDs:  #input-kva, #input-volts, #input-phase
 * Expected output IDs: #output-amps
 */
function initKvaToAmps() {
  // DOM binding logic to be implemented
}

/**
 * Initialise the mAh → Wh converter page.
 * Expected input IDs:  #input-mah, #input-volts
 * Expected output IDs: #output-wh
 */
function initMahToWh() {
  // DOM binding logic to be implemented
}
