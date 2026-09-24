// Captura «Hoy» a 375 y 360px con datos de ejemplo y con datos del onboarding. Requiere `next start` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const nuevo = async (ancho) => b.newPage({ viewport: { width: ancho, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const p = await nuevo(375);
await p.goto('http://localhost:3000/app', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Siguiente cuidado', { timeout: 15000 });
await p.waitForTimeout(700);
await p.screenshot({ path: 'docs/revisiones/hoy-375.png' });
await p.screenshot({ path: 'docs/revisiones/hoy-completo.png', fullPage: true });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
await p.getByRole('button', { name: 'Marcar como hecho' }).click(); await p.waitForTimeout(900);
await p.screenshot({ path: 'docs/revisiones/hoy-hecho.png' });
await p.getByRole('radio', { name: 'Luna' }).click(); await p.waitForTimeout(500);
await p.screenshot({ path: 'docs/revisiones/hoy-luna.png' });
// Con lo que contó en el onboarding
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('ldp-onboarding-v2', JSON.stringify({ nombre: 'Toffee', olvidos: ['medicamentos', 'alimento', 'quien'], medNombre: 'Apoquel', medFrecuencia: '1_dia', medHora: 'noche', stockDias: '15', comidaDias: '7', comidaAviso: '5', controlTipo: null, controlCuando: null, cuidadores: 'pareja', avisos: 'si', correo: '', primeraVictoria: false }));
});
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Hoy con Toffee', { timeout: 15000 }); await p.waitForTimeout(700);
await p.screenshot({ path: 'docs/revisiones/hoy-onboarding.png' });
// 360px y todo hecho
const q = await nuevo(360);
await q.goto('http://localhost:3000/app', { waitUntil: 'load' });
await q.evaluate(() => localStorage.clear()); await q.reload({ waitUntil: 'load' });
await q.waitForSelector('text=Siguiente cuidado', { timeout: 15000 }); await q.waitForTimeout(500);
console.log('scrollWidth360', await q.evaluate(() => document.documentElement.scrollWidth));
await q.screenshot({ path: 'docs/revisiones/hoy-360.png' });
for (let i = 0; i < 8; i++) { const btn = q.getByRole('button', { name: 'Marcar como hecho' }); if (await btn.count()) { await btn.click(); await q.waitForTimeout(250); } }
await q.waitForTimeout(500);
await q.screenshot({ path: 'docs/revisiones/hoy-aldia.png' });
process.exit(0);
