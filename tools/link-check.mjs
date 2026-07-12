/**
 * link-check.mjs - Check all internal hrefs in HTML files
 * Verifies every internal link resolves to an actual file on disk
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'tools') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, results);
    else if (entry === 'index.html' || entry === '404.html') results.push(full);
  }
  return results;
}

const files = walk(ROOT);
const broken = [];
const checked = new Set();

function resolveLink(href, fromFile) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://')) return null;
  
  let path = href.split('?')[0].split('#')[0];
  if (!path) return null;
  
  // Absolute path from root
  if (path.startsWith('/')) {
    return join(ROOT, path);
  }
  // Relative path
  return resolve(dirname(fromFile), path);
}

function fileExists(path) {
  if (existsSync(path)) return true;
  // Try as directory with index.html
  const withIndex = join(path, 'index.html');
  if (existsSync(withIndex)) return true;
  // Try adding index.html if path ends with /
  return false;
}

let totalLinks = 0;
let brokenCount = 0;

for (const filePath of files) {
  const html = readFileSync(filePath, 'utf8');
  const rel = filePath.replace(ROOT, '').replace(/\\/g, '/');
  
  // Extract all href attributes
  const hrefPattern = /href="([^"]+)"/g;
  let match;
  const pageIssues = [];
  
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1];
    totalLinks++;
    
    const resolved = resolveLink(href, filePath);
    if (resolved === null) continue; // external or anchor
    
    if (!fileExists(resolved)) {
      const resolvedNorm = resolved.replace(/\\/g, '/');
      if (!checked.has(resolvedNorm)) {
        pageIssues.push({ href, resolved: resolvedNorm });
        checked.add(resolvedNorm);
        brokenCount++;
      }
    }
  }
  
  if (pageIssues.length > 0) {
    broken.push({ page: rel, links: pageIssues });
  }
}

console.log('\n' + '='.repeat(70));
console.log('Internal Link Check');
console.log('='.repeat(70));
console.log(`Scanned ${files.length} pages, checked ${totalLinks} links`);

if (broken.length === 0) {
  console.log('✅ Zero broken internal links!');
} else {
  console.log(`\n❌ ${brokenCount} broken internal links found:\n`);
  for (const { page, links } of broken) {
    console.log(`  ${page}:`);
    for (const { href, resolved } of links) {
      console.log(`    - href="${href}" → ${resolved}`);
    }
  }
  process.exitCode = 1;
}
