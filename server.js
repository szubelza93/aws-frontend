const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('node:http');
const fs = require('node:fs');

const PORT = Number(process.env.PORT) || 3000;
const API_BASE_URL = (process.env.API_BASE_URL || 'http://192.168.1.10:3000').replace(/\/+$/, '');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Ruta dinamica: api-config.js se genera desde .env en cada request
  // Asi el navegador SI recibe el valor del .env, sin tener que editar 2 archivos
  if (urlPath === '/api-config.js') {
    const js = `window.API_BASE_URL = '${API_BASE_URL}';\n\nwindow.apiUrl = (path) => {\n    const baseUrl = window.API_BASE_URL.replace(/\\/+$/, '');\n    return baseUrl + path;\n};\n`;
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-cache' });
    return res.end(js);
  }

  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(__dirname, filePath);

  // Seguridad: no salir de la carpeta
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No encontrado: ' + urlPath);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend corriendo en http://192.168.1.20:${PORT} (local: http://localhost:${PORT})`);
  console.log(`API_BASE_URL (desde .env) = ${API_BASE_URL}`);
});