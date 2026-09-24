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
// Editar datos: foto propia, chip inválido y luego válido
await p.getByRole('button', { name: 'Ahora no' }).click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: /Luna/ }).first().click(); await p.waitForSelector('text=Botiquín');
await p.getByRole('button', { name: /Editar datos de Luna/ }).click(); await p.waitForTimeout(400);
await p.setInputFiles('#foto-perro', 'public/brand/hero-mujer-golden.jpg'); await p.waitForTimeout(900);
await p.fill('#chip-perro', '123'); await p.fill('#responsable-perro', 'Diego Soto'); await p.fill('#telefono-perro', '+52 55 1234 5678');
await p.fill('#notas-perro', 'Sorda del oído izquierdo. Toma condroitina.');
await p.getByRole('button', { name: 'Guardar cambios' }).click(); await foto('9-editar-perro-error');
await p.fill('#chip-perro', '985 112 345 678 902');
await p.getByRole('button', { name: 'Guardar cambios' }).click(); await p.waitForTimeout(600); await foto('10-ficha-luna');
await p.screenshot({ path: 'docs/revisiones/perros-10b-ficha-luna-completa.png', fullPage: true });
console.log('scrollWidth3', await p.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
