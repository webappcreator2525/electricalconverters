import os

css_additions = """
/* ============================================================
   11. RESTORED CALCULATOR COMPONENTS
   ============================================================ */

/* Tabs and Modes */
.phase-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }
.phase-tab { background: transparent; border: 1px solid transparent; color: var(--color-text-muted); font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; cursor: pointer; padding: 0.5rem 1rem; border-radius: 6px; transition: all var(--transition-fast); }
.phase-tab:hover { color: var(--color-text); background: rgba(255,255,255,0.05); }
.phase-tab.active { color: var(--color-accent); background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); }
.mode-section { display: none; }
.mode-section.active { display: block; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Result Overrides */
.result-display__value-row { display: flex; align-items: baseline; gap: 0.5rem; }
.result-display__formula-note { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-muted); margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--color-border); }
.result-display__formula-note.live { color: var(--color-text); }
.formula-note { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.5rem; }
.formula-note.live { color: var(--color-text); }

/* Dual Results */
.result-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
@media (max-width: 640px) { .result-dual { grid-template-columns: 1fr; } }
.result-primary, .result-secondary { padding: 1.5rem; border-radius: 8px; min-height: 80px; }
.result-primary { border-left: 3px solid var(--color-accent); background-color: rgba(59, 130, 246, 0.05); }
.result-secondary { border-left: 3px solid var(--color-accent-2); background-color: rgba(16, 185, 129, 0.05); }
.result-label-w { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-accent); margin-bottom: 0.5rem; }
.result-label-kw { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-accent-2); margin-bottom: 0.5rem; }
.result-value { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 500; color: #ffffff; }
.result-unit { font-family: var(--font-mono); font-size: 1rem; color: var(--color-text-muted); margin-left: 0.25rem; }

/* PF Presets */
.pf-preset-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 0.75rem; font-weight: 600; }
.pf-presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.pf-btn { display: flex; flex-direction: column; align-items: flex-start; padding: 0.75rem 1rem; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer; transition: all var(--transition-fast); }
.pf-btn:hover { border-color: var(--color-accent); }
.pf-btn.selected { border-color: var(--color-accent); background: rgba(59, 130, 246, 0.1); }
.pf-btn__val { font-family: var(--font-mono); font-size: 1rem; font-weight: 500; color: #ffffff; margin-bottom: 0.25rem; }
.pf-btn__desc { font-family: var(--font-body); font-size: 0.75rem; color: var(--color-text-muted); }

/* Tables */
.table-wrap, .examples-table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 2rem; }
.ref-table, .examples-table { width: 100%; border-collapse: collapse; text-align: left; }
.ref-table th, .examples-table th { background: var(--color-surface-2); padding: 0.75rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); font-weight: 600; border-bottom: 1px solid var(--color-border); }
.ref-table td, .examples-table td { padding: 1rem; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; color: var(--color-text); }
.ref-table tr:last-child td, .examples-table tr:last-child td { border-bottom: none; }
.ref-table tbody tr:hover, .examples-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.col-mono, .col-watts, .col-va, .col-num { font-family: var(--font-mono); font-weight: 500; color: #ffffff; }
.col-result, .col-w, .col-amps, .col-volts { font-family: var(--font-mono); color: var(--color-accent); font-weight: 500; }
.col-result-green { font-family: var(--font-mono); color: var(--color-accent-2); font-weight: 500; }
.col-highlight, tr.highlight td { background: rgba(59, 130, 246, 0.05); }
.col-head-blue { color: var(--color-accent) !important; }
.col-head-green { color: var(--color-accent-2) !important; }

/* Formula Layouts */
.formula-set, .formula-pair { display: grid; gap: 1.5rem; margin-bottom: 2rem; }
.formula-pair { grid-template-columns: 1fr 1fr; }
@media (max-width: 768px) { .formula-pair { grid-template-columns: 1fr; } }
.formula-item { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; }
.formula-item__label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--color-accent); margin-bottom: 0.75rem; letter-spacing: 0.05em; }
.formula-item__desc { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin-top: 1rem; }
.var { font-style: italic; color: #ffffff; }
.formula-desc { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; }

/* Explainer & Phase Cards */
.phase-grid, .explainer-grid, .concept-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3rem; }
@media (max-width: 768px) { .phase-grid, .explainer-grid, .concept-grid { grid-template-columns: 1fr; } }
.phase-card, .explainer-card, .concept-card, .callout-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; }
.phase-card__title, .explainer-card__title, .concept-card__title, .callout-card__title { font-size: 1.1rem; font-weight: 600; color: #ffffff; margin-bottom: 1rem; }
.phase-card__body, .explainer-card__body, .concept-card__body, .callout-card__body { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1; }
.phase-card__example, .explainer-card__badge, .concept-card__example { align-self: flex-start; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(59, 130, 246, 0.1); color: var(--color-accent); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.2); }
.phase-indicator { display: flex; gap: 0.5rem; margin-top: 1rem; margin-bottom: 2rem; }
.phase-indicator .phase-tab { background: var(--color-surface-2); cursor: default; }
.phase-indicator .phase-tab.active { background: rgba(59, 130, 246, 0.1); color: var(--color-accent); border: 1px solid var(--color-accent); }

/* Miscellaneous */
.pf-wrapper { display: none; margin-top: 1.5rem; }
.pf-wrapper.visible { display: block; animation: fadeIn 0.3s ease; }
.result-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; }
.result-card__label { font-size: 0.7rem; font-weight: 700; color: var(--color-accent); margin-bottom: 0.5rem; letter-spacing: 0.1em; }
.result-card__value { font-family: var(--font-mono); font-size: 2rem; color: #ffffff; }
.result-card__unit { font-size: 1rem; color: var(--color-text-muted); margin-left: 0.25rem; }
.content-section { margin-bottom: 4rem; }
.circuit-row { margin-bottom: 2rem; margin-top: 1.5rem; }
.preset-group { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.preset-btn { background: var(--color-surface-2); border: 1px solid var(--color-border); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: var(--color-text); font-size: 0.9rem; transition: all var(--transition-fast); }
.preset-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
"""

css_path = r"c:\Users\HALUK YILDIZ\Downloads\electricalconverters.com\assets\css\main.css"
with open(css_path, "a", encoding="utf-8") as f:
    f.write(css_additions)
print("Appended missing classes to main.css")
