// Captura las pantallas del tour (vista-previa-app.html) como PNG para la landing.
// Uso: node scripts/capturar-pantallas.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const salida = 'public/screens';
mkdirSync(salida, { recursive: true });
const archivo = pathToFileURL(path.resolve('vista-previa-app.html')).href;
const nombres = ['hoy', 'onboarding', 'paywall', 'ficha', 'familia', 'perros'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 3400 }, deviceScaleFactor: 2 });
await page.goto(archivo, { waitUntil: 'load', timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
const telefonos = await page.$$('.telefono');
for (let i = 0; i < telefonos.length; i++) {
  const b = await telefonos[i].boundingBox();
  await page.screenshot({ path: `${salida}/${nombres[i]}.png`, clip: { x: b.x + 10, y: b.y + 10, width: b.width - 20, height: b.height - 20 } });
}
console.log(`${telefonos.length} pantallas guardadas en ${salida}`);
process.exit(0); // cierra el navegador con el proceso (browser.close() se cuelga en este equipo)
console.log(`${telefonos.length} pantallas guardadas en ${salida}`);
