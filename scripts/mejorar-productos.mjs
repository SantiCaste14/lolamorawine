// Mejora la foto de cada ficha de producto.
//
// El catálogo viejo mostraba una MINIATURA de 180 px, pero el backup guarda además
// versiones de 480–640 px del mismo producto, con otro hash en el nombre. Cuando el
// emparejamiento es inequívoco se usa la grande; cuando el prefijo es ambiguo
// (los packs 1 a 5 comparten "Pack_para_Regalo_") se conserva la foto propia de
// esa ficha para no atribuirle la imagen de otro producto.
//
// Límite honesto: el reescalado es interpolación Lanczos, no reconstrucción con IA.
// Mejora la nitidez percibida; no inventa detalle. La sesión de fotos sigue pendiente.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import sharp from 'sharp';

const BK_IMG = join('..', 'backup-2026-08-28', 'img');
const BK_MD = join('..', 'backup-2026-08-28', 'md');
const DESTINO = 'public/img/prod';
const CONTENIDO = join('src', 'content', 'productos');
const ANCHO = 1000;

if (!existsSync(DESTINO)) mkdirSync(DESTINO, { recursive: true });

const prefijo = (f) =>
  basename(f)
    .replace(/^components_com_virtuemart_shop_image_product_/, '')
    .replace(/_[0-9a-f]{10,}.*$/i, '')
    .replace(/\.(webp|jpe?g|png)$/i, '')
    .toLowerCase();

// 1. Foto original de cada ficha, según el backup (antes de cualquier reemplazo)
const originalDe = new Map();
for (const md of readdirSync(CONTENIDO).filter((f) => f.endsWith('.md'))) {
  const slug = basename(md, '.md');
  const fuente = join(BK_MD, `${slug}.md`);
  if (!existsSync(fuente)) continue;
  const imgs = JSON.parse(readFileSync(fuente, 'utf8').match(/^imagenes: (\[.*\])$/m)?.[1] ?? '[]');
  const primera = imgs[0];
  if (!primera) continue;
  const aplanado = decodeURIComponent(primera).replace(/^\//, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-140);
  if (existsSync(join(BK_IMG, aplanado))) originalDe.set(slug, aplanado);
}

// 2. Cuántas fichas comparten cada prefijo: si es más de una, el prefijo no identifica
const fichasPorPrefijo = new Map();
for (const [slug, archivo] of originalDe) {
  const p = prefijo(archivo);
  fichasPorPrefijo.set(p, (fichasPorPrefijo.get(p) ?? 0) + 1);
}

// 3. Variante de mayor tamaño dentro de cada prefijo
const mayorPorPrefijo = new Map();
for (const f of readdirSync(BK_IMG).filter((x) => /shop_image_product/.test(x) && /\.(jpe?g|png)$/i.test(x))) {
  try {
    const m = await sharp(join(BK_IMG, f)).metadata();
    const p = prefijo(f);
    const previo = mayorPorPrefijo.get(p);
    if (!previo || m.width * m.height > previo.px) mayorPorPrefijo.set(p, { f, px: m.width * m.height, w: m.width, h: m.height });
  } catch { /* ilegible */ }
}

// 4. Procesar
let sustituidas = 0, propias = 0;
for (const [slug, original] of originalDe) {
  const p = prefijo(original);
  const ambiguo = (fichasPorPrefijo.get(p) ?? 1) > 1;
  const candidata = mayorPorPrefijo.get(p);

  const usar = !ambiguo && candidata ? candidata.f : original;
  const meta0 = await sharp(join(BK_IMG, usar)).metadata();

  const salida = `${slug}.webp`;
  const meta = await sharp(join(BK_IMG, usar))
    .resize({ width: ANCHO, kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 })
    .modulate({ saturation: 0.96 })
    .webp({ quality: 88, effort: 5 })
    .toFile(join(DESTINO, salida));

  const ruta = join(CONTENIDO, `${slug}.md`);
  const texto = readFileSync(ruta, 'utf8');
  writeFileSync(ruta, texto.replace(/^portada: "[^"]+"$/m, `portada: "/img/prod/${salida}"`));

  const etiqueta = usar === original ? (ambiguo ? 'propia (prefijo ambiguo)' : 'propia') : 'variante mayor';
  if (usar === original) propias++; else sustituidas++;
  console.log(`  ${slug.padEnd(44)} ${String(meta0.width + 'x' + meta0.height).padStart(9)} → ${meta.width}px  ${String(Math.round(meta.size / 1024) + 'KB').padStart(6)}  ${etiqueta}`);
}

console.log(`\nSustituidas por una variante mayor: ${sustituidas}  |  reescaladas desde su propia foto: ${propias}`);
