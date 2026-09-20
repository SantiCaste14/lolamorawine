// Optimiza public/img: limita el ancho, recomprime y genera WebP.
// El sitio viejo servia un PNG de 2 MB en la portada; esto lo deja en ~100 KB.
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, unlinkSync, copyFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const DIR = join('public', 'img');
const BK = join('..', 'backup-2026-08-28', 'img');
const ANCHO_MAX = 1600;

// Fotos de galeria que se usan en la portada y en las secciones,
// aunque no esten referenciadas desde el markdown.
const EXTRA = [
  'images_cajaluz_vinedos_vinos-lola-mora-wine-1.jpg',
  'images_cajaluz_vinedos_vinos-lola-mora-wine-4.jpg',
  'images_cajaluz_vinedos_vinos-lola-mora-wine-6.jpg',
  'images_cajaluz_vinedos_vinos-lola-mora-wine-10.jpg',
  'images_cajaluz_eventos_tonel-de-bodega-lola-mora-wines.jpg',
  'images_cajaluz_eventos_vinos-y-quesos-lola-mora-wines.jpg',
  'images_cajaluz_embutidos_embutidos_lola_mora_5.jpg',
  'images_fotosarticulos_escudo-lola-mora-wine.jpg',
];

let copiadas = 0;
for (const f of EXTRA) {
  if (existsSync(join(BK, f)) && !existsSync(join(DIR, f))) {
    copyFileSync(join(BK, f), join(DIR, f));
    copiadas++;
  }
}

const archivos = readdirSync(DIR).filter((f) => /\.(jpe?g|png|gif)$/i.test(f));
let antes = 0, despues = 0, procesadas = 0, webp = 0;

for (const f of archivos) {
  const ruta = join(DIR, f);
  const tam = statSync(ruta).size;
  antes += tam;

  try {
    const img = sharp(ruta, { animated: extname(f).toLowerCase() === '.gif' });
    const meta = await img.metadata();

    // GIF animado: se deja como esta
    if (extname(f).toLowerCase() === '.gif' && (meta.pages ?? 1) > 1) { despues += tam; continue; }

    const necesitaEscalar = (meta.width ?? 0) > ANCHO_MAX;
    const base = sharp(ruta).rotate();
    if (necesitaEscalar) base.resize({ width: ANCHO_MAX, withoutEnlargement: true });

    // WebP para todos: es el que sirve el navegador via <picture>
    const destinoWebp = join(DIR, basename(f, extname(f)) + '.webp');
    await base.clone().webp({ quality: 80, effort: 5 }).toFile(destinoWebp);
    webp++;

    // Original recomprimido como respaldo
    const esPng = extname(f).toLowerCase() === '.png';
    const buf = esPng
      ? await base.clone().png({ compressionLevel: 9, palette: true }).toBuffer()
      : await base.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    if (buf.length < tam) { writeFileSync(ruta, buf); procesadas++; }
    despues += statSync(ruta).size + statSync(destinoWebp).size;
  } catch (err) {
    despues += tam;
    console.warn('  no se pudo procesar:', f, '-', err.message);
  }
}

console.log(`Extra copiadas: ${copiadas}`);
console.log(`Imagenes: ${archivos.length} | recomprimidas: ${procesadas} | WebP generados: ${webp}`);
console.log(`Peso original:  ${(antes / 1048576).toFixed(1)} MB`);
console.log(`Peso resultante (original + webp): ${(despues / 1048576).toFixed(1)} MB`);
