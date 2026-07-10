/**
 * calculators.js — electricalconverters.com
 *
 * One cached, deferred file for every calculator's DOM wiring.
 * Pure math lives in converters.js (window.Converters); this file only
 * reads inputs, calls Converters.*, and writes formatted output.
 *
 * Dispatch: a page declares <body data-calc="TYPE">. On load we call the
 * matching init function. Element IDs match the existing page markup.
 */
(function () {
  'use strict';

  var C = window.Converters;
  if (!C) return;
  var fmt = C.formatResult;

  /* ── DOM helpers ──────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function num(el) { return el ? parseFloat(el.value) : NaN; }
  function tick(id) { if (window.animateResultTick) window.animateResultTick(id); }

  /**
   * Write a single readout. `els` = {display, value, unit, note}.
   * Any element may be absent (hub pages omit unit/note).
   */
  function render(els, result, formatted, noteText, live) {
    var ok = result !== null && result !== undefined && isFinite(result);
    if (els.display) {
      els.display.classList.toggle('invalid', !ok);
      els.display.classList.toggle('has-result', ok);
    }
    if (els.value) {
      els.value.textContent = ok ? formatted : '—';
      els.value.classList.toggle('empty', !ok);
      if (ok) tick(els.value.id);
    }
    if (els.unit) els.unit.style.display = ok ? '' : 'none';
    if (els.note) {
      els.note.classList.toggle('live', ok);
      els.note.textContent = noteText;
    }
  }

  function togglePF(pfWrapper, inputPF, isAC) {
    if (pfWrapper) {
      pfWrapper.classList.toggle('visible', isAC);
      pfWrapper.setAttribute('aria-hidden', String(!isAC));
    }
    if (inputPF) inputPF.disabled = !isAC;
  }

  /* Wire tab-style buttons that mirror a hidden <select> (id="input-phase").
     Tab id "tab-single" → phase "single", etc. */
  function wireTabs(select, tabIds, onChange) {
    tabIds.forEach(function (id) {
      var btn = $(id);
      if (!btn) return;
      var phase = id.replace('tab-', '');
      btn.addEventListener('click', function () {
        if (select) select.value = phase;
        onChange();
      });
    });
  }
  function reflectTabs(tabIds, phase) {
    tabIds.forEach(function (id) {
      var btn = $(id);
      if (btn) btn.classList.toggle('active', id.replace('tab-', '') === phase);
    });
  }

  /* ── watts-to-amps  (hub + fixed-wattage children) ────────── */
  function wattsToAmps() {
    var w = $('input-watts'), v = $('input-volts'), ph = $('input-phase'),
        pf = $('input-pf'), pfw = $('pf-wrapper');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!w || !v || !ph) return;
    var F = { dc: 'A = W ÷ V', single: 'A = W ÷ (V × PF)',
              three: 'A = W ÷ (V × PF × √3)' };
    function calc() {
      var phase = ph.value;
      togglePF(pfw, pf, phase !== 'dc');
      var r = C.wattsToAmps(num(w), num(v), num(pf), phase);
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: ' + F[phase] : F[phase] + '  →  ' + fmt(r, 4) + ' A',
        true);
    }
    [w, v, pf].forEach(function (el) { el && el.addEventListener('input', calc); });
    ph.addEventListener('change', calc);
    calc();
  }

  /* ── amps-to-watts ────────────────────────────────────────── */
  function ampsToWatts() {
    var a = $('input-watts') /* legacy id reused for amps field */,
        v = $('input-volts'), ph = $('input-phase'), pf = $('input-pf'),
        pfw = $('pf-wrapper');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!a || !v || !ph) return;
    var F = { dc: 'W = A × V', single: 'W = A × V × PF',
              three: 'W = A × V × PF × √3' };
    function calc() {
      var phase = ph.value;
      togglePF(pfw, pf, phase !== 'dc');
      var r = C.ampsToWatts(num(a), num(v), num(pf), phase);
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: ' + F[phase] : F[phase] + '  →  ' + fmt(r, 4) + ' W',
        true);
    }
    [a, v, pf].forEach(function (el) { el && el.addEventListener('input', calc); });
    ph.addEventListener('change', calc);
    calc();
  }

  /* ── amps-to-volts (Ohm's law) ────────────────────────────── */
  function ampsToVolts() {
    var a = $('input-amps'), o = $('input-ohms');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!a || !o) return;
    function calc() {
      var r = C.ampsToVolts(num(a), num(o));
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: V = A × Ω'
                   : 'V = ' + num(a) + ' × ' + num(o) + ' = ' + fmt(r, 4) + ' V', true);
    }
    a.addEventListener('input', calc); o.addEventListener('input', calc);
    calc();
  }

  /* ── kva-to-amps (single/three, tab + select) ─────────────── */
  function kvaToAmps() {
    var k = $('input-kva'), v = $('input-volts'), ph = $('input-phase');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!k || !v || !ph) return;
    var tabs = ['tab-single', 'tab-three'];
    var F = { single: 'A = (kVA × 1,000) ÷ V',
              three: 'A = (kVA × 1,000) ÷ (V × √3)' };
    function calc() {
      var phase = ph.value;
      reflectTabs(tabs, phase);
      var r = C.kvaToAmps(num(k), num(v), phase);
      var denom = phase === 'three'
        ? '(' + num(v) + ' × 1.7321)' : '' + num(v);
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: ' + F[phase]
          : F[phase] + '  →  (' + num(k) + ' × 1,000) ÷ ' + denom + ' = ' + fmt(r, 4) + ' A',
        true);
    }
    [k, v].forEach(function (el) { el.addEventListener('input', calc); });
    ph.addEventListener('change', calc);
    wireTabs(ph, tabs, calc);
    calc();
  }

  /* ── kva-to-kw ────────────────────────────────────────────── */
  function kvaToKw() {
    var k = $('input-kva'), pf = $('input-pf');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!k || !pf) return;
    function calc() {
      var r = C.kvaToKw(num(k), num(pf));
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: kW = kVA × PF'
          : 'kW = ' + num(k) + ' × ' + num(pf) + ' = ' + fmt(r, 4) + ' kW', true);
    }
    k.addEventListener('input', calc); pf.addEventListener('input', calc);
    calc();
  }

  /* ── kw-to-amps (hub: dc/single/three-ll/three-ln + tabs) ─── */
  function kwToAmps() {
    var k = $('input-kw'), v = $('input-volts'), ph = $('input-phase'),
        pf = $('input-pf'), pfw = $('pf-wrapper');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!k || !v || !ph) return;
    var tabs = ['tab-dc', 'tab-single', 'tab-three-ll', 'tab-three-ln'];
    var F = {
      'dc': 'A = (kW × 1,000) ÷ V',
      'single': 'A = (kW × 1,000) ÷ (V × PF)',
      'three-ll': 'A = (kW × 1,000) ÷ (√3 × V × PF)',
      'three-ln': 'A = (kW × 1,000) ÷ (3 × V × PF)'
    };
    function calc() {
      var phase = ph.value;
      togglePF(pfw, pf, phase !== 'dc');
      reflectTabs(tabs, phase);
      var r = C.kwToAmps(num(k), num(v), num(pf), phase);
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: ' + F[phase] : F[phase] + '  →  ' + fmt(r, 4) + ' A', true);
    }
    [k, v, pf].forEach(function (el) { el && el.addEventListener('input', calc); });
    ph.addEventListener('change', calc);
    wireTabs(ph, tabs, calc);
    calc();

    /* Reference-table single/three-phase switcher (inline onclick hook) */
    window.switchTable = function (tab) {
      var sp = $('table-sp'), tp = $('table-tp'),
          bsp = $('btn-tab-sp'), btp = $('btn-tab-tp');
      if (sp) sp.style.display = tab === 'sp' ? '' : 'none';
      if (tp) tp.style.display = tab === 'tp' ? '' : 'none';
      if (bsp) { bsp.classList.toggle('active', tab === 'sp'); bsp.setAttribute('aria-selected', String(tab === 'sp')); }
      if (btp) { btp.classList.toggle('active', tab === 'tp'); btp.setAttribute('aria-selected', String(tab === 'tp')); }
    };
  }

  /* ── kw-to-amps value children (select phase, no tabs) ────── */
  function kwToAmpsValue() {
    var k = $('input-kw'), v = $('input-volts'), ph = $('input-phase'),
        pf = $('input-pf'), pfw = $('pf-wrapper');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!k || !v || !ph) return;
    var F = {
      'dc': 'A = (kW × 1,000) ÷ V',
      'single': 'A = (kW × 1,000) ÷ (V × PF)',
      'three-ll': 'A = (kW × 1,000) ÷ (√3 × V × PF)',
      'three-ln': 'A = (kW × 1,000) ÷ (3 × V × PF)'
    };
    function calc() {
      var phase = ph.value;
      togglePF(pfw, pf, phase !== 'dc');
      var r = C.kwToAmps(num(k), num(v), num(pf), phase);
      render(els, r, fmt(r, 4),
        r === null ? 'Formula: ' + F[phase] : F[phase] + '  →  ' + fmt(r, 4) + ' A', true);
    }
    [k, v, pf].forEach(function (el) { el && el.addEventListener('input', calc); });
    ph.addEventListener('change', calc);
    calc();
  }

  /* ── kwh-to-watts (dual: W + kW) ──────────────────────────── */
  function kwhToWatts() {
    var kwh = $('input-kwh'), hrs = $('input-hours');
    var w = { display: $('result-watts'), value: $('result-value-w'), unit: $('result-unit-w') };
    var kw = { display: $('result-kw'), value: $('result-value-kw'), unit: $('result-unit-kw') };
    var note = $('formula-note');
    if (!kwh || !hrs) return;
    function calc() {
      var watts = C.kwhToWatts(num(kwh), num(hrs));
      if (watts === null) {
        render(w, null, '', ''); render(kw, null, '', '');
        if (note) { note.classList.remove('live'); note.textContent = 'Formula: W = (kWh × 1,000) ÷ hours'; }
      } else {
        var kwv = watts / 1000;
        render(w, watts, fmt(watts, 4)); render(kw, kwv, fmt(kwv, 4));
        if (note) { note.classList.add('live'); note.textContent =
          'W = (' + num(kwh) + ' × 1,000) ÷ ' + num(hrs) + '  →  ' + fmt(watts, 4) + ' W  |  ' + fmt(kwv, 4) + ' kW'; }
      }
    }
    kwh.addEventListener('input', calc); hrs.addEventListener('input', calc);
    calc();
  }

  /* ── watts-to-kwh (single kWh + cost estimator) ───────────── */
  function wattsToKwh() {
    var w = $('input-watts'), h = $('input-hours'), rate = $('input-rate');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    var costHours = $('cost-hours-label'), costDailyHours = $('cost-daily-hours-label'),
        costSession = $('cost-session'), costDaily = $('cost-daily'), costMonthly = $('cost-monthly');
    if (!w || !h) return;
    function calc() {
      var hv = num(h);
      if (costHours) costHours.textContent = !isNaN(hv) ? hv : '—';
      if (costDailyHours) costDailyHours.textContent = !isNaN(hv) ? hv : '—';
      var kwh = C.wattsToKwh(num(w), hv);
      render(els, kwh, fmt(kwh, 4),
        kwh === null ? 'Formula: kWh = (W × hours) ÷ 1,000'
          : 'kWh = (' + num(w) + ' × ' + hv + ') ÷ 1,000 = ' + fmt(kwh, 4) + ' kWh', true);
      var r = num(rate);
      if (kwh !== null && !isNaN(r) && r >= 0) {
        var cost = kwh * r;
        if (costSession) costSession.textContent = fmt(cost, 2);
        if (costDaily) costDaily.textContent = fmt(cost, 2);
        if (costMonthly) costMonthly.textContent = fmt(cost * 30, 2);
      } else {
        if (costSession) costSession.textContent = '—';
        if (costDaily) costDaily.textContent = '—';
        if (costMonthly) costMonthly.textContent = '—';
      }
    }
    [w, h, rate].forEach(function (el) { el && el.addEventListener('input', calc); });
    calc();
  }

  /* ── mah-to-wh (dual: Wh + kWh, voltage presets) ──────────── */
  function mahToWh() {
    var mah = $('input-mah'), v = $('input-volts');
    var wh = { display: $('result-wh'), value: $('result-value-wh'), unit: $('result-unit-wh') };
    var kwh = { display: $('result-kwh'), value: $('result-value-kwh'), unit: $('result-unit-kwh') };
    var note = $('formula-note');
    if (!mah || !v) return;
    function calc() {
      var whv = C.mahToWh(num(mah), num(v));
      if (whv === null) {
        render(wh, null, ''); render(kwh, null, '');
        if (note) { note.classList.remove('live'); note.textContent = 'Formula: Wh = (mAh × V) ÷ 1,000'; }
      } else {
        var kwhv = whv / 1000;
        render(wh, whv, fmt(whv, 4)); render(kwh, kwhv, fmt(kwhv, 6));
        if (note) { note.classList.add('live'); note.textContent =
          'Wh = (' + num(mah) + ' × ' + num(v) + ') ÷ 1,000  →  ' + fmt(whv, 4) + ' Wh  |  ' + fmt(kwhv, 6) + ' kWh'; }
      }
    }
    wirePresets(v, calc);
    mah.addEventListener('input', calc);
    calc();
  }

  /* ── wh-to-mah (single, voltage presets) ──────────────────── */
  function whToMah() {
    var wh = $('input-wh'), v = $('input-volts');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!wh || !v) return;
    function calc() {
      var mah = C.whToMah(num(wh), num(v));
      render(els, mah, fmt(mah, 2),
        mah === null ? 'Formula: mAh = (Wh × 1,000) ÷ V'
          : 'mAh = (' + num(wh) + ' × 1,000) ÷ ' + num(v) + '  →  ' + fmt(mah, 2) + ' mAh', true);
    }
    wirePresets(v, calc);
    wh.addEventListener('input', calc);
    calc();
  }

  /* Voltage preset buttons shared by battery calculators */
  function wirePresets(inputVolts, calc) {
    var btns = document.querySelectorAll('.preset-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        inputVolts.value = btn.dataset.voltage;
        btns.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        calc();
      });
    });
    inputVolts.addEventListener('input', function () {
      var val = parseFloat(inputVolts.value);
      btns.forEach(function (b) {
        b.classList.toggle('selected', parseFloat(b.dataset.voltage) === val);
      });
      calc();
    });
  }

  /* ── va-to-watts (dual: W + kW, PF presets) ───────────────── */
  function vaToWatts() {
    var va = $('input-va'), pf = $('input-pf');
    var w = { display: $('result-w'), value: $('result-value-w'), unit: $('result-unit-w'), note: $('formula-note-w') };
    var kw = { display: $('result-kw'), value: $('result-value-kw'), unit: $('result-unit-kw'), note: $('formula-note-kw') };
    if (!va || !pf) return;
    function calc() {
      var watts = C.vaToWatts(num(va), num(pf));
      var kwv = C.vaToKw(num(va), num(pf));
      render(w, watts, fmt(watts, 2),
        watts === null ? 'W = VA × PF' : 'W = ' + num(va) + ' × ' + num(pf) + ' = ' + fmt(watts, 2) + ' W', true);
      render(kw, kwv, fmt(kwv, 4),
        kwv === null ? 'kW = (VA × PF) ÷ 1,000' : 'kW = (' + num(va) + ' × ' + num(pf) + ') ÷ 1,000 = ' + fmt(kwv, 4) + ' kW', true);
    }
    var btns = document.querySelectorAll('.pf-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        pf.value = btn.dataset.pf;
        btns.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        calc();
      });
    });
    pf.addEventListener('input', function () {
      var val = parseFloat(pf.value);
      btns.forEach(function (b) { b.classList.toggle('selected', parseFloat(b.dataset.pf) === val); });
      calc();
    });
    va.addEventListener('input', calc);
    calc();
  }

  /* ── watts-to-volts (mode: current or resistance) ─────────── */
  function wattsToVolts() {
    var mA = $('mode-amps'), mR = $('mode-resistance');
    var sA = $('section-amps'), sR = $('section-resistance');
    var wA = $('input-watts'), amps = $('input-amps'), circuit = $('input-circuit'),
        pf = $('input-pf'), pfw = $('pf-wrapper');
    var wR = $('input-watts2'), ohms = $('input-ohms');
    var els = { display: $('result-display'), value: $('result-value'),
                unit: $('result-unit'), note: $('formula-note') };
    if (!wA || !circuit) return;
    var mode = 'amps';

    function setMode(m) {
      mode = m;
      if (mA) { mA.classList.toggle('active', m === 'amps'); mA.setAttribute('aria-selected', String(m === 'amps')); }
      if (mR) { mR.classList.toggle('active', m === 'resistance'); mR.setAttribute('aria-selected', String(m === 'resistance')); }
      if (sA) sA.classList.toggle('active', m === 'amps');
      if (sR) sR.classList.toggle('active', m === 'resistance');
      calc();
    }
    function updatePF() { togglePF(pfw, pf, circuit.value === 'ac'); }

    function calc() {
      var r = null, F = '', used = '';
      if (mode === 'amps') {
        var wv = num(wA), av = num(amps), pfv = num(pf);
        var cm = circuit.value === 'dc' ? 'amps-dc' : 'amps-ac';
        r = C.wattsToVolts(wv, av, cm, pfv);
        if (circuit.value === 'dc') { F = 'V = W ÷ A'; if (r !== null) used = wv + ' ÷ ' + av + ' = ' + fmt(r, 4) + ' V'; }
        else { F = 'V = W ÷ (A × PF)'; if (r !== null) used = wv + ' ÷ (' + av + ' × ' + pfv + ') = ' + fmt(r, 4) + ' V'; }
      } else {
        var wv2 = num(wR), ov = num(ohms);
        r = C.wattsToVolts(wv2, ov, 'resistance');
        F = 'V = √(W × R)';
        if (r !== null) used = '√(' + wv2 + ' × ' + ov + ') = ' + fmt(r, 4) + ' V';
      }
      render(els, r, fmt(r, 4), r === null ? 'Formula: ' + F : F + '  →  ' + used, true);
    }

    if (mA) mA.addEventListener('click', function () { setMode('amps'); });
    if (mR) mR.addEventListener('click', function () { setMode('resistance'); });
    [wA, amps, pf].forEach(function (el) { el && el.addEventListener('input', calc); });
    circuit.addEventListener('change', function () { updatePF(); calc(); });
    [wR, ohms].forEach(function (el) { el && el.addEventListener('input', calc); });
    updatePF(); calc();
  }

  /* ── learn/ohms-law: 4-variable solver (V, I, R, P) ───────── */
  function ohmsLaw() {
    var inputs = { v: $('input-v'), i: $('input-i'), r: $('input-r'), p: $('input-p') };
    var clearBtn = $('btn-clear');
    if (!inputs.v || !inputs.i || !inputs.r || !inputs.p) return;
    var active = [];

    function setVal(key, val) {
      if (active.indexOf(key) === -1 && isFinite(val)) inputs[key].value = parseFloat(val.toFixed(4));
    }
    function onInput(e) {
      var id = e.target.id.replace('input-', '');
      if (e.target.value === '') {
        active = active.filter(function (x) { return x !== id; });
        Object.keys(inputs).forEach(function (k) { if (active.indexOf(k) === -1) inputs[k].value = ''; });
        return;
      }
      if (active.indexOf(id) === -1) {
        active.push(id);
        if (active.length > 2) { var dropped = active.shift(); inputs[dropped].value = ''; }
      }
      if (active.length === 2) {
        var v = parseFloat(inputs.v.value), i = parseFloat(inputs.i.value),
            r = parseFloat(inputs.r.value), p = parseFloat(inputs.p.value);
        if (!isNaN(v) && !isNaN(i)) { setVal('r', v / i); setVal('p', v * i); }
        else if (!isNaN(v) && !isNaN(r)) { setVal('i', v / r); setVal('p', (v * v) / r); }
        else if (!isNaN(v) && !isNaN(p)) { setVal('i', p / v); setVal('r', (v * v) / p); }
        else if (!isNaN(i) && !isNaN(r)) { setVal('v', i * r); setVal('p', i * i * r); }
        else if (!isNaN(i) && !isNaN(p)) { setVal('v', p / i); setVal('r', p / (i * i)); }
        else if (!isNaN(r) && !isNaN(p)) { setVal('v', Math.sqrt(p * r)); setVal('i', Math.sqrt(p / r)); }
      }
    }
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener('input', onInput); });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      active = []; Object.keys(inputs).forEach(function (k) { inputs[k].value = ''; });
    });
  }

  /* ── Dispatch ─────────────────────────────────────────────── */
  var REGISTRY = {
    'watts-to-amps': wattsToAmps,
    'amps-to-watts': ampsToWatts,
    'amps-to-volts': ampsToVolts,
    'kva-to-amps': kvaToAmps,
    'kva-to-kw': kvaToKw,
    'kw-to-amps': kwToAmps,
    'kw-to-amps-value': kwToAmpsValue,
    'kwh-to-watts': kwhToWatts,
    'watts-to-kwh': wattsToKwh,
    'mah-to-wh': mahToWh,
    'wh-to-mah': whToMah,
    'va-to-watts': vaToWatts,
    'watts-to-volts': wattsToVolts,
    'ohms-law': ohmsLaw
  };

  var type = document.body && document.body.getAttribute('data-calc');
  if (type && REGISTRY[type]) REGISTRY[type]();
})();
