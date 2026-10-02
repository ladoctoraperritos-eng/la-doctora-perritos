import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });

// Estado sin veterinario guardado: fallback rojo en la lista y en el detalle.
await p.goto('http://localhost:3000/app/sos', { waitUntil: 'load' });
await p.waitForSelector('text=SOS');
await p.waitForTimeout(300);
await p.screenshot({ path: 'docs/revisiones/sos-375.png' });
await p.getByRole('button', { name: /Ver qué hacer: Golpe de calor/ }).click();
await p.waitForSelector('text=Qué hacer');
await p.waitForTimeout(300);
await p.screenshot({ path: 'docs/revisiones/sos-detalle-375.png' });

// Estado CON veterinario guardado (vía el formulario real): borde-degradado + editar/llamar en la lista.
await p.getByRole('button', { name: 'SOS' }).click();
await p.waitForSelector('text=¿Qué pasó?');
await p.getByRole('button', { name: /Guarda el teléfono de tu veterinario/ }).click();
await p.waitForSelector('text=Tu veterinario de urgencia');
await p.getByPlaceholder('Por ejemplo, Clínica San Roque').fill('Clínica Vet Toffee');
await p.getByPlaceholder('9 1234 5678').fill('9 8765 4321');
await p.getByRole('button', { name: 'Guardar' }).click();
await p.waitForSelector('text=Tu veterinario');
await p.waitForTimeout(300);
await p.screenshot({ path: 'docs/revisiones/sos-con-veterinario-375.png' });

console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
