// Recorre «Historial» a 375px: completo, filtrado por persona, sin resultados, vacío. Requiere `next start` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const foto = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `docs/revisiones/historial-${n}.png` }); };
await p.goto('http://localhost:3000/app/historial', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Quién hizo qué y cuándo', { timeout: 15000 });
await foto('1-completo');
await p.screenshot({ path: 'docs/revisiones/historial-1b-completo-largo.png', fullPage: true });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
await p.getByRole('radio', { name: 'Diego' }).click(); await foto('2-diego');
await p.getByRole('radio', { name: 'Salud' }).click(); await foto('3-sin-resultados');
await p.getByRole('button', { name: 'Quitar filtros' }).first().click();
await p.getByRole('button', { name: 'Ver más días' }).click({ trial: true }).catch(() => {});
// vacío: sin registros
await p.evaluate(() => localStorage.setItem('ldp-app-v1', JSON.stringify({ plan: 'esencial', perros: [{ id: 'p1', nombre: 'Toffee' }], tutores: [{ id: 't1', nombre: 'Tú' }], yo: 't1', cuidados: [{ id: 'c1', perroId: 'p1', tipo: 'medicamento', nombre: 'Apoquel', detalle: '', hora: '20:00' }], registros: [] })));
await p.reload({ waitUntil: 'load' }); await p.waitForSelector('text=Aún no hay registros'); await foto('4-vacio');
// 360px
const q = await b.newPage({ viewport: { width: 360, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await q.goto('http://localhost:3000/app/historial', { waitUntil: 'load' });
await q.evaluate(() => localStorage.clear()); await q.reload({ waitUntil: 'load' });
await q.waitForSelector('text=Esta semana'); await q.waitForTimeout(500);
console.log('scrollWidth360', await q.evaluate(() => document.documentElement.scrollWidth));
await q.screenshot({ path: 'docs/revisiones/historial-360.png' });
process.exit(0);
