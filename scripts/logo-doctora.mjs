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

// El JPEG fuente tiene ruido de compresión: unos pocos píxeles sueltos quedan casi blancos dentro del
// dibujo (p. ej. en el pelo) y, sin querer, conectan el blanco interior con el exterior por un hilo de 1px,
// lo que agujerea el dibujo. Se detecta el blanco sobre una copia con filtro de mediana (quita ese ruido
// puntual sin mover los bordes reales) y el resultado se aplica al alfa de la imagen ORIGINAL (sin filtrar).
const { data: maskData } = await sharp(data, { raw: { width: W, height: H, channels } }).median(5).raw().toBuffer({ resolveWithObject: true });
const esBlanco = (k) => maskData[k] > 247 && maskData[k + 1] > 247 && maskData[k + 2] > 247;
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

// El recorte deja el borde del círculo con alfa 0/255 "duro" (sin antialiasing): se ve dentado/pixelado
// al mostrarse chico (insignia de 36px). Se suaviza con un box blur casero sobre el canal alfa nada más
// (el color no se toca), aplicado directo en el buffer crudo — evita los líos de unir canales con sharp.
const alfa = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) alfa[i] = data[i * channels + 3];
const boxBlur1D = (src, horizontal) => {
  const out = new Float32Array(W * H);
  const r = 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let suma = 0, n = 0;
      for (let d = -r; d <= r; d++) {
        const xx = horizontal ? x + d : x;
        const yy = horizontal ? y : y + d;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        suma += src[yy * W + xx];
        n++;
      }
      out[y * W + x] = suma / n;
    }
  }
  return out;
};
const alfaSuave = boxBlur1D(boxBlur1D(alfa, true), false);
for (let i = 0; i < W * H; i++) data[i * channels + 3] = Math.round(alfaSuave[i]);

const margen = 3;
const left = Math.max(0, minX - margen);
const top = Math.max(0, minY - margen);
const right = Math.min(W - 1, maxX + margen);
const bottom = Math.min(H - 1, maxY + margen);
const w = right - left + 1;
const h = bottom - top + 1;
const recortado = sharp(data, { raw: { width: W, height: H, channels } }).extract({ left, top, width: w, height: h });

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
