// Renderiza una página del ebook (PDF) a PNG con pdf.js dentro de Chromium.
// Uso: node scripts/portada-ebook.mjs "<ruta.pdf>" <pagina> <salida.png>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';

const [pdfPath, pagina = '1', salida = 'public/brand/portada-ebook.png'] = process.argv.slice(2);
fs.mkdirSync('public/brand', { recursive: true });

const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff"><canvas id="c"></canvas>
<script type="module">
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
const pdf = await pdfjs.getDocument('/ebook.pdf').promise;
const page = await pdf.getPage(${Number(pagina)});
const vp = page.getViewport({ scale: 1.6 });
const c = document.getElementById('c'); c.width = vp.width; c.height = vp.height;
await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
window.__listo = { paginas: pdf.numPages, w: vp.width, h: vp.height };
</script>`;

const server = http.createServer((req, res) => {
  if (req.url === '/ebook.pdf') {
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}).listen(4599);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4599/', { waitUntil: 'load' });
await page.waitForFunction('window.__listo', null, { timeout: 120000 });
const info = await page.evaluate('window.__listo');
await page.locator('#c').screenshot({ path: salida, ...(salida.endsWith('.jpg') ? { type: 'jpeg', quality: 82 } : {}) });
console.log(JSON.stringify(info), salida);
server.close();
process.exit(0);
