const fs = require('fs');
const path = require('path');
const related = require('../public/assets/js/related.js');

const publicDir = path.join(__dirname, '../public');

// --- 1. GENERATE SHARED HTML BLOCKS ---
const CLUSTERS = related.CLUSTERS;
const PAGES = related.PAGES;

function getPagesInCluster(clusterId) {
    return Object.keys(PAGES).filter(k => PAGES[k].clusters.includes(clusterId) && PAGES[k].exists);
}

// Generate Header Nav List
let headerNavList = '<ul class="nav-list">\n';
Object.keys(CLUSTERS).forEach(cid => {
    const c = CLUSTERS[cid];
    headerNavList += `<li class="nav-group">\n<button aria-controls="menu-${cid}" aria-expanded="false" class="nav-trigger" id="trigger-${cid}" type="button">${c.name.replace(' & ', ' &amp; ')} <span aria-hidden="true" class="nav-caret"></span></button>\n<div class="nav-panel" id="menu-${cid}">\n`;
    getPagesInCluster(cid).forEach(pk => {
        headerNavList += `<a class="nav-panel__link" href="${PAGES[pk].href}">${PAGES[pk].label}</a>\n`;
    });
    if (cid === 'power-current') {
        headerNavList += `<div class="nav-panel__sub">Guides</div>\n<a class="nav-panel__link nav-panel__link--sub" href="/learn/ohms-law/">Ohm's Law</a>\n<a class="nav-panel__link nav-panel__link--sub" href="/learn/watts-vs-amps/">Watts vs Amps</a>\n`;
    }
    if (cid === 'safety') {
        headerNavList += `<p class="nav-panel__note">Wire gauge, breaker size and voltage drop are coming soon. Start by <a href="/watts-to-amps/">finding amps with watts to amps</a>.</p>\n`;
    }
    headerNavList += `</div>\n</li>\n`;
});
headerNavList += '</ul>';

// Generate Mobile Nav
let mobileNavList = '<ul class="mobile-nav-list">\n';
Object.keys(CLUSTERS).forEach(cid => {
    const c = CLUSTERS[cid];
    mobileNavList += `<li class="m-group">\n<div class="m-group__label">${c.name.replace(' & ', ' &amp; ')}</div>\n`;
    if (cid === 'safety') {
        mobileNavList += `<p class="m-note">Wire gauge, breaker size and voltage drop are coming soon. Start by <a href="/watts-to-amps/">finding amps with watts to amps</a>.</p>\n`;
    } else {
        getPagesInCluster(cid).forEach(pk => {
            mobileNavList += `<a class="nav-link" href="${PAGES[pk].href}">${PAGES[pk].label}</a>\n`;
        });
    }
    mobileNavList += `</li>\n`;
});
mobileNavList += `<li class="m-group">\n<div class="m-group__label">Guides</div>\n<a class="nav-link" href="/learn/ohms-law/">Ohm's Law</a>\n<a class="nav-link" href="/learn/watts-vs-amps/">Watts vs Amps</a>\n</li>\n</ul>`;

// Generate Footer Nav
let footerCols = `
<nav class="footer-col" aria-label="Power and current calculators">
<div class="footer-col__label">Power &amp; Current</div>\n`;
getPagesInCluster('power-current').forEach(pk => {
    footerCols += `<a href="${PAGES[pk].href}">${PAGES[pk].label}</a>\n`;
});
footerCols += `</nav>\n<nav class="footer-col" aria-label="Apparent power and energy calculators">\n<div class="footer-col__label">Apparent &amp; Energy</div>\n`;
getPagesInCluster('apparent').concat(getPagesInCluster('energy')).forEach(pk => {
    footerCols += `<a href="${PAGES[pk].href}">${PAGES[pk].label}</a>\n`;
});
footerCols += `</nav>\n<nav class="footer-col" aria-label="Motors, battery and guides">\n<div class="footer-col__label">Motors &amp; Battery</div>\n`;
getPagesInCluster('motor').concat(getPagesInCluster('battery')).forEach(pk => {
    footerCols += `<a href="${PAGES[pk].href}">${PAGES[pk].label}</a>\n`;
});
footerCols += `</nav>\n<nav class="footer-col" aria-label="Site information">\n<div class="footer-col__label">Site</div>\n<a href="/about/">About &amp; method</a>\n<a href="/contact/">Contact</a>\n<a href="/privacy/">Privacy</a>\n<a href="/learn/ohms-law/">Ohm's Law</a>\n<a href="/learn/watts-vs-amps/">Watts vs Amps</a>\n</nav>`;

function getRelatedBlock(pageKey) {
    if (!pageKey || !PAGES[pageKey]) return '';
    const page = PAGES[pageKey];
    const cId = page.clusters && page.clusters[0];
    if (!cId) return '';
    const cluster = CLUSTERS[cId];
    
    let relatedKeys = getPagesInCluster(cId).filter(k => k !== pageKey);
    // If hub, add bridges
    if (cluster.hub === pageKey && cluster.bridges) {
        relatedKeys = relatedKeys.concat(cluster.bridges.filter(k => PAGES[k] && PAGES[k].exists));
    }
    // Limit to 5
    relatedKeys = relatedKeys.slice(0, 5);
    
    let html = `<section class="related-conversions" aria-labelledby="related-conversions-heading">\n<h2 id="related-conversions-heading">Related conversions</h2>\n<p class="related-conversions__intro">This calculator is part of our <strong>${cluster.name.replace(' & ', ' &amp; ')}</strong> tools. Jump to a related conversion:</p>\n<ul class="rel-list">\n`;
    relatedKeys.forEach(k => {
        html += `<li class="rel-item"><a class="rel-item__link" href="${PAGES[k].href}">${PAGES[k].anchor}</a><span class="rel-item__desc">${PAGES[k].blurb}</span></li>\n`;
    });
    html += `</ul>\n`;
    
    if (page.learn && page.learn.length > 0) {
        const learn = related.LEARN[page.learn[0]];
        html += `<p class="related-conversions__learn">Background reading: <a href="${learn.href}">${learn.anchor}</a>.</p>\n`;
    }
    html += `</section>`;
    return html;
}

// --- 2. TRAVERSE AND UPDATE HTML FILES ---

const CACHE_VERSION = 'v=phase11'; // Update to bump cache

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            updateFile(fullPath);
        }
    });
}

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update Header Nav List
    content = content.replace(/<ul class="nav-list">[\s\S]*?<\/ul>/, headerNavList);

    // 2. Update Mobile Nav List
    content = content.replace(/<ul class="mobile-nav-list">[\s\S]*?<\/ul>/, mobileNavList);

    // 3. Update Footer Cols
    content = content.replace(/<nav class="footer-col" aria-label="Power and current calculators">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-meta">/, footerCols + '\n</div>\n<div class="footer-meta">');

    // 4. Update Cache Strings
    content = content.replace(/converters\.js\?v=[a-z0-9]+/g, `converters.js?${CACHE_VERSION}`);
    content = content.replace(/calculators\.js\?v=[a-z0-9]+/g, `calculators.js?${CACHE_VERSION}`);
    content = content.replace(/site\.js\?v=[a-z0-9]+/g, `site.js?${CACHE_VERSION}`);
    content = content.replace(/main\.css\?v=[a-z0-9]+/g, `main.css?${CACHE_VERSION}`);

    // 5. Update Related Blocks
    const match = content.match(/<body data-calc="([^"]+)">/);
    if (match) {
        const pageKey = match[1];
        const relatedHtml = getRelatedBlock(pageKey);
        if (relatedHtml) {
            content = content.replace(/<!-- related:start -->[\s\S]*?<!-- related:end -->/, `<!-- related:start -->\n${relatedHtml}\n<!-- related:end -->`);
        }

        // 6. Update Voltage Blocks
        if (related.VOLTAGES && related.VOLTAGES[pageKey]) {
            const vData = related.VOLTAGES[pageKey];
            let vHtml = `<section class="related-conversions" aria-labelledby="voltage-conversions-heading">\n<h2 id="voltage-conversions-heading">Calculate by Voltage</h2>\n<p class="related-conversions__intro">Jump to a pre-filled calculator for common system voltages:</p>\n<ul class="rel-list">\n`;
            vData.forEach(v => {
                vHtml += `<li class="rel-item"><a class="rel-item__link" href="${v.href}">${v.anchor}</a><span class="rel-item__desc">${v.blurb || ''}</span></li>\n`;
            });
            vHtml += `</ul>\n</section>`;
            content = content.replace(/<!-- voltages:start -->[\s\S]*?<!-- voltages:end -->/, `<!-- voltages:start -->\n${vHtml}\n<!-- voltages:end -->`);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

processDir(publicDir);
console.log('HTML files updated successfully.');
