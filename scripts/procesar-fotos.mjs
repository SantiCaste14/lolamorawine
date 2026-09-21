// Procesa la fotografia elegida a mano desde las hojas de contacto.
// Solo se usan obras de Lola Mora (autenticas y atribuibles) y textura abstracta.
// No se usan fotos de bodegas ajenas como si fueran Finca El Datil.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const SALIDA = 'public/img/foto';
if (existsSync(SALIDA)) rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

const UA = 'LolaMoraWine/1.0 (sitio institucional)';

/** Elegidas revisando las hojas de contacto en capturas/candidatos/. */
const ELEGIDAS = [
  { cat: 'escultura', n: 1, slug: 'nereidas-hero',    trato: 'cine',    w: 2400 },
  { cat: 'escultura', n: 5, slug: 'nereidas-detalle', trato: 'cine',    w: 1800 },
  { cat: 'escultura', n: 8, slug: 'nereidas-tritones',trato: 'cine',    w: 1800 },
  { cat: 'escultura', n: 7, slug: 'nereidas-cima',    trato: 'suave',   w: 1600 },
  { cat: 'barrica',   n: 2, slug: 'textura-bodega',   trato: 'textura', w: 2000 },
];

const creditos = [];

for (const e of ELEGIDAS) {
  const lista = JSON.parse(readFileSync(`capturas/candidatos/${e.cat}.json`, 'utf8'));
  const c = lista[e.n - 1];
  if (!c) { console.log(`${e.slug}: candidato ${e.n} inexistente`); continue; }

  // El JSON de la hoja de contacto guarda un thumb de 900px. Para el sitio hace falta
  // la version grande: se vuelve a consultar la API por el titulo exacto.
  let buf;
  try {
    const api =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
      `&iiprop=url|size&iiurlwidth=${e.w}&titles=${encodeURIComponent('File:' + c.t)}`;
    const j = await (await fetch(api, { headers: { 'User-Agent': UA } })).json();
    const info = Object.values(j.query?.pages ?? {})[0]?.imageinfo?.[0];
    const fuente = info?.thumburl ?? info?.url ?? c.thumb;
    buf = Buffer.from(await (await fetch(fuente, { headers: { 'User-Agent': UA } })).arrayBuffer());
  } catch (err) { console.log(`${e.slug}: descarga fallida`, err.message); continue; }

  let img = sharp(buf).resize({ width: e.w, withoutEnlargement: true, kernel: 'lanczos3' });

  if (e.trato === 'cine') {
    // Monocromo de alto contraste: el marmol conserva su luz y el cielo se va a negro.
    // El tono bordo se aplica despues en CSS, donde se puede graduar sin recomprimir.
    img = img
      .greyscale()
      .normalise()
      .linear(1.34, -46)   // negros profundos, altas luces intactas
      .gamma(1.12)
      .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.6 });
  } else if (e.trato === 'suave') {
    img = img.modulate({ brightness: 0.92, saturation: 0.55 }).linear(1.06, -8);
  } else if (e.trato === 'textura') {
    // Fondo abstracto: muy oscuro y desaturado, para usar detras de texto
    img = img.modulate({ brightness: 0.45, saturation: 0.25 }).blur(1.2).linear(1.1, -30);
  }

  const meta = await img.webp({ quality: 84, effort: 5 }).toFile(`${SALIDA}/${e.slug}.webp`);
  console.log(`  ${e.slug.padEnd(20)} ${String(meta.width + 'x' + meta.height).padStart(10)}  ${Math.round(meta.size / 1024)}KB  ${c.lic}`);

  creditos.push({
    archivo: `/img/foto/${e.slug}.webp`,
    titulo: c.t,
    autor: c.autor,
    licencia: c.lic,
    fuente: c.pagina,
    nota: e.trato === 'cine' || e.trato === 'textura' ? 'Recortada y con corrección de color' : 'Recortada',
  });
}

writeFileSync('src/lib/creditos.json', JSON.stringify(creditos, null, 2));
console.log(`\nFotos procesadas: ${creditos.length}  |  créditos: src/lib/creditos.json`);
