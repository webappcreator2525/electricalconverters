import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public');

function walk(dir, results = []) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith('.') || e === 'node_modules' || e === 'tools') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, results);
    else if (e === 'index.html') results.push(full);
  }
  return results;
}

const issues = [];
const pages = walk(ROOT);

pages.forEach(filePath => {
  const rel = filePath.replace(ROOT, '').replace(/\\/g, '/');
  const html = readFileSync(filePath, 'utf8');
  
  // Extract all JSON-LD blocks
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      blocks.push(obj);
    } catch(e) {
      issues.push({ page: rel, error: 'INVALID JSON in JSON-LD: ' + e.message.substring(0,80) });
    }
  }
  
  if (blocks.length === 0 && !rel.includes('404')) {
    issues.push({ page: rel, error: 'No JSON-LD blocks found' });
    return;
  }
  
  const types = blocks.map(b => b['@type']);
  
  // Check for fake ratings
  if (JSON.stringify(blocks).includes('aggregateRating')) {
    issues.push({ page: rel, error: 'BANNED: aggregateRating in JSON-LD' });
  }
  
  // Calculator pages should have WebApplication + BreadcrumbList
  const isCalc = !rel.startsWith('/learn') && !rel.includes('privacy') && !rel.includes('about') && !rel.includes('contact') && rel !== '/index.html' && rel !== '/404.html';
  if (isCalc) {
    if (!types.includes('WebApplication') && !types.includes('FAQPage')) {
      issues.push({ page: rel, error: 'WARN: no WebApplication or FAQPage schema' });
    }
    if (!types.includes('BreadcrumbList')) {
      if (rel !== '/index.html') {
        issues.push({ page: rel, error: 'MISSING: BreadcrumbList schema' });
      }
    }
  }
  
  // Homepage should have WebSite + Organization
  if (rel === '/index.html' || rel === 'index.html') {
    if (!types.includes('WebSite')) issues.push({ page: rel, error: 'MISSING: WebSite schema' });
    if (!types.includes('Organization')) issues.push({ page: rel, error: 'MISSING: Organization schema' });
  }
});

console.log('JSON-LD Validation Results');
console.log('==========================');
console.log('Pages checked:', pages.length);
if (issues.length === 0) {
  console.log('✅ Zero JSON-LD issues found');
} else {
  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log('  ' + i.page + ':', i.error));
}
