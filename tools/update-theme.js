const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('.lighthouse-tmp')) walk(full);
    } else if (file === 'index.html') {
      let html = fs.readFileSync(full, 'utf8');
      html = html.replace(/<meta content=\"#0b0e13\" name=\"theme-color\"\/>/g, '<meta content=\"#f4f6f8\" name=\"theme-color\"/>');
      fs.writeFileSync(full, html);
    }
  }
}
walk('.');
