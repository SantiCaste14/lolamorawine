// Convierte el backup del Joomla viejo en colecciones de contenido de Astro.
// Entrada: ../backup-2026-08-28/md/*.md
// Salida:  src/content/<coleccion>/*.md  +  public/img/**
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

const BK = join('..', 'backup-2026-08-28');
const OUT = join('src', 'content');
const IMGOUT = join('public', 'img');

// ---------------------------------------------------------------- clasificacion
const CLASIFICACION = {
  productos: {
    'vino-lola-mora-malbec':            { categoria: 'vinos', orden: 1 },
    'vino-lola-mora-tempranillo':       { categoria: 'vinos', orden: 2 },
    'salame-de-llama-lola-mora':        { categoria: 'delicatessen', orden: 1 },
    'aceite-de-oliva-lola-mora':        { categoria: 'delicatessen', orden: 2 },
    'pack-para-regalo-empresarial-simple': { categoria: 'regalos', orden: 1 },
    'pack-para-regalo-empresarial-1':   { categoria: 'regalos', orden: 2 },
    'pack-para-regalo-empresarial-2':   { categoria: 'regalos', orden: 3 },
    'pack-para-regalo-empresarial-3':   { categoria: 'regalos', orden: 4 },
    'pack-para-regalo-empresarial-4':   { categoria: 'regalos', orden: 5 },
    'pack-para-regalo-empresarial-5':   { categoria: 'regalos', orden: 6 },
    'estuche-para-regalo-empresarial-a':{ categoria: 'regalos', orden: 7 },
    'diccionario-enciclopedico-universal-del-vino': { categoria: 'regalos', orden: 8 },
  },
  noticias: {
    'con-diseno-de-cesar-pelli-inauguraron-el-centro-cultural-lola-mora-en-': { fecha: '2026-08-25' },
    'reconocimiento-internacional-para-lola-mora': { fecha: '2026-08-02' },
    'lola-mora-wine-junto-a-marianne-du-toit': { fecha: '2015-06-01' },
    'roberto-arce-vadillo-conociendo-el-mundo-del-vino': { fecha: '2014-11-01' },
    'eventos-y-degustaciones': { fecha: '2013-05-01' },
    'lola-mora-una-artista-de-vanguardia': { fecha: '2012-03-01' },
  },
  vinos: {
    'el-arte-de-la-degustacion':          { orden: 1, grupo: 'Degustación' },
    'el-vino-y-los-sentidos-aroma':       { orden: 2, grupo: 'Degustación' },
    'el-vino-y-los-sentidos-color':       { orden: 3, grupo: 'Degustación' },
    'el-vino-y-los-sentidos-sabor':       { orden: 4, grupo: 'Degustación' },
    'el-vino-y-los-sentidos-elaboracion': { orden: 5, grupo: 'Degustación' },
    'el-vocabulario-del-vino':            { orden: 6, grupo: 'Degustación' },
    'varietal-malbec':                    { orden: 7, grupo: 'Varietales' },
    'varietal-tempranillo':               { orden: 8, grupo: 'Varietales' },
    'varietal-torrontes-riojano':         { orden: 9, grupo: 'Varietales' },
    'caracteristicas-del-malbec':         { orden: 10, grupo: 'Para expertos' },
    'caracteristicas-del-tempranillo':    { orden: 11, grupo: 'Para expertos' },
    'caracteristicas-del-torrontes-riojano': { orden: 12, grupo: 'Para expertos' },
    'opinion-experta':                    { orden: 13, grupo: 'Para expertos' },
  },
  delicatessen: {
    'chacinados-lola-mora':                    { orden: 1 },
    'chacinados-delicatessen':                 { orden: 2 },
    'salame-de-llama':                         { orden: 3 },
    'jamones-lola-mora':                       { orden: 4 },
    'guia-practica-sobre-el-jamon-crudo-lola-mora': { orden: 5 },
    'proceso-de-elaboracion-del-jamon-crudo':  { orden: 6 },
    'como-consumir-el-jamon-crudo-lola-mora':  { orden: 7 },
    'cualidades-nutricionales-del-jamon-crudo':{ orden: 8 },
    'aceite-de-oliva-extra-virgen-lola-mora':  { orden: 9 },
  },
  historia: {
    'lola-mora-primeros-anos-1866-1894': { orden: 1, grupo: 'Biografía' },
    'lola-mora-esplendor-1895-1909':     { orden: 2, grupo: 'Biografía' },
    'lola-mora-ocaso-1910-1936':         { orden: 3, grupo: 'Biografía' },
    'lola-mora-pruebas-de-su-origen':    { orden: 4, grupo: 'Documentación' },
    'controversias-en-torno-a-lola-mora':{ orden: 5, grupo: 'Documentación' },
    'linea-de-tiempo-sobre-lola-mora':   { orden: 6, grupo: 'Documentación' },
    'analisis-de-obras-de-lola-mora':    { orden: 7, grupo: 'Obras' },
    'fuente-de-las-nereidas':            { orden: 8, grupo: 'Obras' },
    'monumento-a-nicolas-avellaneda':    { orden: 9, grupo: 'Obras' },
    'la-independencia-la-libertad':      { orden: 10, grupo: 'Obras' },
    'relieves-para-la-casa-de-tucuman':  { orden: 11, grupo: 'Obras' },
    'esculturas-para-el-monumento-a-la-bandera': { orden: 12, grupo: 'Obras' },
    'alegorias-para-el-edificio-del-congreso':   { orden: 13, grupo: 'Obras' },
    'otras-obras-de-lola-mora':          { orden: 14, grupo: 'Obras' },
  },
  finca: {
    'finca-el-datil':                        { orden: 1, grupo: 'La finca' },
    'finca-el-datil-una-propiedad-con-historia': { orden: 2, grupo: 'La finca' },
    'alfredo-guzman-biografia-de-un-pionero':{ orden: 3, grupo: 'La finca' },
    'caballos-de-paso-de-finca-el-datil':    { orden: 4, grupo: 'Caballos peruanos de paso' },
    'el-caballo-peruano-de-paso-y-su-historia': { orden: 5, grupo: 'Caballos peruanos de paso' },
    'el-amblar-del-caballo-de-paso':         { orden: 6, grupo: 'Caballos peruanos de paso' },
    'caballos-peruanos-de-paso':             { orden: 7, grupo: 'Caballos peruanos de paso' },
    'carruajes-antiguos':                    { orden: 8, grupo: 'Carruajes' },
    'club-argentino-del-carruaje-del-noroeste': { orden: 9, grupo: 'Carruajes' },
    'competencia-internacional-de-carruajes-de-tiro': { orden: 10, grupo: 'Carruajes' },
    'carruajes-antiguos-en-el-tala-salta-argentina': { orden: 11, grupo: 'Carruajes' },
    'carruajes-antiguos-en-competencia-el-tala-salta-argentina': { orden: 12, grupo: 'Carruajes' },
    'carruajes-antiguos-en-el-festival-de-jesus-mara-a-cordoba-argentina': { orden: 13, grupo: 'Carruajes' },
  },
  paginas: {
    'quienes-somos':                 { orden: 1 },
    'escudo-lola-mora-wine':         { orden: 2 },
    'en-permanente-busqueda':        { orden: 3 },
    'politica-de-privacidad-lola-mora-wine': { orden: 90, slug: 'politica-de-privacidad' },
  },
};

// Paginas que NO se migran (ruido del CMS viejo)
const DESCARTAR = new Set([
  'index', 'agosto-2026', 'error-404', 'mapa-del-sitio', 'galerias',
  'mi-blog', 'todas-las-discusiones', 'temas-generales', 'bienvenidos-al-blog-de-lola-mora-wine',
  'los-regalos', 'videos-lola-mora-wine', 'delicatessen', 'contactenos',
  'regalos-empresariales', 'regalos-empresariales-de-excelencia', 'vinos-lola-mora-wine',
  'junio-2026-calendario', 'julio-2026-calendario', 'septiembre-2026-calendario', 'octubre-2026-calendario',
  'junio-2026-calendario-de-fechas-especiales', 'julio-2026-calendario-de-fechas-especiales',
  'septiembre-2026-calendario-de-fechas-especiales', 'octubre-2026-calendario-de-fechas-especiales',
]);

// ---------------------------------------------------------------- limpieza
const BASURA_LINEAS = [
  /^\*\*Info\*\*:\s*Tu navegador web no acepta cookies/i,
  /^\[Ampliar imágen\]/i,
  /^\*\*Parámetros de categoría/i,
  /^#{2,6}\s*Valoración de los clientes/i,
  /^No hay opiniones para este producto/i,
  /^Por favor, regístrate para escribir una valoración/i,
  /^\*\*Precio por unidad/i,
  /^\[.*\]\(\/style\/details\//i,
  /^Escrito por /i,
  /^\s*\|\s*$/,
  /^Leer más\.\.\./i,
  /^\[Leer más\.\.\.\]/i,
  /^\s*«\s*Inicio/i,
  /^Página \d+ de \d+/i,
  /tvariable/i,
];

const ERRATAS = [
  [/\bViino\b/g, 'Vino'],
  [/\bDelicatesen\b/g, 'Delicatessen'],
  [/\bdelicatesen\b/g, 'delicatessen'],
  [/\bFor favor\b/g, 'Por favor'],
  [/\binnigualable\b/g, 'inigualable'],
  [/\bimágen\b/g, 'imagen'],
  [/\bMiguel Angel\b/g, 'Miguel Ángel'],
  [/\s+([,.;:!?])/g, '$1'],
];

const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();

function limpiar(md, titulo, portada) {
  let lineas = md.split('\n');

  // 1. Capitulares partidas: una linea con una sola mayuscula y el resto mas abajo
  //    (el original usaba un <span> de letra capital, que al aplanar queda suelto)
  for (let i = 0; i < lineas.length; i++) {
    if (!/^[A-ZÁÉÍÓÚÑ]$/.test(lineas[i].trim())) continue;
    let j = i + 1;
    while (j < lineas.length && lineas[j].trim() === '') j++;
    if (j < lineas.length && /^[a-záéíóúñ]/.test(lineas[j].trim())) {
      const letra = lineas[i].trim();
      lineas[j] = letra + lineas[j].trimStart();
      for (let k = i; k < j; k++) lineas[k] = '';
    }
  }

  // 2. Quitar lineas de basura del CMS
  lineas = lineas.filter(l => !BASURA_LINEAS.some(re => re.test(l.trim())));

  let out = lineas.join('\n');

  // 3. La imagen de portada ya la pinta el layout: se quita del cuerpo
  if (portada) {
    const esc = portada.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`!\\[[^\\]]*\\]\\(${esc}\\)`, 'g'), '');
  }

  // 4. El titulo suele repetirse al inicio, como H2/H3 o como texto plano
  out = out.replace(/^\s*#{2,6}\s+(.+?)\s*\n/, (m, t) => (norm(t) === norm(titulo) ? '' : m));
  out = out.trimStart();
  const primeraLinea = out.split('\n')[0] || '';
  if (norm(primeraLinea) && norm(titulo).startsWith(norm(primeraLinea).slice(0, 60))) {
    if (norm(primeraLinea) === norm(titulo)) out = out.split('\n').slice(1).join('\n');
  }

  // 4. Erratas y espaciado
  for (const [re, to] of ERRATAS) out = out.replace(re, to);

  // 5. Enlaces internos del sitio viejo -> relativos limpios
  out = out.replace(/\]\(https?:\/\/(www\.)?lolamorawine\.com\.ar/gi, '](');
  out = out.replace(/\]\(\/([^)]*?)\.html([^)]*)\)/g, (m, p) => `](/${p}/`.replace(/\/+$/, '/') + ')');

  // 6a. Los enlaces a fotos de la galeria lightbox eran [texto](/images/....jpg).
  //     Se convierten en imagenes reales: el contenido visual vale y el lightbox ya no existe.
  out = out.replace(/(^|[^!])\[([^\]]*)\]\((\/[^)]*\.(?:jpg|jpeg|png|gif))\)/gi,
    (m, pre, alt, src) => `${pre}\n\n![${alt}](${rutaImagen(src)})\n`);

  // 6b. Reescribir rutas de imagen del sitio viejo a /img/<nombre-aplanado>
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => `![${alt}](${rutaImagen(src)})`);

  // 6c. Descartar imagenes cuyo archivo no se pudo rescatar del sitio viejo
  out = out.replace(/!\[([^\]]*)\]\((\/img\/[^)]+)\)/g,
    (m, alt, ruta) => (existsSync(join(BK, 'img', basename(ruta))) ? m : ''));

  // 7. Normalizar espacios
  out = out.replace(/ /g, ' ')
           .replace(/[ \t]+$/gm, '')
           .replace(/\n{3,}/g, '\n\n')
           .trim();
  return out;
}

/** Las imagenes se guardaron aplanando la ruta original en un unico nombre de archivo. */
function nombreAplanado(src) {
  const limpio = decodeURIComponent(String(src).trim().split('?')[0]);
  return limpio.replace(/^\//, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-140);
}

function rutaImagen(src) {
  if (!src || /^(https?:|data:)/i.test(src)) return src;
  return '/img/' + nombreAplanado(src);
}

function parseFrontmatter(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: txt };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (!k) continue;
    try { fm[k[1]] = JSON.parse(k[2]); } catch { fm[k[1]] = k[2]; }
  }
  return { fm, body: m[2] };
}

// Titulo corto: Joomla generaba "Tema | Seccion | Categoria"
const tituloCorto = t => (t || '').split('|')[0].trim().replace(/\s+/g, ' ');

function descripcion(fm, body) {
  const d = (fm.meta_description_original || '').replace(/\s+/g, ' ').trim();
  if (d && d.length > 40) return d.slice(0, 158);
  const txt = body.replace(/^#.*$/gm, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '')
                  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_>#-]/g, '')
                  .replace(/\s+/g, ' ').trim();
  return txt.slice(0, 155).replace(/\s+\S*$/, '') + '…';
}

const yaml = v => JSON.stringify(v);

// ---------------------------------------------------------------- ejecucion
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
if (existsSync(IMGOUT)) rmSync(IMGOUT, { recursive: true, force: true });
mkdirSync(IMGOUT, { recursive: true });

const archivos = readdirSync(join(BK, 'md')).filter(f => f.endsWith('.md'));
const imagenesUsadas = new Set();
const resumen = {};
let migradas = 0, descartadas = 0;

for (const f of archivos) {
  const slug = basename(f, '.md');
  if (DESCARTAR.has(slug)) { descartadas++; continue; }

  let coleccion = null, extra = null;
  for (const [col, mapa] of Object.entries(CLASIFICACION)) {
    if (mapa[slug]) { coleccion = col; extra = mapa[slug]; break; }
  }
  if (!coleccion) { console.warn('  SIN CLASIFICAR (descartada):', slug); descartadas++; continue; }

  const { fm, body } = parseFrontmatter(readFileSync(join(BK, 'md', f), 'utf8'));
  const titulo = tituloCorto(fm.titulo) || slug;
  // Solo se consideran portada las imagenes que realmente se rescataron.
  const imgs = (fm.imagenes || []).filter(Boolean)
    .filter(i => existsSync(join(BK, 'img', nombreAplanado(i))));
  const portada = imgs[0] || null;

  const cuerpo = limpiar(body, titulo, portada);
  const minPal = coleccion === 'productos' ? 8 : 25;
  if (cuerpo.split(/\s+/).length < minPal) { console.warn('  DEMASIADO CORTA:', slug); descartadas++; continue; }

  const desc = descripcion(fm, cuerpo);
  const slugFinal = extra.slug || slug;

  for (const i of imgs) imagenesUsadas.add(i);
  for (const m of cuerpo.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) imagenesUsadas.add(m[1]);

  const lineas = [
    '---',
    `titulo: ${yaml(titulo)}`,
    `descripcion: ${yaml(desc)}`,
    `urlOriginal: ${yaml(fm.url_original || '')}`,
  ];
  if (portada) lineas.push(`portada: ${yaml(rutaImagen(portada))}`);
  if (extra.categoria) lineas.push(`categoria: ${yaml(extra.categoria)}`);
  if (extra.grupo) lineas.push(`grupo: ${yaml(extra.grupo)}`);
  if (extra.fecha) lineas.push(`fecha: ${extra.fecha}`);
  if (extra.orden != null) lineas.push(`orden: ${extra.orden}`);
  lineas.push('---', '');

  const dir = join(OUT, coleccion);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, slugFinal + '.md'), lineas.join('\n') + cuerpo + '\n');
  resumen[coleccion] = (resumen[coleccion] || 0) + 1;
  migradas++;
}

// ---------------------------------------------------------------- imagenes
let copiadas = 0, faltantes = 0;
for (const src of imagenesUsadas) {
  if (!src || /^https?:/i.test(src)) continue;
  const limpio = decodeURIComponent(src.trim().split('?')[0]);
  const nombre = limpio.replace(/^\//, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-140);
  const origen = join(BK, 'img', nombre);
  if (existsSync(origen)) { copyFileSync(origen, join(IMGOUT, nombre)); copiadas++; }
  else faltantes++;
}

console.log('\n=== IMPORTACION ===');
console.log('Migradas: ', migradas, ' | Descartadas:', descartadas);
console.log('Por coleccion:', resumen);
console.log('Imagenes copiadas:', copiadas, '| no encontradas:', faltantes);
