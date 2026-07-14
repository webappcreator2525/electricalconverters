const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const PORT = 7700;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'text/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0].split('#')[0];
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  
  const filePath = path.join(ROOT, urlPath);
  
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch (e) {
    // Try adding index.html
    try {
      const data = fs.readFileSync(path.join(filePath, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    } catch (e2) {
      try {
        const data = fs.readFileSync(path.join(ROOT, '404.html'));
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      } catch (e3) {
        res.writeHead(404);
        res.end('Not found: ' + urlPath);
      }
    }
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:' + PORT);
});
