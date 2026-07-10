# electricalconverters.com — Phase 0 Audit

**Date:** 2026-07-10 · **Scope:** Audit only, no source files modified · **Pages audited:** 27 HTML (all)

## Method & tooling note
- Inventory, head-diff, and JSON-LD validation performed by static parsing of every HTML file (read-only scripts run from scratchpad).
- **Lighthouse could not be executed in this environment** (no Node/Chrome/`npx` available). Section 5 gives a *static-analysis-based estimate* clearly labelled as such; real mobile Lighthouse runs must be captured by the user (throttled, `preset=mobile`) and pasted back to replace the estimate table.
- Competitor teardown via live fetch of Inch Calculator, Omni Calculator, RapidTables.

---

## 1. Full page inventory (all 27)

Legend: TL=title length, DL=desc length, JS=external scripts, IS=inline `<script>` blocks (non-JSON-LD), ST=inline `style=` attrs, LD=JSON-LD blocks/types, Rel=has related-links block, H1=count. **Every page:** viewport ✔, canonical ✔ (except 404), OG ✔ (except 404), lang=en ✔, Twitter ✘, favicon ✘, manifest ✘, theme-color ✘, og:image ✘.

| Page | TL | DL | JS files | IS | ST | JSON-LD | Rel | H1 |
|---|---|---|---|---|---|---|---|---|
| index.html | 40 | 128 | — | 2 | 0 | WebSite | ✔ | 1 |
| 404.html | 37 | **0** | **cdn.tailwindcss.com** | 2 | 0(+`<style>`) | **none** | ✔ | 1 |
| watts-to-amps/ | 47 | 138 | converters | 2 | 3 | FAQPage | **✘** | 1 |
| watts-to-amps/500- | 36 | 123 | converters | 2 | 12 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-amps/1000- | 37 | 120 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-amps/1500- | 37 | 121 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-amps/2000- | 37 | 121 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-amps/3000- | 37 | 122 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-amps/5000- | 37 | 122 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| kw-to-amps/ | 44 | 140 | converters+ui | **3** | **37** | FAQ+Breadcrumb | ✔ | 1 |
| kw-to-amps/1- | 43 | 136 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| kw-to-amps/2- | 44 | 138 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| kw-to-amps/5- | 44 | 139 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| kw-to-amps/10- | 46 | 140 | converters | 2 | 12 | FAQ+Breadcrumb | ✔ | 1 |
| amps-to-watts/ | 47 | 137 | converters | 2 | 22 | FAQPage | ✔ | 1 |
| amps-to-volts/ | 47 | 142 | converters | 2 | 11 | FAQ+Breadcrumb | ✔ | 1 |
| watts-to-volts/ | 48 | 143 | converters+ui | 2 | 7 | FAQ+Breadcrumb | ✔ | 1 |
| kva-to-kw/ | 43 | 129 | converters | 2 | 0 | FAQPage | **✘** | 1 |
| kva-to-amps/ | 45 | 125 | converters+ui | 2 | 19 | FAQPage | ✔ | 1 |
| va-to-watts/ | 45 | 158 | converters+ui | 2 | 13 | FAQ+Breadcrumb | ✔ | 1 |
| kwh-to-watts/ | 46 | 124 | converters | 2 | 20 | FAQPage | ✔ | 1 |
| watts-to-kwh/ | 46 | 146 | converters+ui | 2 | 12 | FAQ+Breadcrumb | ✔ | 1 |
| mah-to-wh/ | 43 | 125 | converters | 2 | 20 | FAQPage | ✔ | 1 |
| wh-to-mah/ | 43 | 113 | converters+ui | 2 | 9 | FAQ+Breadcrumb | ✔ | 1 |
| learn/ohms-law/ | 38 | 147 | — | 2 | 4(+`<style>`) | **none** | ✔ | 1 |
| learn/watts-vs-amps/ | 60 | 151 | — | 2 | 1(+`<style>`) | **none** | **✘** | 1 |
| privacy/ | 37 | 103 | — | 2 | 0(+`<style>`) | none | ✘ | 1 |

**Inventory takeaways**
- Titles/descriptions are all within healthy length ranges (titles 36–60, descriptions 103–158). No truncation risk. H1 = exactly 1 on every page ✔.
- **Three inconsistent title patterns:** hubs `"X Calculator | ElectricalConverters"`; watts children `"N Watts to Amps Calculator & Chart"` (no brand); kw children `"N kW to Amps — How Many Amps Is N Kilowatts?"` (question form, no brand). Not fatal, but unbranded child titles weaken brand SERP consistency.
- **No favicon, no og:image, no Twitter card, no manifest, no theme-color on ANY page** — site-wide gap. Social shares render blank; no browser-tab icon.
- Inline `style=` attribute counts are high and wildly uneven (0 → 37 on kw-to-amps hub) → styling that belongs in `main.css` is scattered inline; maintainability + minor payload cost.
- `learn/*` and `privacy/` each carry a head-level `<style>` block instead of using `main.css` — inconsistent with the rest of the site.

---

## 2. Head-block consistency (diff vs `watts-to-amps` reference)

Consistent baseline across all calculator pages: `charset → viewport → title → description → canonical → og:type/title/description/url → main.css → ld+json → 2× preconnect → fonts stylesheet`. Deviations:

| Page(s) | Deviation |
|---|---|
| **404.html** | Adds `<script src="https://cdn.tailwindcss.com">` (dev CDN, render-blocking, unused), a conflicting head `<style>` (light-theme `#ffffff` header overriding dark theme), `meta robots=noindex`. Missing: description, canonical, all OG, JSON-LD. Effectively a different template. |
| **learn/ohms-law, learn/watts-vs-amps, privacy** | Head-level `<style>` block; **no JSON-LD** at all. |
| 6 hub pages (watts-to-amps, amps-to-watts, kva-to-kw, kva-to-amps, kwh-to-watts, mah-to-wh) | Have **FAQPage only — missing BreadcrumbList** that their siblings/children carry. Inconsistent breadcrumb schema coverage. |
| kw-to-amps hub | 3 inline scripts (one more than the standard 2) and 37 inline `style=` attrs — the messiest single page. |

No page uses `defer`/`async` on `converters.js` (it sits at end of `<body>`, so acceptable but not optimal).

---

## 3. Structured-data validation

- **All 20 JSON-LD blocks across the site parse as valid JSON** (validated via `json.loads` on every block). No syntax errors. FAQPage and BreadcrumbList shapes are well-formed.
- ⚠️ **FAQPage no longer earns a SERP feature** (Google removed FAQ rich results, May 2026) — keep valid for AI/PAA parsing but do not expect stars/accordions. (Per brief; handled Phase 2.)
- **Gaps:**
  - `learn/ohms-law` and `learn/watts-vs-amps` both render a visible "Frequently Asked Questions" H2 **but ship no FAQPage schema**, and no `Article`/`TechArticle` schema. Pure missed markup.
  - 6 hub pages missing `BreadcrumbList` (see §2).
  - Homepage has `WebSite` only — no `Organization` (no logo/E-E-A-T entity), no `ItemList` for the 12-calculator grid, no `SearchAction`.
  - No `Organization`/author/`reviewedBy` anywhere → zero E-E-A-T entity signal (competitors carry author + reviewer, see §6).

---

## 4. Responsive audit (320 / 375 / 768 / 1024 / 1440)

Assessed from `main.css` (breakpoints 1024/768/640/480) + markup. **No live device render available**, so overflow items marked as *risk* where a horizontal-scroll container is absent.

| Check | Finding |
|---|---|
| Input font-size (iOS zoom) | ✅ `.input-field { font-size: 1rem }` on 16px root = 16px. **No iOS auto-zoom.** |
| Horizontal overflow — reference/examples tables | ⚠️ **Risk at 320/375.** `.ref-table`/`.examples-table` have many columns; confirm each is wrapped in an `overflow-x:auto` scroller or the page body scrolls sideways on narrow phones. |
| Desktop nav crowding | ⚠️ 12 nav links in a single sticky row (`overflow-x:auto`, scrollbar hidden) between ~768–1024px can crowd/clip with no visible affordance that it scrolls. |
| Touch targets < 44px | ⚠️ `.nav-link` (`padding .3rem .6rem`), `.subpage-nav a` (`.3rem .75rem`), `.table-tab-btn`/`.phase-tab` fall below the 44px min on touch. |
| Contrast | ⚠️ Verify `--color-text-muted` on `--color-bg #0c0e14` and accent text on dark meet WCAG AA (4.5:1) — several muted labels at 0.65–0.75rem are the risk. Needs measurement. |
| CLS from web fonts | ⚠️ Google Fonts loaded with `display=swap` → FOUT reflow risk if fallback metrics differ. Add `size-adjust`/`font-*-override` or self-host to stabilise. |

Positive: mobile hamburger + overlay, ARIA, and a coherent breakpoint ladder already exist.

---

## 5. Performance baseline — ⚠️ ESTIMATED (Lighthouse not runnable here)

Static-analysis estimate. **Replace with real mobile Lighthouse numbers.** Main render-blocking chain on every page: `main.css` (~37KB) + Google Fonts CSS (2 preconnects + 1 blocking stylesheet + font fetch on `fonts.gstatic.com`). No images, minimal JS → LCP element is text (H1/hero or the result value).

| Page | Perf | A11y | Best-Pr | SEO | LCP (est) | INP/TBT | CLS (est) |
|---|---|---|---|---|---|---|---|
| index.html | ~92–97 | ~90–100 | ~95–100 | ~95–100 | good (text) | low | font-swap risk |
| watts-to-amps/ | ~92–97 | ~90–100 | ~95–100 | ~95–100 | good | low | font-swap risk |
| 1500-watts-to-amps/ | ~92–97 | ~90–100 | ~95–100 | ~95–100 | good | low | font-swap risk |
| learn/ohms-law/ | ~92–97 | ~90–100 | ~95–100 | ~92–98 | good | low | font-swap risk |
| **404.html** | **~60–78** | ~85–95 | **~75–85** | n/a (noindex) | worse | higher | higher |
| privacy/ | ~95–99 | ~90–100 | ~95–100 | ~95–100 | good | low | low |

Main levers: (1) render-blocking Google Fonts → self-host + preload the 2–3 used weights, or `media=print` swap; (2) 404's Tailwind CDN tanks its Perf/Best-Practices and adds a "cdn.tailwindcss.com should not be used in production" console warning; (3) `main.css` is a single 1360-line file serving all page types — consider critical-CSS inline for above-the-fold.

---

## 6. Competitor teardown & gaps

| | RapidTables | Inch Calculator | Omni Calculator |
|---|---|---|---|
| Title | "Watts to Amps (A) Calculator" | "Watts to Amps Calculator - Inch Calculator" | "Watts to Amps Calculator" |
| H1 | Watts to Amps Calculator | Watts to Amps Calculator | Watts to Amps Calculator |
| Reference table | ✔ (120V, 10–1000W) | ✔✔ (120/240V AC **and** 12V DC) | ✘ |
| Visible FAQ/Q&A | ✘ | ✘ | ✘ |
| Related calculators | ✔ (50+) | ✔ ("Similar Electrical Calculators") | ✔ (45 similar) |
| Embeddable widget | ✘ | ✔ **"Add this to your site"** | ✘ |
| E-E-A-T signals | thin | References/citations + power-triangle diagram | Author + reviewer attribution, worked steps |
| Interactive calc | ✔ | ✔ | ✔ (rich inputs) |

**GAPS a new site can exploit:**
1. **Embeddable widget = backlink engine.** Only Inch offers an "add to your site" embed. A free, branded iframe/snippet calculator is the single best lever to earn links against DR 78–91 incumbents — a moat-breaker they mostly lack.
2. **On-page FAQ / PAA capture.** *None* of the three has a visible Q&A block. Our FAQ sections (already on every calculator) can win "People Also Ask" and AI-answer real estate even though the FAQ *rich result* is gone — a content surface competitors ignore.
3. **Richer single-glance answer table on hub pages.** RapidTables shows only a 120V table; Omni shows none. Our hub pages currently show **no table at all** (only children do). A hub table covering DC + 120/240V AC single- & three-phase in one view beats all three.
4. **E-E-A-T we don't yet have but can add cheaply.** Inch (citations) and Omni (author + reviewer) both signal expertise; we ship zero author/Organization/citation markup. Adding an "electrical engineer reviewed" byline + references + `Organization` schema closes a trust gap.
5. **Programmatic long-tail depth.** Competitors typically publish one page per conversion; we already have modifier children (500–5000 W, 1–10 kW). Systematically expanding (per-appliance, per-voltage, more wattages/kW) scales long-tail coverage they don't chase.

---

## 7. Prioritized defect list

Severity: **P0** critical · **P1** high · **P2** medium · **P3** low.

### Technical / Perf
| Sev | Defect | File(s) |
|---|---|---|
| **P0** | Broken/unclosed markup: mobile nav `<ul>` truncated after 9 of 12 items, then jumps straight to `<main>`; `<ul>` + 2 `<div>` never closed. Nav is malformed. | `404.html` |
| **P0** | Invalid nesting: `Popular Calculations`/`Educational Articles` `<section>`s are placed *inside* the still-open `.tool-grid` div; 1 `<section>` + 1 `<div>` unclosed. | `index.html` |
| **P1** | `cdn.tailwindcss.com` dev CDN loaded (render-blocking, unused classes, prod console warning) + head `<style>` that redefines header as light theme, conflicting with `main.css` dark theme. | `404.html` |
| **P1** | Render-blocking Google Fonts stylesheet in `<head>` on all 27 pages (LCP + CLS/FOUT risk). | all pages / `main.css` |
| **P2** | `sitemap.xml` `lastmod` all static (2026-05-29/30); will misrepresent freshness after edits. `robots.txt` OK, sitemap covers all 26 indexable URLs ✔. | `sitemap.xml` |
| **P2** | `_redirects` incomplete: only 7 non-slash→slash 301s. Missing for kw-to-amps, amps-to-volts, watts-to-volts, va-to-watts, watts-to-kwh, wh-to-mah, learn/*, and **all** child pages. | `_redirects` |
| **P2** | High + uneven inline `style=` usage (up to 37/page) and head `<style>` blocks on learn/privacy → belongs in `main.css`. | kw-to-amps, amps-to-watts, kwh-to-watts, mah-to-wh, learn/*, privacy |
| **P3** | `converters.js` not `defer`red (end-of-body, low impact). | 22 calculator pages |
| **P3** | Leftover build artifacts in repo root (`*.py`, `audit_*.txt`, `fix_results.txt`, `audit2.txt`) — should not deploy. | repo root |

### SEO
| Sev | Defect | File(s) |
|---|---|---|
| **P1** | `watts-to-amps` hub is thin (only 2 H2: Formula + FAQ) — **no reference table, no related-calculators block, no BreadcrumbList** — while its own children are richer. Flagship money page under-built. | `watts-to-amps/index.html` |
| **P1** | No `og:image` / Twitter card / favicon anywhere → blank social shares, no tab icon, weaker CTR. | all pages |
| **P1** | `learn/ohms-law` & `learn/watts-vs-amps` render visible FAQ but ship **no FAQPage and no Article schema**; watts-vs-amps also has no related block. | `learn/*` |
| **P2** | BreadcrumbList missing on 6 hub pages (present on children/siblings). | watts-to-amps, amps-to-watts, kva-to-kw, kva-to-amps, kwh-to-watts, mah-to-wh |
| **P2** | `kva-to-kw` thin (2 H2, no table, no related block). | `kva-to-kw/index.html` |
| **P2** | Homepage `WebSite` only — no `Organization`, `ItemList`, or `SearchAction`; no E-E-A-T entity. | `index.html` |
| **P3** | Three inconsistent title patterns; child titles drop the brand. | watts-to-amps/*, kw-to-amps/* |
| **P3** | Heading casing: "KWh to Watts Formula" / "Real-World KWh…" should be "kWh". | `kwh-to-watts/index.html` |
| **P3** | `amps-to-watts` has two near-duplicate H2s ("Common Amps to Watts Examples" + "…Calculations"). | `amps-to-watts/index.html` |

### Responsive
| Sev | Defect | File(s) |
|---|---|---|
| **P1** | Reference/examples tables risk horizontal overflow at 320/375 unless each is in an `overflow-x:auto` scroller — verify & wrap. | `main.css` + table pages |
| **P2** | Touch targets < 44px: `.nav-link`, `.subpage-nav a`, `.table-tab-btn`, `.phase-tab`. | `main.css` |
| **P2** | 12-item sticky nav crowds/clips ~768–1024px with no visible scroll affordance. | `main.css`, all pages |
| **P2** | Verify muted-text contrast (AA 4.5:1) on `#0c0e14`, esp. 0.65–0.75rem labels. | `main.css` |

### Design
| Sev | Defect | File(s) |
|---|---|---|
| **P1** | Hub pages read as thinner than children — no data table / instrument feel on the top-level converters; design does not yet signal "engineering instrument" vs. template. | hub calculators |
| **P2** | No embeddable-widget presentation (biggest competitive lever — see §6). | site-wide (new) |
| **P2** | No author/reviewer/E-E-A-T presentation block. | site-wide (new) |
| **P3** | 404 visual template diverges (light theme via Tailwind) from the dark site identity. | `404.html` |

---

### Acceptance check
- ✅ All 27 pages inventoried (not a sample). ✅ Head diff, JSON-LD validation, responsive audit, competitor gaps included. ⚠️ Lighthouse table is a labelled static estimate (tooling unavailable) — needs a real mobile run. ✅ **No source file modified** (this `AUDIT.md` is the only new file).
