import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const filePath = join(__dirname, relative);
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = mime[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };
    if (imageExts.has(ext)) {
      headers['Cache-Control'] = 'public, max-age=86400';
      headers['Accept-Ranges'] = 'bytes';
      headers['Content-Length'] = data.length;
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-store';
    }
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
