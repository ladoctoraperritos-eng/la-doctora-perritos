// Recorre onboarding → paywall → login a 375px y guarda una captura por pantalla en docs/revisiones/.
// Las preguntas se capturan con movimiento reducido (sin avance automático) para que cada archivo
// muestre exactamente su pantalla. Requiere `npm run dev` en :3000.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const foto = async (n) => { await p.waitForTimeout(500); await p.screenshot({ path: `docs/revisiones/onboarding-${n}.png` }); };
const seguir = async () => { await p.getByRole('button', { name: 'Continuar' }).click(); await p.waitForTimeout(350); };
await p.goto('http://localhost:3000/onboarding', { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'load' });
await foto('1-nombre');
await p.getByRole('button', { name: 'Continuar' }).click(); await foto('1b-nombre-ayuda');
await p.fill('#nombre', 'Toffee'); await seguir();
await p.getByRole('radio', { name: /2 perros/ }).click(); await foto('2-cantidad'); await seguir();
await p.getByRole('radio', { name: /Senior/ }).click(); await foto('3-etapa'); await seguir();
await p.getByRole('checkbox', { name: /Medicamento/ }).click();
await p.getByRole('checkbox', { name: /Comida/ }).click(); await foto('4-cuidados'); await seguir();
await p.getByRole('radio', { name: /pareja/ }).click(); await foto('5-cuidadores'); await seguir();
await p.getByRole('radio', { name: /noche/ }).click(); await foto('6-momento'); await seguir();
await foto('7-reconocimiento');
await p.emulateMedia({ reducedMotion: 'no-preference' });
await p.getByRole('button', { name: /Armar el Panel/ }).click();
await p.waitForTimeout(2600); await p.screenshot({ path: 'docs/revisiones/onboarding-8-armando.png' });
await p.waitForSelector('text=Hoy con Toffee', { timeout: 15000 });
await p.waitForTimeout(500);
await p.getByRole('button', { name: /Medicamento/ }).first().click(); await foto('9-resultado');
await p.getByRole('link', { name: /Ver planes para Toffee/ }).click();
await p.waitForURL('**/paywall'); await p.waitForTimeout(700);
await p.screenshot({ path: 'docs/revisiones/paywall-375.png' });
await p.screenshot({ path: 'docs/revisiones/paywall-completo.png', fullPage: true });
await p.goto('http://localhost:3000/login', { waitUntil: 'load' });
await p.fill('#correo', 'ana@correo.com'); await p.getByRole('button', { name: /Enviarme/ }).click(); await p.waitForTimeout(700);
await p.screenshot({ path: 'docs/revisiones/login-375.png' });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
process.exit(0);
