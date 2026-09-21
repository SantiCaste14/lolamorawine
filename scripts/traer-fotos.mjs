// Descarga fotografia de alta resolucion con licencia libre desde Wikimedia Commons.
// Prioriza dominio publico; registra autor y licencia de todo lo que use (CC BY-SA
// exige atribucion). El resultado se publica en /creditos/.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const SALIDA = 'public/img/foto';
if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'LolaMoraWine/1.0 (sitio institucional; contacto ventas@lolamorawine.com.ar)';

/** nombre de destino -> terminos de busqueda, en orden de preferencia */
const BUSQUEDAS = [
  { slug: 'nereidas',        q: 'Fuente de las Nereidas Lola Mora',        min: 2000, horizontal: true },
  { slug: 'nereidas-detalle',q: 'Fuente de las Nereidas Lola Mora',        min: 2000, horizontal: false, salto: 3 },
  { slug: 'lola-mora-retrato', q: 'Lola Mora escultora',                   min: 600,  horizontal: false },
  { slug: 'vinedo',          q: 'viñedo Mendoza Argentina vineyard',       min: 2400, horizontal: true },
  { slug: 'vinedo-otono',    q: 'vineyard Argentina autumn Andes',         min: 2400, horizontal: true, salto: 1 },
  { slug: 'uvas-malbec',     q: 'Malbec grapes harvest vendimia',          min: 2000, horizontal: true },
  { slug: 'barricas',        q: 'wine barrels cellar barrica roble',       min: 2400, horizontal: true },
  { slug: 'copa-vino',       q: 'red wine glass pouring',                  min: 2000, horizontal: true },
  { slug: 'jamon',           q: 'jamon serrano curado bodega',             min: 1600, horizontal: true },
  { slug: 'aceite-olivas',   q: 'olive harvest olivos Argentina',          min: 2000, horizontal: true },
  { slug: 'caballo-paso',    q: 'Peruvian Paso horse caballo',             min: 1600, horizontal: true },
  { slug: 'carruaje',        q: 'horse carriage carruaje antiguo',         min: 1600, horizontal: true },
  { slug: 'monumento-bandera', q: 'Monumento a la Bandera Rosario',        min: 2000, horizontal: true },
];

const texto = (v) => (v ?? '').toString().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const puntajeLicencia = (l) => (/public domain|pd-|cc0/i.test(l) ? 0 : /cc by-sa/i.test(l) ? 1 : 2);

const creditos = [];

for (const b of BUSQUEDAS) {
  const url =
    `${API}?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=25` +
    `&gsrsearch=${encodeURIComponent(b.q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2400`;
  let candidatos = [];
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    const j = await r.json();
    const paginas = j.query?.pages ?? {};
    for (const k in paginas) {
      const info = paginas[k].imageinfo?.[0];
      if (!info) continue;
      const meta = info.extmetadata ?? {};
      const licencia = texto(meta.LicenseShortName?.value) || 'desconocida';
      if (/fair use|non-free|copyright/i.test(licencia)) continue;
      if (!/\.(jpe?g|png)$/i.test(paginas[k].title)) continue;
      const apaisada = info.width >= info.height;
      candidatos.push({
        titulo: paginas[k].title.replace(/^File:/, ''),
        w: info.width, h: info.height,
        thumb: info.thumburl ?? info.url,
        pagina: info.descriptionurl,
        autor: texto(meta.Artist?.value) || 'Autor no indicado',
        licencia,
        ok: info.width >= b.min && (b.horizontal ? apaisada : true),
      });
    }
  } catch (e) {
    console.log(`  ${b.slug}: error de búsqueda (${e.message})`);
    continue;
  }

  candidatos = candidatos
    .filter((c) => c.ok)
    .sort((a, z) => puntajeLicencia(a.licencia) - puntajeLicencia(z.licencia) || z.w * z.h - a.w * a.h);

  const elegido = candidatos[b.salto ?? 0];
  if (!elegido) { console.log(`  ${b.slug}: sin resultados aptos`); continue; }

  try {
    const img = await fetch(elegido.thumb, { headers: { 'User-Agent': UA } });
    const buf = Buffer.from(await img.arrayBuffer());
    const destino = `${SALIDA}/${b.slug}.webp`;
    const meta = await sharp(buf)
      .resize({ width: 2000, withoutEnlargement: true, kernel: 'lanczos3' })
      .webp({ quality: 82, effort: 5 })
      .toFile(destino);
    console.log(`  ${b.slug.padEnd(20)} ${String(meta.width + 'x' + meta.height).padStart(10)}  ${Math.round(meta.size / 1024)}KB  ${elegido.licencia}`);
    creditos.push({
      archivo: `/img/foto/${b.slug}.webp`,
      titulo: elegido.titulo,
      autor: elegido.autor,
      licencia: elegido.licencia,
      fuente: elegido.pagina,
    });
  } catch (e) {
    console.log(`  ${b.slug}: no se pudo descargar (${e.message})`);
  }
}

writeFileSync('src/lib/creditos.json', JSON.stringify(creditos, null, 2));
console.log(`\nFotos: ${creditos.length}  |  créditos en src/lib/creditos.json`);
