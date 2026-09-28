// Captura las pantallas ajustadas tras el feedback: teléfono con país, baño/control, bitácora "Otro",
// bitácora destacada, avisos reordenados, historial con filtros en hoja, resumen con PDF y rango.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const foto = async (n) => { await p.waitForTimeout(400); await p.screenshot({ path: `docs/revisiones/fb-${n}.png` }); };
const cerrarHoja = async () => {
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
};

await p.goto('http://localhost:3000/app/perros', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await p.waitForSelector('text=Tus perros', { timeout: 15000 });
await p.getByRole('button', { name: /Toffee/ }).first().click();
await p.waitForSelector('text=Bitácora');

// 1) Teléfono con país
await p.getByRole('button', { name: /Editar datos de Toffee/ }).click(); await p.waitForTimeout(400);
await p.getByLabel('País').selectOption('+52');
await p.fill('#telefono-perro', '55 1234 5678');
await foto('1-telefono-pais');
await cerrarHoja();

// 2) Baño con nueva etiqueta
await p.getByRole('region', { name: 'Salud' }).getByRole('button', { name: 'Agregar' }).click(); await p.waitForTimeout(400);
await p.getByRole('radio', { name: 'Baño' }).click(); await p.waitForTimeout(300);
await foto('2-bano');
await cerrarHoja();

// 3) Control con nueva etiqueta
await p.getByRole('region', { name: 'Salud' }).getByRole('button', { name: 'Agregar' }).click(); await p.waitForTimeout(400);
await p.getByRole('radio', { name: 'Control' }).click(); await p.waitForTimeout(300);
await foto('3-control');
await cerrarHoja();

// 4) Bitácora con "Otro"
await p.getByRole('region', { name: 'Bitácora' }).getByRole('button', { name: 'Agregar' }).click(); await p.waitForTimeout(400);
await foto('4-nota-otro');
await cerrarHoja();

// 5) Bitácora destacada en la ficha
await p.getByRole('heading', { name: 'Bitácora' }).scrollIntoViewIfNeeded();
await foto('5-bitacora-destacada');

// 6) Historial con filtros en hoja y avatares
await p.goto('http://localhost:3000/app/historial', { waitUntil: 'load' });
await p.waitForSelector('text=Quién hizo qué y cuándo');
await foto('6-historial');
await p.getByRole('button', { name: 'Filtros' }).click(); await p.waitForTimeout(400);
await foto('7-historial-filtros');
await cerrarHoja();

// 7) Avisos reordenados
await p.goto('http://localhost:3000/app/yo', { waitUntil: 'load' });
await p.waitForSelector('text=Avisos');
await p.getByRole('heading', { name: 'Avisos' }).scrollIntoViewIfNeeded();
await foto('8-avisos');

// 8) Resumen: PDF primero + rango de bitácora
await p.goto('http://localhost:3000/app/resumen?perro=p1', { waitUntil: 'load' });
await p.waitForSelector('text=Tratamiento actual'); await p.waitForTimeout(400);
await foto('9-resumen-arriba');
await p.getByRole('radio', { name: '7 días' }).click(); await p.waitForTimeout(300);
await p.getByRole('heading', { name: /Bitácora/ }).scrollIntoViewIfNeeded();
await foto('10-resumen-bitacora-rango');

console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
