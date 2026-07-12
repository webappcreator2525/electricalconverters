import { execSync } from 'child_process';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const outDir = join('C:', 'Users', 'HALUK YILDIZ', '.gemini', 'antigravity', 'brain', 'b7e95721-b0d8-448c-939d-288eec011eb9', 'lighthouse');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const urls = [
  { name: 'home', url: 'http://127.0.0.1:7700/' },
  { name: 'watts-to-amps', url: 'http://127.0.0.1:7700/watts-to-amps/' },
  { name: '1500-watts-to-amps', url: 'http://127.0.0.1:7700/watts-to-amps/1500-watts-to-amps/' },
  { name: 'hp-to-amps', url: 'http://127.0.0.1:7700/hp-to-amps/' },
  { name: 'learn-watts-vs-amps', url: 'http://127.0.0.1:7700/learn/watts-vs-amps/' },
  { name: '404', url: 'http://127.0.0.1:7700/404.html' }
];

console.log('Running Lighthouse audits sequentially...');
const results = [];

for (const { name, url } of urls) {
  const jsonPath = join(outDir, `${name}.json`);
  console.log(`\nAuditing ${name} (${url})...`);
  try {
    execSync(`npx lighthouse "${url}" --output=json --output-path="${jsonPath}" --form-factor=mobile --chrome-flags="--headless --no-sandbox --disable-gpu" --quiet`);
    
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const perf = Math.round((data.categories.performance?.score || 0) * 100);
    const a11y = Math.round((data.categories.accessibility?.score || 0) * 100);
    const bp = Math.round((data.categories['best-practices']?.score || 0) * 100);
    const seo = Math.round((data.categories.seo?.score || 0) * 100);
    
    const lcp = data.audits['largest-contentful-paint']?.numericValue || 0;
    const cls = data.audits['cumulative-layout-shift']?.numericValue || 0;
    const tbt = data.audits['total-blocking-time']?.numericValue || 0;
    
    console.log(`✅ Perf: ${perf} | A11y: ${a11y} | BestPrac: ${bp} | SEO: ${seo}`);
    console.log(`⏱️  LCP: ${lcp.toFixed(0)}ms | CLS: ${cls.toFixed(3)} | TBT: ${tbt.toFixed(0)}ms`);
    
    results.push({ name, url, perf, a11y, bp, seo, lcp, cls, tbt });
  } catch (e) {
    console.log(`❌ Failed to audit ${name}:`, e.message);
  }
}

console.log('\nAll audits complete.');
