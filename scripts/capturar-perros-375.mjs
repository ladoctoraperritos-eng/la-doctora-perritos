// Recorre «Perros» a 375px: lista → ficha → agregar/editar cuidado → límite del plan. Requiere `next start` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const foto = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `docs/revisiones/perros-${n}.png` }); };
await p.goto('http://localhost:3000/app/perros', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Tus perros', { timeout: 15000 });
await foto('1-lista');
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
await p.getByRole('button', { name: /Toffee/ }).first().click(); await p.waitForSelector('text=Botiquín'); await foto('2-ficha');
await p.screenshot({ path: 'docs/revisiones/perros-2b-ficha-completa.png', fullPage: true });
// agregar cuidado con error de validación
await p.getByRole('button', { name: 'Agregar' }).nth(1).click(); await p.waitForTimeout(500);
await p.getByRole('button', { name: 'Agregar', exact: true }).last().click(); await foto('3-hoja-error');
await p.fill('#nombre-cuidado', 'Omega-3'); await p.fill('#dias-cuidado', '20');
await foto('4-hoja-medicamento');
await p.getByRole('button', { name: 'Agregar', exact: true }).last().click(); await p.waitForTimeout(600);
await foto('5-ficha-con-nuevo');
// editar una vacuna
await p.getByRole('button', { name: 'Abrir Vacuna anual' }).click(); await foto('6-hoja-editar-salud');
await p.getByRole('button', { name: 'Lo hice hoy' }).click(); await p.waitForTimeout(600); await foto('7-vacuna-hecha');
// límite del plan
await p.getByRole('button', { name: 'Perros' }).first().click(); await p.waitForSelector('text=Tus perros');
await p.getByRole('button', { name: 'Agregar perro' }).click(); await foto('8-limite');
console.log('scrollWidth2', await p.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
