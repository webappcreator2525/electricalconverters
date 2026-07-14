/**
 * related.js — electricalconverters.com
 * SINGLE SOURCE OF TRUTH for the Phase 3 hub-and-spoke internal-linking cluster map.
 *
 * Bu dosya sadece VERİdir. Sayfalara statik "Related conversions" bloklarını ve
 * breadcrumb'ları basan build script'i (tools/build-related.mjs) bu haritayı okur.
 * Yeni bir sayfa (Part B) eklemek için: buraya girişini ekle, `exists: true` yap,
 * doğru cluster'a bağla ve build script'ini tekrar çalıştır — linkler her yere yayılır.
 *
 * exists:false olan sayfalar dokümante edilir ama HENÜZ link üretmez (kırık link olmaz).
 */
(function (root, factory) {
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (typeof window !== 'undefined') window.RELATED = data;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── Cluster tanımları ─────────────────────────────────────────
   * hub     = cluster'ın ana (pillar) sayfası
   * bridges = komşu cluster'lara giden bağlam linkleri (hub key'leri) */
  var CLUSTERS = {
    'power-current': {
      name: 'Power ↔ Current',
      desc: 'Convert between watts, kilowatts, amps and volts for DC, single-phase and three-phase circuits.',
      hub: 'watts-to-amps',
      bridges: ['kva-to-kw', 'kwh-to-watts']
    },
    'apparent': {
      name: 'Apparent Power (kVA & VA)',
      desc: 'Work with apparent power, real power and power factor for generators, UPS and transformers.',
      hub: 'kva-to-kw',
      bridges: ['watts-to-amps', 'kwh-to-watts']
    },
    'energy': {
      name: 'Energy & Running Cost (kWh)',
      desc: 'Turn power and time into energy used and estimate what an appliance costs to run.',
      hub: 'kwh-to-watts',
      bridges: ['watts-to-amps', 'mah-to-wh']
    },
    'battery': {
      name: 'Battery Capacity',
      desc: 'Compare batteries and power banks by converting between mAh and watt-hours.',
      hub: 'mah-to-wh',
      bridges: ['kwh-to-watts', 'watts-to-amps']
    },
    'motor': {
      name: 'Motors & Horsepower',
      desc: 'Size motor circuits and convert between horsepower, kilowatts and amps.',
      hub: 'hp-to-amps',
      bridges: ['kva-to-kw']
    },
    'safety': {
      name: 'Wiring & Safety Sizing',
      desc: 'After finding amps, size wire, breakers and check voltage drop to code.',
      hub: 'wire-gauge',
      bridges: ['watts-to-amps']
    }
  };

  /* ── Sayfa (converter) tanımları ───────────────────────────────
   * anchor = betimleyici (descriptive) link metni — asla "click here" / kısaltma değil
   * blurb  = linkin altında görünen tek satır açıklama
   * learn  = "how it works" tarafından yukarı bağlanan learn makaleleri (LEARN key'leri) */
  var PAGES = {
    /* Cluster 1 — Power ↔ Current */
    'watts-to-amps': { href: '/watts-to-amps/', label: 'Watts to Amps', anchor: 'Convert watts to amps', blurb: 'Power to current for DC, single- and three-phase circuits.', clusters: ['power-current'], learn: ['watts-vs-amps'], exists: true },
    'amps-to-watts': { href: '/amps-to-watts/', label: 'Amps to Watts', anchor: 'Convert the current back with amps to watts', blurb: 'Turn a measured current into power in watts.', clusters: ['power-current'], learn: ['watts-vs-amps'], exists: true },
    'kw-to-amps': { href: '/kw-to-amps/', label: 'kW to Amps', anchor: 'Size larger loads with the kW to amps calculator', blurb: 'Kilowatts to current for single- and three-phase.', clusters: ['power-current', 'motor'], learn: ['watts-vs-amps'], exists: true },
    'watts-to-volts': { href: '/watts-to-volts/', label: 'Watts to Volts', anchor: 'Find voltage with watts to volts', blurb: 'Solve for voltage from power and current.', clusters: ['power-current'], learn: ['ohms-law'], exists: true },
    'amps-to-volts': { href: '/amps-to-volts/', label: 'Amps to Volts', anchor: "Apply Ohm's law with amps to volts", blurb: 'Voltage from current and resistance (V = I × R).', clusters: ['power-current'], learn: ['ohms-law'], exists: true },
    'amps-to-kw': { href: '/amps-to-kw/', label: 'Amps to kW', anchor: 'Convert amps to kilowatts', blurb: 'Current to real power in kilowatts.', clusters: ['power-current'], learn: ['watts-vs-amps'], exists: true },
    'volts-to-amps': { href: '/volts-to-amps/', label: 'Volts to Amps', anchor: "Find current with volts to amps", blurb: 'Current from voltage, power or resistance.', clusters: ['power-current'], learn: ['ohms-law'], exists: true },
    'volts-to-watts': { href: '/volts-to-watts/', label: 'Volts to Watts', anchor: 'Convert volts to watts', blurb: 'Power from voltage and current.', clusters: ['power-current'], learn: ['ohms-law'], exists: true },

    /* Cluster 4 — Apparent power */
    'kva-to-kw': { href: '/kva-to-kw/', label: 'kVA to kW', anchor: 'Account for power factor with kVA to kW', blurb: 'Apparent power to real power using power factor.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },
    'kva-to-amps': { href: '/kva-to-amps/', label: 'kVA to Amps', anchor: 'Get amps straight from kVA', blurb: 'Line current directly from apparent power.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },
    'va-to-watts': { href: '/va-to-watts/', label: 'VA to Watts', anchor: 'Convert VA to watts', blurb: 'Volt-amps to real power in watts.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },
    'watts-to-kva': { href: '/watts-to-kva/', label: 'Watts to kVA', anchor: 'Convert watts to kVA', blurb: 'Real power to apparent power.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },
    'kw-to-kva': { href: '/kw-to-kva/', label: 'kW to kVA', anchor: 'Convert kW to kVA', blurb: 'Real power to apparent power via power factor.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },
    'amps-to-kva': { href: '/amps-to-kva/', label: 'Amps to kVA', anchor: 'Convert amps to kVA', blurb: 'Apparent power from line current.', clusters: ['apparent'], learn: ['watts-vs-amps'], exists: true },

    /* Cluster 2 — Energy */
    'kwh-to-watts': { href: '/kwh-to-watts/', label: 'kWh to Watts', anchor: 'Convert energy to power with kWh to watts', blurb: 'Average power draw from an energy reading.', clusters: ['energy'], learn: ['watts-vs-amps'], exists: true },
    'watts-to-kwh': { href: '/watts-to-kwh/', label: 'Watts to kWh', anchor: 'Estimate running cost by converting watts to kWh', blurb: 'Energy use and electricity cost over time.', clusters: ['energy'], learn: ['watts-vs-amps'], exists: true },
    'wh-to-kwh': { href: '/wh-to-kwh/', label: 'Wh to kWh', anchor: 'Convert watt-hours to kilowatt-hours', blurb: 'Scale watt-hours up to billed kWh.', clusters: ['energy'], learn: ['watts-vs-amps'], exists: true },
    'joules-to-watts': { href: '/joules-to-watts/', label: 'Joules to Watts', anchor: 'Convert joules to watts', blurb: 'Energy in joules to average power.', clusters: ['energy'], learn: ['watts-vs-amps'], exists: true },

    /* Cluster 3 — Battery */
    'mah-to-wh': { href: '/mah-to-wh/', label: 'mAh to Wh', anchor: 'Compare power banks by converting mAh to Wh', blurb: 'Battery capacity from mAh and voltage.', clusters: ['battery'], learn: ['watts-vs-amps'], exists: true },
    'wh-to-mah': { href: '/wh-to-mah/', label: 'Wh to mAh', anchor: 'Convert watt-hours back to mAh', blurb: 'Battery capacity from watt-hours and voltage.', clusters: ['battery'], learn: ['watts-vs-amps'], exists: true },
    'ah-to-wh': { href: '/ah-to-wh/', label: 'Ah to Wh', anchor: 'Convert amp-hours to watt-hours', blurb: 'Battery capacity from amp-hours and voltage.', clusters: ['battery'], learn: ['watts-vs-amps'], exists: true },
    'mah-to-ah': { href: '/mah-to-ah/', label: 'mAh to Ah', anchor: 'Convert mAh to Ah', blurb: 'Milliamp-hours to amp-hours.', clusters: ['battery'], learn: ['watts-vs-amps'], exists: true },

    /* Cluster 5 — Motor / HP (Part B) */
    'hp-to-amps': { href: '/hp-to-amps/', label: 'HP to Amps', anchor: 'Size a motor circuit with hp to amps', blurb: 'Motor horsepower to full-load current.', clusters: ['motor'], learn: ['watts-vs-amps'], exists: true },
    'hp-to-kw': { href: '/hp-to-kw/', label: 'HP to kW', anchor: 'Convert horsepower to kilowatts', blurb: 'Motor rating from HP to kW.', clusters: ['motor'], learn: ['watts-vs-amps'], exists: true },
    'kw-to-hp': { href: '/kw-to-hp/', label: 'kW to HP', anchor: 'Convert kilowatts to horsepower', blurb: 'Motor rating from kW to HP.', clusters: ['motor'], learn: ['watts-vs-amps'], exists: true },

    /* Cluster 6 — Safety / sizing (Part B) */
    'wire-gauge': { href: '/wire-gauge/', label: 'Wire Gauge', anchor: 'Size your wire after finding amps', blurb: 'Pick AWG wire gauge from current and length.', clusters: ['safety'], learn: ['watts-vs-amps'], exists: false },
    'breaker-size': { href: '/breaker-size/', label: 'Breaker Size', anchor: 'Choose a breaker size for your load', blurb: 'Breaker rating from continuous load current.', clusters: ['safety'], learn: ['watts-vs-amps'], exists: false },
    'voltage-drop': { href: '/voltage-drop/', label: 'Voltage Drop', anchor: 'Check voltage drop over a wire run', blurb: 'Voltage lost along a conductor.', clusters: ['safety'], learn: ['ohms-law'], exists: false },
    'three-phase-power': { href: '/three-phase-power/', label: 'Three-Phase Power', anchor: 'Work out three-phase power', blurb: 'Real power in balanced three-phase systems.', clusters: ['safety'], learn: ['watts-vs-amps'], exists: false }
  };

  /* ── Learn makaleleri ──────────────────────────────────────────
   * extra = makaleye özgü ek converter linkleri (PAGE key'leri) */
  var LEARN = {
    'ohms-law': { href: '/learn/ohms-law/', label: "Ohm's Law", anchor: "Ohm's Law explained (V = I × R)", blurb: 'How voltage, current and resistance relate.', extra: ['amps-to-volts', 'watts-to-volts'] },
    'watts-vs-amps': { href: '/learn/watts-vs-amps/', label: 'Watts vs Amps', anchor: 'Watts vs Amps: the difference explained', blurb: 'Why power and current are not the same thing.', extra: ['amps-to-watts'] }
  };

  /* ── Specific-value (spoke) sayfaları ──────────────────────────
   * parent hub + değer listesi; child href/label/anchor bunlardan türetilir */
  var CHILDREN = {
    'watts-to-amps': { unitLabel: 'W', phrase: 'watts to amps', values: [100, 250, 500, 750, 800, 1000, 1200, 1500, 2000, 3000, 5000] },
    'amps-to-watts': { unitLabel: 'A', phrase: 'amps to watts', values: [15, 20, 30, 40, 50] },
    'kw-to-amps': { unitLabel: 'kW', phrase: 'kW to amps', values: [1, 2, 3, 5, 7.5, 10, 11, 15, 22] }
  };

  return { CLUSTERS: CLUSTERS, PAGES: PAGES, LEARN: LEARN, CHILDREN: CHILDREN };
});
