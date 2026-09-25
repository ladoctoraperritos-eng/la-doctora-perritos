// Recorre «Yo» a 375px: completa, invitar, límite del plan, descarga. Requiere `next start` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce', acceptDownloads: true });
const foto = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `docs/revisiones/yo-${n}.png` }); };
await p.goto('http://localhost:3000/app/yo', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Quienes cuidan contigo', { timeout: 15000 });
await foto('1-arriba');
await p.screenshot({ path: 'docs/revisiones/yo-1b-completa.png', fullPage: true });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
// límite: el plan Esencial admite 2 personas y ya hay 2
await p.getByRole('button', { name: 'Invitar a alguien' }).click(); await foto('2-limite');
await p.getByRole('button', { name: 'Ahora no' }).click(); await p.waitForTimeout(400);
// invitar en plan Familia
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('ldp-app-v1') || 'null'); });
// editar a Diego con correo inválido
await p.getByRole('button', { name: /^Diego/ }).click(); await p.waitForTimeout(400);
await p.fill('#correo-tutor', 'diego@'); await p.getByRole('button', { name: 'Guardar cambios' }).click(); await foto('3-editar-error');
await p.fill('#correo-tutor', 'diego@correo.com'); await p.getByRole('button', { name: 'Guardar cambios' }).click(); await p.waitForTimeout(500);
// interruptor + descarga
await p.getByRole('switch', { name: /Antes de una vacuna/ }).click();
const [d] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: /Descargar el historial/ }).click()]);
console.log('descarga', d.suggestedFilename());
await p.getByRole('button', { name: 'Borrar todos mis datos' }).click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'Borrar todos mis datos' }).scrollIntoViewIfNeeded().catch(() => {});
await foto('4-borrar-datos');
const q = await b.newPage({ viewport: { width: 360, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await q.goto('http://localhost:3000/app/yo', { waitUntil: 'load' });
await q.evaluate(() => localStorage.clear()); await q.reload({ waitUntil: 'load' });
await q.waitForSelector('text=Quienes cuidan contigo'); await q.waitForTimeout(500);
console.log('scrollWidth360', await q.evaluate(() => document.documentElement.scrollWidth));
await q.screenshot({ path: 'docs/revisiones/yo-360.png' });
process.exit(0);
