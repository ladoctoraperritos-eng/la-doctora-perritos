// Genera el logo definitivo (campana): PNG con fondo transparente recortado y el ícono de la app.
// Uso: node scripts/logo-final.mjs  (parte de public/brand/logo-campana.png)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';

const server = http.createServer((req, res) => {
  if (req.url === '/logo.png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    fs.createReadStream('public/brand/logo-campana.png').pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<body></body>');
  }
}).listen(4597);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4597/');

const { logo, icono } = await page.evaluate(async () => {
  const img = new Image();
  img.src = '/logo.png';
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, W, H);
  const px = d.data;
  const esBlanco = (i) => px[i] > 244 && px[i + 1] > 244 && px[i + 2] > 244;
  // Relleno desde los bordes: solo el blanco EXTERIOR pasa a transparente (el blanco de los perros no se toca).
  const visto = new Uint8Array(W * H);
  const cola = [];
  const meter = (x, y) => {
    const k = y * W + x;
    if (x < 0 || y < 0 || x >= W || y >= H || visto[k] || !esBlanco(k * 4)) return;
    visto[k] = 1; cola.push(k);
  };
  for (let x = 0; x < W; x++) { meter(x, 0); meter(x, H - 1); }
  for (let y = 0; y < H; y++) { meter(0, y); meter(W - 1, y); }
  while (cola.length) {
    const k = cola.pop();
    const x = k % W, y = (k / W) | 0;
    meter(x + 1, y); meter(x - 1, y); meter(x, y + 1); meter(x, y - 1);
  }
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let k = 0; k < W * H; k++) {
    if (visto[k]) { px[k * 4 + 3] = 0; continue; }
    const x = k % W, y = (k / W) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  ctx.putImageData(d, 0, 0);
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const out = document.createElement('canvas');
  const escala = 800 / w;
  out.width = 800; out.height = Math.round(h * escala);
  out.getContext('2d').drawImage(c, minX, minY, w, h, 0, 0, out.width, out.height);
  // Ícono cuadrado 256: logo centrado sobre el fondo de la marca.
  const ic = document.createElement('canvas');
  ic.width = 256; ic.height = 256;
  const g = ic.getContext('2d');
  g.fillStyle = '#f4f7f6'; g.fillRect(0, 0, 256, 256);
  const lw = 232, lh = Math.round(h * (lw / w));
  g.drawImage(c, minX, minY, w, h, 12, Math.round((256 - lh) / 2), lw, lh);
  return { logo: out.toDataURL('image/png'), icono: ic.toDataURL('image/png') };
});

const b64 = (s) => Buffer.from(s.split(',')[1], 'base64');
fs.writeFileSync('public/brand/logo.png', b64(logo));
fs.writeFileSync('app/icon.png', b64(icono));
console.log('logo.png y app/icon.png listos');
process.exit(0);
