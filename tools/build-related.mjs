/**
 * build-related.mjs — electricalconverters.com Phase 3
 * Reads the single-source-of-truth map (assets/js/related.js) and injects static,
 * crawlable "Related conversions" blocks + breadcrumbs into every calculator,
 * specific-value and learn page (between <!-- related:start --> / <!-- related:end -->).
 *
 * Re-run after editing related.js (e.g. flipping a Part B page to exists:true):
 *   node tools/build-related.mjs
 * Idempotent: existing generated blocks are stripped and rebuilt each run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = (await import(pathToFileURL(path.join(ROOT, 'assets/js/related.js')).href)).default;
const { CLUSTERS, PAGES, LEARN, CHILDREN } = map;

const exists = (k) => PAGES[k] && PAGES[k].exists;
const uniq = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);

/* ── item + block builders ─────────────────────────────────────── */
function relItem(key) {
  const p = PAGES[key];
  return `<li class="rel-item"><a class="rel-item__link" href="${p.href}">${p.anchor}</a><span class="rel-item__desc">${p.blurb}</span></li>`;
}
function learnLine(keys, label) {
  const ks = uniq(keys).filter((k) => LEARN[k]);
  if (!ks.length) return '';
  const links = ks.map((k) => `<a href="${LEARN[k].href}">${LEARN[k].anchor}</a>`).join(' and ');
  return `<p class="related-conversions__learn">${label} ${links}.</p>`;
}

/* Related set for a converter page: cluster siblings first, then cluster bridges. */
function relatedForConverter(key) {
  const p = PAGES[key];
  const siblings = [];
  const bridges = [];
  for (const c of p.clusters) {
    for (const other of Object.keys(PAGES)) {
      if (other !== key && exists(other) && PAGES[other].clusters.includes(c)) siblings.push(other);
    }
    for (const b of (CLUSTERS[c].bridges || [])) {
      if (b !== key && exists(b)) bridges.push(b);
    }
  }
  return uniq([...siblings, ...bridges]);
}

function blockConverter(key) {
  const p = PAGES[key];
  const primary = CLUSTERS[p.clusters[0]];
  const rel = relatedForConverter(key);
  let out = '<!-- related:start -->\n';
  out += '<section class="related-conversions" aria-labelledby="related-conversions-heading">\n';
  out += '<h2 id="related-conversions-heading">Related conversions</h2>\n';
  out += `<p class="related-conversions__intro">This calculator is part of our <strong>${primary.name}</strong> tools. Jump to a related conversion:</p>\n`;
  out += '<ul class="rel-list">\n' + rel.map(relItem).join('\n') + '\n</ul>\n';
  // Hub pages with specific-value spokes: link down to popular values.
  if (CHILDREN[key]) {
    const ch = CHILDREN[key];
    out += `<p class="related-conversions__intro">Popular ${ch.phrase} values:</p>\n`;
    out += '<div class="rel-sub">\n' + ch.values.map((v) =>
      `<a class="rel-sub__link" href="${p.href}${v}-${key}/">${v} ${ch.phrase}</a>`).join('\n') + '\n</div>\n';
  }
  out += learnLine(p.learn, 'Background reading:') + '\n';
  out += '</section>\n<!-- related:end -->';
  return out;
}

function blockChild(parentKey, value, idx) {
  const parent = PAGES[parentKey];
  const ch = CHILDREN[parentKey];
  const items = [];
  // Up to parent hub.
  items.push(`<li class="rel-item"><a class="rel-item__link" href="${parent.href}">Open the full ${ch.phrase} calculator</a><span class="rel-item__desc">${parent.blurb}</span></li>`);
  // Sideways to nearest sibling values.
  [idx - 1, idx + 1].forEach((j) => {
    if (j >= 0 && j < ch.values.length) {
      const sv = ch.values[j];
      items.push(`<li class="rel-item"><a class="rel-item__link" href="${parent.href}${sv}-${parentKey}/">${sv} ${ch.phrase}</a><span class="rel-item__desc">See ${sv}&nbsp;${ch.unitLabel} worked out.</span></li>`);
    }
  });
  // A couple of cross-cluster bridges from the parent's primary cluster.
  (CLUSTERS[parent.clusters[0]].bridges || []).filter(exists).slice(0, 2).forEach((b) => items.push(relItem(b)));

  let out = '<!-- related:start -->\n';
  out += '<section class="related-conversions" aria-labelledby="related-conversions-heading">\n';
  out += '<h2 id="related-conversions-heading">Related conversions</h2>\n';
  out += `<p class="related-conversions__intro">A worked example from the <a href="${parent.href}">${parent.label.toLowerCase()} calculator</a> hub. Try nearby values or a related conversion:</p>\n`;
  out += '<ul class="rel-list">\n' + items.join('\n') + '\n</ul>\n';
  out += learnLine(parent.learn, 'Background reading:') + '\n';
  out += '</section>\n<!-- related:end -->';
  return out;
}

function blockLearn(learnKey) {
  const L = LEARN[learnKey];
  // One representative per cluster (hub if it exists, else first existing member) → link DOWN into every cluster.
  const reps = [];
  for (const cid of Object.keys(CLUSTERS)) {
    const hub = CLUSTERS[cid].hub;
    if (exists(hub)) { reps.push(hub); continue; }
    const fallback = Object.keys(PAGES).find((k) => exists(k) && PAGES[k].clusters.includes(cid));
    if (fallback) reps.push(fallback);
  }
  const items = uniq([...reps, ...(L.extra || []).filter(exists)]);
  const otherLearn = Object.keys(LEARN).find((k) => k !== learnKey);

  let out = '<!-- related:start -->\n';
  out += '<section class="related-conversions" aria-labelledby="related-conversions-heading">\n';
  out += '<h2 id="related-conversions-heading">Related calculators</h2>\n';
  out += '<p class="related-conversions__intro">Put the theory to work with our free converters:</p>\n';
  out += '<ul class="rel-list">\n' + items.map(relItem).join('\n') + '\n</ul>\n';
  if (otherLearn) out += `<p class="related-conversions__learn">See also: <a href="${LEARN[otherLearn].href}">${LEARN[otherLearn].anchor}</a>.</p>\n`;
  out += '</section>\n<!-- related:end -->';
  return out;
}

/* ── HTML surgery helpers ──────────────────────────────────────── */
function stripOld(html) {
  return html
    // Any previously generated block.
    .replace(/[ \t]*<!-- related:start -->[\s\S]*?<!-- related:end -->\s*/g, '\n')
    // Hand-built "Related Calculators" (related-heading) incl. an optional preceding comment.
    .replace(/[ \t]*(?:<!--[^\n]*?-->\s*)?<section[^>]*aria-labelledby="related-heading"[\s\S]*?<\/section>\s*/g, '\n')
    // Child "Related Tools" (links-heading).
    .replace(/[ \t]*(?:<!--[^\n]*?-->\s*)?<section[^>]*aria-labelledby="links-heading"[\s\S]*?<\/section>\s*/g, '\n')
    // amps-to-watts broken "Common ... Calculations" grid (common-heading) linking to non-existent children.
    .replace(/[ \t]*(?:<!--[^\n]*?-->\s*)?<section[^>]*aria-labelledby="common-heading"[\s\S]*?<\/section>\s*/g, '\n')
    // learn hand-built "... Calculators" h2 + related-grid.
    .replace(/[ \t]*<h2>[^<]*Calculators<\/h2>\s*<div class="related-grid">[\s\S]*?<\/div>\s*/g, '\n');
}

function insertBlock(html, block) {
  const mainIdx = html.lastIndexOf('</main>');
  const head = html.slice(0, mainIdx);
  const tail = html.slice(mainIdx);
  const divIdx = head.lastIndexOf('</div>');
  return head.slice(0, divIdx) + block + '\n' + head.slice(divIdx) + tail;
}

function addBreadcrumb(html, label) {
  if (/class="breadcrumb"/.test(html)) return html;
  const bc =
    '<nav aria-label="Breadcrumb" class="breadcrumb">\n' +
    '<a href="/">Home</a>\n' +
    '<span aria-hidden="true" class="breadcrumb__sep">›</span>\n' +
    `<span class="breadcrumb__current">${label}</span>\n` +
    '</nav>\n';
  return html.replace('<div class="page-wrap">', '<div class="page-wrap">\n' + bc);
}

/* ── run ───────────────────────────────────────────────────────── */
const edited = [];
function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html);
  edited.push(rel);
}

// Converter hubs
for (const key of Object.keys(PAGES).filter(exists)) {
  const rel = path.join(key, 'index.html');
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  let html = fs.readFileSync(abs, 'utf8');
  html = stripOld(html);
  html = addBreadcrumb(html, PAGES[key].label);
  html = insertBlock(html, blockConverter(key));
  write(rel, html);
}

// Specific-value children
for (const parentKey of Object.keys(CHILDREN)) {
  CHILDREN[parentKey].values.forEach((v, idx) => {
    const rel = path.join(parentKey, `${v}-${parentKey}`, 'index.html');
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    let html = fs.readFileSync(abs, 'utf8');
    html = stripOld(html);
    html = insertBlock(html, blockChild(parentKey, v, idx));
    write(rel, html);
  });
}

// Learn articles
for (const key of Object.keys(LEARN)) {
  const rel = path.join('learn', key, 'index.html');
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  let html = fs.readFileSync(abs, 'utf8');
  html = stripOld(html);
  html = addBreadcrumb(html, LEARN[key].label);
  html = insertBlock(html, blockLearn(key));
  write(rel, html);
}

console.log(`Injected Related-conversions blocks into ${edited.length} pages:`);
edited.forEach((f) => console.log('  ' + f.replace(/\\/g, '/')));
