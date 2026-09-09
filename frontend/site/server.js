const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 3000);
const siteRoot = path.join(__dirname, '..', 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let filePath = req.url.split('?')[0];
  if (filePath === '/' || filePath === '') filePath = '/index.html';
  const fullPath = path.join(siteRoot, decodeURIComponent(filePath));
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (!path.extname(filePath)) {
        return fs.readFile(path.join(siteRoot, 'index.html'), (indexError, indexContent) => {
          if (indexError) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('Application shell unavailable');
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent);
        });
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Static site running at http://localhost:${port}`);
});
