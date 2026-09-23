const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const TIPOS = {
  '.html':'text/html; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.gif':'image/gif'
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // la trivia
  if (url === '/' || url === '/trivia'){
    fs.readFile(path.join(__dirname, 'trivia.html'), (err, data) => {
      if (err){ res.writeHead(500); return res.end('Error cargando la trivia'); }
      res.writeHead(200, { 'Content-Type': TIPOS['.html'], 'Cache-Control': 'no-store' });
      res.end(data);
    });
    return;
  }

  // logos y otros estáticos (sin salir de la carpeta)
  const destino = path.join(__dirname, url);
  if (!destino.startsWith(__dirname)){ res.writeHead(403); return res.end('No'); }

  fs.readFile(destino, (err, data) => {
    if (err){ res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('Trivia TIC Solidario -> http://localhost:' + PORT);
  console.log('Logos: poner los archivos en la carpeta  logos/');
});
