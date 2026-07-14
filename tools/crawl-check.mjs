/**
 * crawl-check.mjs — electricalconverters.com site-wide QA script
 * Checks every index.html for required SEO/technical elements
 * Usage: node crawl-check.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public'); // site root (one level up from tools/)

// Pages exempt from breadcrumb / Related-conversions requirements
const EXEMPT_PAGES = ['index.html', 'privacy/index.html', 'contact/index.html', 'about/index.html', '404.html'];
// Pages exempt from Related-conversions (learn pages have different structure)
const NO_RELATED_PAGES = ['privacy/index.html', 'contact/index.html', 'about/index.html', '404.html'];
// Pages exempt from breadcrumbs
const NO_BREADCRUMB_PAGES = ['index.html', 'privacy/index.html', 'contact/index.html', 'about/index.html', '404.html'];

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, results);
    else if (entry === 'index.html' || entry === '404.html') results.push(full);
  }
  return results;
}

const files = walk(ROOT);
const failures = [];
const warnings = [];
let passCount = 0;

const checks = {
  canonical: (html) => /<link[^>]+rel="canonical"/.test(html),
  ogImage: (html) => /og:image/.test(html),
  twitterCard: (html) => /twitter:card/.test(html),
  robotsMeta: (html) => /name="robots"/.test(html),
  favicon: (html) => /rel="icon"/.test(html),
  manifest: (html) => /rel="manifest"/.test(html),
  singleH1: (html) => {
    const matches = html.match(/<h1[\s>]/gi);
    return matches && matches.length === 1;
  },
  noFakeRatings: (html) => !html.includes('aggregateRating'),
  webAppJsonLD: (html) => html.includes('"WebApplication"'),
  breadcrumbJsonLD: (html) => html.includes('"BreadcrumbList"'),
  reviewerLine: (html) => /ElectricalConverters editorial team|Reviewed by/.test(html),
  lastUpdated: (html) => /Last updated/.test(html),
  safetyDisclaimer: (html) => /licensed electrician|National Electrical Code|NEC/.test(html),
};

// Checks only for calculator/content pages (not utility pages)
const contentChecks = {
  relatedConversions: (html) => /related-conversions|Related conversions/.test(html),
  breadcrumbNav: (html) => /aria-label="Breadcrumb"/.test(html),
};

console.log(`\n${'='.repeat(70)}`);
console.log('electricalconverters.com — Site-Wide QA Crawl');
console.log(`${'='.repeat(70)}\n`);
console.log(`Scanning ${files.length} HTML files...\n`);

for (const filePath of files) {
  const rel = relative(ROOT, filePath).replace(/\\/g, '/');
  const html = readFileSync(filePath, 'utf8');
  const pageFailures = [];
  const pageWarnings = [];
  
  const isUtility = EXEMPT_PAGES.some(e => rel === e || rel.endsWith('/' + e));
  const is404 = rel === '404.html';
  const isIndex = rel === 'index.html';
  const isLearn = rel.startsWith('learn/');
  const isChild = (rel.match(/\//g) || []).length >= 2; // e.g. watts-to-amps/1500-.../index.html

  // Universal checks (all pages)
  if (!is404) {
    if (!checks.canonical(html)) pageFailures.push('MISSING: canonical tag');
    if (!checks.ogImage(html)) pageFailures.push('MISSING: og:image');
    if (!checks.twitterCard(html)) pageFailures.push('MISSING: twitter:card');
    if (!checks.robotsMeta(html)) pageFailures.push('MISSING: robots meta');
    if (!checks.favicon(html)) pageFailures.push('MISSING: favicon link');
    if (!checks.manifest(html)) pageFailures.push('MISSING: manifest link');
  }

  // H1 count (all except 404)
  if (!is404) {
    if (!checks.singleH1(html)) {
      const count = (html.match(/<h1[\s>]/gi) || []).length;
      pageFailures.push(`H1 count: ${count} (expected exactly 1)`);
    }
  }

  // No fake ratings anywhere
  if (!checks.noFakeRatings(html)) pageFailures.push('BANNED: aggregateRating found in JSON-LD');

  // WebApplication JSON-LD (calculator pages only, not utility/learn/child pages)
  if (!isUtility && !isLearn && !isChild && !is404) {
    if (!checks.webAppJsonLD(html)) pageWarnings.push('WARN: no WebApplication JSON-LD');
  }

  // BreadcrumbList JSON-LD (non-utility, non-404)
  if (!is404 && !NO_BREADCRUMB_PAGES.includes(rel)) {
    if (!checks.breadcrumbJsonLD(html)) pageFailures.push('MISSING: BreadcrumbList JSON-LD');
    if (!contentChecks.breadcrumbNav(html)) pageFailures.push('MISSING: breadcrumb nav');
  }

  // Related conversions (calculator/content pages)
  if (!NO_RELATED_PAGES.includes(rel) && !is404) {
    if (!contentChecks.relatedConversions(html)) pageWarnings.push('WARN: no Related-conversions block');
  }

  // Reviewer/last-updated/safety (calculator pages)
  if (!isUtility && !is404) {
    if (!checks.reviewerLine(html)) pageWarnings.push('WARN: no reviewer line');
    if (!checks.lastUpdated(html)) pageWarnings.push('WARN: no last-updated line');
    if (!checks.safetyDisclaimer(html)) pageWarnings.push('WARN: no safety disclaimer');
  }

  if (pageFailures.length === 0 && pageWarnings.length === 0) {
    passCount++;
    console.log(`  ✅ ${rel}`);
  } else {
    if (pageFailures.length > 0) {
      failures.push({ page: rel, issues: pageFailures });
      console.log(`  ❌ ${rel}`);
      pageFailures.forEach(f => console.log(`       FAIL: ${f}`));
    }
    if (pageWarnings.length > 0) {
      warnings.push({ page: rel, issues: pageWarnings });
      if (pageFailures.length === 0) {
        passCount++;
        console.log(`  ⚠️  ${rel}`);
      }
      pageWarnings.forEach(w => console.log(`       ${w}`));
    }
  }
}

console.log(`\n${'='.repeat(70)}`);
console.log(`SUMMARY: ${files.length} pages scanned`);
console.log(`  ✅ PASS: ${passCount}`);
console.log(`  ❌ FAIL: ${failures.length} pages with hard failures`);
console.log(`  ⚠️  WARN: ${warnings.length} pages with warnings`);
console.log(`${'='.repeat(70)}\n`);

if (failures.length > 0) {
  console.log('FAILURES REQUIRING FIX:\n');
  failures.forEach(({ page, issues }) => {
    console.log(`  ${page}:`);
    issues.forEach(i => console.log(`    - ${i}`));
  });
  process.exitCode = 1;
} else {
  console.log('✅ Zero hard failures — all pages pass required checks.');
}
