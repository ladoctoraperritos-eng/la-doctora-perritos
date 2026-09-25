// Captura el resumen para el veterinario a 375px y como PDF. Requiere `next start` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await p.goto('http://localhost:3000/app/perros', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Tus perros', { timeout: 15000 });
await p.getByRole('button', { name: /Toffee/ }).first().click();
await p.waitForSelector('text=Resumen para el veterinario');
await p.screenshot({ path: 'docs/revisiones/resumen-0-boton.png' });
await p.getByRole('link', { name: 'Resumen para el veterinario' }).click();
await p.waitForSelector('text=Tratamiento actual', { timeout: 15000 }); await p.waitForTimeout(600);
await p.screenshot({ path: 'docs/revisiones/resumen-1-arriba.png' });
await p.screenshot({ path: 'docs/revisiones/resumen-1b-completo.png', fullPage: true });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
await p.emulateMedia({ media: 'print' });
await p.pdf({ path: 'docs/revisiones/resumen-toffee.pdf', format: 'A4', printBackground: false });
process.exit(0);
