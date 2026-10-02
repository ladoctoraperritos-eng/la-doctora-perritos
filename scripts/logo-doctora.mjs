// Genera el logo definitivo a partir del arte original de la creadora (mujer veterinaria + 3 perros +
// burbuja de pata, 2026-10-02): recorta el texto inferior, vuelve transparente el blanco EXTERIOR (sin
// tocar los blancos internos del dibujo: dientes, pelaje, ícono de la pata), recorta al contenido y genera
// public/brand/logo.png (transparente, ancho 800) y app/icon.png (256×256, fondo de marca).
// Uso: node scripts/logo-doctora.mjs <ruta-de-la-imagen-fuente>
import sharp from 'sharp';
import fs from 'node:fs';

const fuente = process.argv[2];
if (!fuente) {
  console.error('Uso: node scripts/logo-doctora.mjs <ruta-de-la-imagen-fuente>');
  process.exit(1);
}

const ALTO_RECORTE = 900; // quita el texto "LA DOCTORA PERRITOS" de abajo, conserva el dibujo completo

const base = sharp(fuente).extract({ left: 0, top: 0, width: 853, height: ALTO_RECORTE }).ensureAlpha();
const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels } = info;

const esBlanco = (k) => data[k] > 244 && data[k + 1] > 244 && data[k + 2] > 244;
const visto = new Uint8Array(W * H);
const cola = [];
const meter = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const idx = y * W + x;
  if (visto[idx]) return;
  const k = idx * channels;
  if (!esBlanco(k)) return;
  visto[idx] = 1;
  cola.push(idx);
};
for (let x = 0; x < W; x++) { meter(x, 0); meter(x, H - 1); }
for (let y = 0; y < H; y++) { meter(0, y); meter(W - 1, y); }
while (cola.length) {
  const idx = cola.pop();
  const x = idx % W, y = (idx / W) | 0;
  meter(x + 1, y); meter(x - 1, y); meter(x, y + 1); meter(x, y - 1);
}

let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (visto[idx]) {
      data[idx * channels + 3] = 0;
      continue;
    }
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

const w = maxX - minX + 1;
const h = maxY - minY + 1;
const recortado = sharp(data, { raw: { width: W, height: H, channels } }).extract({ left: minX, top: minY, width: w, height: h });

const anchoLogo = 800;
const altoLogo = Math.round(h * (anchoLogo / w));
const logoBuf = await recortado.clone().resize(anchoLogo, altoLogo).png().toBuffer();
fs.writeFileSync('public/brand/logo.png', logoBuf);

const escalaIcono = Math.min(232 / w, 232 / h);
const anchoIcono = Math.round(w * escalaIcono);
const altoIcono = Math.round(h * escalaIcono);
const iconoInterior = await recortado.clone().resize(anchoIcono, altoIcono).png().toBuffer();
const icono = await sharp({ create: { width: 256, height: 256, channels: 4, background: '#f4f7f6' } })
  .composite([{ input: iconoInterior, top: Math.round((256 - altoIcono) / 2), left: Math.round((256 - anchoIcono) / 2) }])
  .png()
  .toBuffer();
fs.writeFileSync('app/icon.png', icono);

console.log(`logo.png (${anchoLogo}x${altoLogo}) y app/icon.png listos`);
