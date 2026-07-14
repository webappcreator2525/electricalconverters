import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = (await import(pathToFileURL(path.join(ROOT, 'assets/js/related.js')).href)).default;
const { CLUSTERS, PAGES, LEARN } = map;
const exists = (k) => PAGES[k] && PAGES[k].exists;

const groupLabels = {
  'power-current': 'Power &amp; Current',
  'apparent': 'Apparent Power',
  'energy': 'Energy',
  'battery': 'Battery',
  'motor': 'Motors',
  'safety': 'Wiring'
};

const comingSoonTexts = {
  'motor': 'HP to amps, HP to kW and kW to HP are coming soon. For now, <a href="/kw-to-amps/">size a motor circuit with kW to amps</a>.',
  'safety': 'Wire gauge, breaker size and voltage drop are coming soon. Start by <a href="/watts-to-amps/">finding amps with watts to amps</a>.'
};

let desktopNavHtml = '';
let mobileNavHtml = '';

for (const cKey of Object.keys(CLUSTERS)) {
  const label = groupLabels[cKey];
  const pages = Object.values(PAGES).filter(p => p.clusters.includes(cKey) && p.exists);
  
  // Desktop
  desktopNavHtml += `<li class="nav-group">\n`;
  desktopNavHtml += `<button aria-controls="menu-${cKey}" aria-expanded="false" class="nav-trigger" id="trigger-${cKey}" type="button">${label.replace('&amp;', '&')} <span aria-hidden="true" class="nav-caret"></span></button>\n`;
  desktopNavHtml += `<div class="nav-panel" id="menu-${cKey}">\n`;
  
  if (pages.length > 0) {
    for (const p of pages) {
      desktopNavHtml += `<a class="nav-panel__link" href="${p.href}">${p.label}</a>\n`;
    }
  } else {
    desktopNavHtml += `<p class="nav-panel__note">${comingSoonTexts[cKey]}</p>\n`;
  }
  
  if (cKey === 'power-current') {
    desktopNavHtml += `<div class="nav-panel__sub">Guides</div>\n`;
    for (const lKey of Object.keys(LEARN)) {
      desktopNavHtml += `<a class="nav-panel__link nav-panel__link--sub" href="${LEARN[lKey].href}">${LEARN[lKey].label}</a>\n`;
    }
  }
  desktopNavHtml += `</div>\n</li>\n`;

  // Mobile
  mobileNavHtml += `<li class="m-group">\n`;
  mobileNavHtml += `<div class="m-group__label">${label}</div>\n`;
  if (pages.length > 0) {
    for (const p of pages) {
      mobileNavHtml += `<a class="nav-link" href="${p.href}">${p.label}</a>\n`;
    }
  } else {
    mobileNavHtml += `<p class="m-note">${comingSoonTexts[cKey]}</p>\n`;
  }
  mobileNavHtml += `</li>\n`;
}

// Mobile Guides
mobileNavHtml += `<li class="m-group">\n<div class="m-group__label">Guides</div>\n`;
for (const lKey of Object.keys(LEARN)) {
  mobileNavHtml += `<a class="nav-link" href="${LEARN[lKey].href}">${LEARN[lKey].label}</a>\n`;
}
mobileNavHtml += `</li>\n`;

const headerTemplate = `<header class="site-header">
<div class="header-inner">
<a class="site-logo" href="/"><span>Electrical</span><span class="logo-accent">Converters</span></a>
<nav aria-label="Main navigation" class="site-nav">
<ul class="nav-list">
${desktopNavHtml.trim()}
</ul>
</nav>
<button aria-controls="mobile-nav" aria-expanded="false" aria-label="Open navigation" class="nav-toggle" type="button">
<span class="nav-toggle-bar"></span>
<span class="nav-toggle-bar"></span>
<span class="nav-toggle-bar"></span>
</button>
</div>
</header>`;

const mobileMenuTemplate = `<div aria-hidden="true" class="mobile-nav-overlay" id="mobile-nav">
<div class="mobile-nav-inner">
<div class="mobile-nav-header">
<span class="site-logo"><span>Electrical</span><span class="logo-accent">Converters</span></span>
<button aria-label="Close navigation" class="nav-close" type="button">&times;</button>
</div>
<ul class="mobile-nav-list">
${mobileNavHtml.trim()}
</ul>
</div>
</div>`;

const footerTemplate = `<footer class="site-footer" role="contentinfo">
<div class="site-footer__inner">
<div class="footer-brand">
<a class="footer-logo" href="/"><span>Electrical</span><span class="logo-accent">Converters</span></a>
<p class="footer-tagline">Free, client-side conversion instruments for engineers, electricians, and students. No signup, no tracking.</p>
<p class="footer-review">Reviewed by the <a href="/about/">ElectricalConverters editorial team</a> · estimates only.</p>
</div>
<nav class="footer-col" aria-label="Power and current calculators">
<div class="footer-col__label">Power &amp; Current</div>
${Object.values(PAGES).filter(p=>p.clusters.includes('power-current') && p.exists).map(p=>`<a href="${p.href}">${p.label}</a>`).join('\n')}
</nav>
<nav class="footer-col" aria-label="Apparent power and energy calculators">
<div class="footer-col__label">Apparent &amp; Energy</div>
${Object.values(PAGES).filter(p=>p.clusters.includes('apparent') && p.exists).map(p=>`<a href="${p.href}">${p.label}</a>`).join('\n')}
${Object.values(PAGES).filter(p=>p.clusters.includes('energy') && p.exists).map(p=>`<a href="${p.href}">${p.label}</a>`).join('\n')}
</nav>
<nav class="footer-col" aria-label="Motors, battery and guides">
<div class="footer-col__label">Motors &amp; Battery</div>
${Object.values(PAGES).filter(p=>p.clusters.includes('motor') && p.exists).map(p=>`<a href="${p.href}">${p.label}</a>`).join('\n')}
${Object.values(PAGES).filter(p=>p.clusters.includes('battery') && p.exists).map(p=>`<a href="${p.href}">${p.label}</a>`).join('\n')}
</nav>
<nav class="footer-col" aria-label="Site information">
<div class="footer-col__label">Site</div>
<a href="/about/">About &amp; method</a>
<a href="/contact/">Contact</a>
<a href="/privacy/">Privacy</a>
<a href="/learn/ohms-law/">Ohm's Law</a>
<a href="/learn/watts-vs-amps/">Watts vs Amps</a>
</nav>
</div>
<div class="footer-meta">
<p class="footer-copy"><span id="footer-year"></span> ElectricalConverters.com · calculations run entirely in your browser.</p>
<p class="footer-accuracy"><strong>How these work:</strong> each tool applies the standard conversion formula shown on its page — DC, AC single-phase and three-phase where relevant. Results are rounded estimates for reference and education only; always verify against the National Electrical Code (NEC / NFPA 70) and consult a licensed electrician before sizing conductors, breakers, or equipment.</p>
</div>
</footer>`;

// Crawl logic
let editedCount = 0;
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.') && file !== 'tools' && file !== 'assets') {
        walkDir(fullPath);
      }
    } else if (file === 'index.html') {
      let html = fs.readFileSync(fullPath, 'utf8');
      
      // Replace header
      html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, headerTemplate);
      
      // Replace mobile nav
      html = html.replace(/<div aria-hidden="true" class="mobile-nav-overlay" id="mobile-nav">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>/, mobileMenuTemplate);
      
      // Replace footer
      html = html.replace(/<footer class="site-footer" role="contentinfo">[\s\S]*?<\/footer>/, footerTemplate);
      
      fs.writeFileSync(fullPath, html);
      editedCount++;
    }
  }
}

walkDir(ROOT);
console.log('Successfully injected shared nav/footer to ' + editedCount + ' files.');
