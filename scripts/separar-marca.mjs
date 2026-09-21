// Separa los elementos de marca que estaban aplanados en un solo JPEG de 1004x86:
// escudo, wordmark, firma manuscrita y dibujo a pluma de la casa natal.
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';

const ORIGEN = 'public/img/marca/header-user1.jpg';
const SALIDA = 'public/img/marca';
const REF = 'capturas/referencias';
for (const d of [SALIDA, REF]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

const { width, height } = await sharp(ORIGEN).metadata();
console.log(`origen: ${width}x${height}`);

/** Recortes en coordenadas del original. */
const PIEZAS = [
  { nombre: 'escudo',   left: 26,  top: 2,  width: 70,  height: 84, escala: 8 },
  { nombre: 'wordmark', left: 108, top: 8,  width: 220, height: 72, escala: 6 },
  { nombre: 'firma',    left: 395, top: 4,  width: 330, height: 80, escala: 5 },
  { nombre: 'casa',     left: 752, top: 0,  width: 252, height: 86, escala: 6 },
];

for (const p of PIEZAS) {
  const ancho = Math.round(p.width * p.escala);
  await sharp(ORIGEN)
    .extract({ left: p.left, top: p.top, width: p.width, height: p.height })
    // Lanczos conserva mejor el borde del trazo que la interpolacion por defecto
    .resize({ width: ancho, kernel: 'lanczos3' })
    // Realce de contorno: sube nitidez sin inventar detalle
    .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.4 })
    .png({ compressionLevel: 9 })
    .toFile(`${REF}/_marca-${p.nombre}.png`);
  console.log(`  ${p.nombre}: ${ancho}px`);
}

// Version de la casa a dos tonos: el trazo a pluma queda limpio y escala sin halos
await sharp(ORIGEN)
  .extract({ left: 752, top: 0, width: 252, height: 86 })
  .resize({ width: 1512, kernel: 'lanczos3' })
  .greyscale()
  .normalise()
  .linear(1.9, -95)
  .sharpen({ sigma: 0.8 })
  .png()
  .toFile(`${REF}/_marca-casa-linea.png`);
console.log('  casa (2 tonos): 1512px');
