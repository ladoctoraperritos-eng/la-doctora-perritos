// Screenshots de la landing a 375px, uno por sección, para el revisor visual.
// Requiere `npm run dev` en :3000. Uso: node scripts/capturar-landing-375.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const salida = 'docs/revisiones';
mkdirSync(salida, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

// Recorre la página para disparar las animaciones de entrada (whileInView).
const alto = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < alto; y += 400) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
// El sticky CTA se fija al viewport: se oculta en las capturas por sección.
await page.addStyleTag({ content: '[class*="fixed"]{display:none!important}' });

const bloques = await page.$$('main > *, body > div > *');
let n = 0;
const nombres = [];
for (const b of bloques) {
  const caja = await b.boundingBox();
  if (!caja || caja.height < 40) continue;
  n += 1;
  const nombre = `landing-375-${String(n).padStart(2, '0')}.png`;
  await b.scrollIntoViewIfNeeded();
  await b.screenshot({ path: `${salida}/${nombre}` });
  nombres.push(`${nombre} (${Math.round(caja.height)}px)`);
}
await page.screenshot({ path: `${salida}/landing-375-completa.png`, fullPage: true });
console.log(nombres.join('\n'));
console.log('scrollWidth', await page.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
