// Compone el logo de la creadora (tres perros) cambiando el símbolo del corazón por otros.
// Uso: node scripts/logo-simbolos.mjs   → public/brand/logo-<variante>.png
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';

fs.mkdirSync('_tmp', { recursive: true });

const simbolos = {
  campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pastilla: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  calendario: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 9h18"/><path d="m9 15 2 2 4-4"/>',
};

const variante = (nombre) => `
<div class="v" data-nombre="${nombre}">
  <img src="/logo-base.webp" width="1250" height="1250">
  <div style="position:absolute;left:400px;top:1015px;width:470px;height:120px;background:#fff"></div>
  <div style="position:absolute;left:442px;top:770px;width:370px;height:370px;border-radius:50%;background:#0b5f5a;
       box-shadow:0 0 0 12px #fff, 0 0 0 20px #0b5f5a;display:flex;align-items:center;justify-content:center">
    <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#fbf6ee" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${simbolos[nombre]}</svg>
  </div>
</div>`;

const html = `<!doctype html><style>
body{margin:0;background:#fff}.v{position:relative;width:1250px;height:1250px;overflow:hidden}.v img{display:block}
</style><body>${Object.keys(simbolos).map(variante).join('')}</body>`;

const server = http.createServer((req, res) => {
  if (req.url === '/logo-base.webp') {
    res.writeHead(200, { 'Content-Type': 'image/webp' });
    fs.createReadStream('public/brand/logo-base.webp').pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}).listen(4598);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1250, height: 1250 } });
await page.goto('http://localhost:4598/', { waitUntil: 'load' });
await page.waitForTimeout(500);
const items = await page.$$('.v');
for (const it of items) {
  const n = await it.getAttribute('data-nombre');
  await it.screenshot({ path: `public/brand/logo-${n}.png` });
}
process.exit(0);
