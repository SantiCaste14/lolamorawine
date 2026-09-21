// Arma una hoja de contacto por categoria para poder ELEGIR viendo, en vez de
// confiar en el ranking por resolucion. Cada hoja es una grilla numerada de 8 candidatos.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const TMP = 'capturas/candidatos';
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'LolaMoraWine/1.0 (sitio institucional)';

const CATEGORIAS = [
  { slug: 'escultura', q: 'Nereidas Lola Mora' },
  { slug: 'vinedo',    q: 'vineyard Mendoza' },
  { slug: 'barrica',   q: 'wine cellar oak barrels winery interior' },
  { slug: 'uva',       q: 'wine grapes' },
  { slug: 'copa',      q: 'red wine glass' },
];

const texto = (v) => (v ?? '').toString().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const CELDA = 420;

for (const cat of CATEGORIAS) {
  const url =
    `${API}?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=40` +
    `&gsrsearch=${encodeURIComponent(cat.q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=900`;

  let cands = [];
  try {
    const j = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
    for (const k in j.query?.pages ?? {}) {
      const i = j.query.pages[k].imageinfo?.[0];
      if (!i) continue;
      const lic = texto(i.extmetadata?.LicenseShortName?.value) || '?';
      if (/fair use|non-free/i.test(lic)) continue;
      const t = j.query.pages[k].title.replace(/^File:/, '');
      if (!/\.(jpe?g|png)$/i.test(t)) continue;
      if (/placa|plaque|sign|cartel|map|mapa|logo|coat of arms/i.test(t)) continue;  // descartar señalética
      if (i.width < 900) continue;                      // apaisadas y grandes
      cands.push({ t, lic, w: i.width, h: i.height, thumb: i.thumburl ?? i.url, pagina: i.descriptionurl,
                   autor: texto(i.extmetadata?.Artist?.value) || 'Autor no indicado' });
    }
  } catch (e) { console.log(cat.slug, 'error', e.message); continue; }

  cands = cands.slice(0, 8);
  if (!cands.length) { console.log(`${cat.slug}: sin candidatos`); continue; }

  const celdas = [];
  for (let n = 0; n < cands.length; n++) {
    try {
      const buf = Buffer.from(await (await fetch(cands[n].thumb, { headers: { 'User-Agent': UA } })).arrayBuffer());
      const img = await sharp(buf).resize(CELDA, Math.round(CELDA * 0.7), { fit: 'cover' }).toBuffer();
      const etiqueta = Buffer.from(
        `<svg width="${CELDA}" height="34"><rect width="100%" height="100%" fill="#000"/>` +
        `<text x="8" y="23" font-family="monospace" font-size="19" fill="#fff">${n + 1}</text>` +
        `<text x="34" y="23" font-family="monospace" font-size="14" fill="#bbb">${cands[n].t.slice(0, 44).replace(/[&<>]/g, '')}</text></svg>`
      );
      celdas.push(await sharp({ create: { width: CELDA, height: Math.round(CELDA * 0.7) + 34, channels: 3, background: '#000' } })
        .composite([{ input: img, top: 0, left: 0 }, { input: etiqueta, top: Math.round(CELDA * 0.7), left: 0 }])
        .png().toBuffer());
    } catch { celdas.push(null); }
  }

  const buenas = celdas.filter(Boolean);
  const cols = 4, filaAlto = Math.round(CELDA * 0.7) + 34;
  const filas = Math.ceil(buenas.length / cols);
  await sharp({ create: { width: cols * CELDA, height: filas * filaAlto, channels: 3, background: '#111' } })
    .composite(buenas.map((b, i) => ({ input: b, left: (i % cols) * CELDA, top: Math.floor(i / cols) * filaAlto })))
    .png().toFile(`${TMP}/${cat.slug}.png`);

  writeFileSync(`${TMP}/${cat.slug}.json`, JSON.stringify(cands, null, 2));
  console.log(`${cat.slug}: ${buenas.length} candidatos -> ${TMP}/${cat.slug}.png`);
}
