// Remapea las 4.098 URLs del Joomla viejo a la arquitectura nueva del sitio.
// Salida: src/lib/redirects.mjs  (lo consume astro.config.mjs)
//         public/_redirects      (formato Cloudflare Pages / Netlify, 301 reales)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const BK = join('..', 'backup-2026-08-28');

// Ruta publica de cada coleccion
const RUTA = {
  productos: '/productos',
  vinos: '/guias',
  delicatessen: '/delicatessen',
  historia: '/lola-mora',
  finca: '/finca-el-datil',
  noticias: '/noticias',
};

// Paginas sueltas: slug de origen -> ruta final
const PAGINAS = {
  'quienes-somos': '/nosotros/',
  'escudo-lola-mora-wine': '/nosotros/escudo/',
  'en-permanente-busqueda': '/nosotros/en-permanente-busqueda/',
  'politica-de-privacidad': '/politica-de-privacidad/',
};

// Destinos para lo que no se migro (nunca a la home salvo ruido explicito)
const SECCION_POR_SLUG = [
  [/vino|malbec|tempranillo|torrontes|degustacion|varietal|bodega/i, '/vinos/'],
  [/regalo|pack|estuche|empresarial|corporate/i, '/regalos-empresariales/'],
  [/jamon|salame|chacinado|aceite|delicatessen|delicatesen|bondiola/i, '/delicatessen/'],
  [/finca|datil|caballo|carruaje|guzman|origen/i, '/finca-el-datil/'],
  [/lola-mora|biografia|obra|nereida|avellaneda|bandera|congreso|tucuman|controversia|sorich|esplendor|ocaso/i, '/lola-mora/'],
  [/noticia|evento|blog|novedad/i, '/noticias/'],
  [/contacto|contactenos/i, '/contacto/'],
  [/privacidad|legal|termino/i, '/politica-de-privacidad/'],
  [/nosotros|empresa|escudo|quienes/i, '/nosotros/'],
];

// 1. Mapa slug-de-contenido -> ruta final, leyendo lo que realmente se publico
const destinoPorSlug = {};
for (const [col, ruta] of Object.entries(RUTA)) {
  const dir = join('src', 'data', col);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter(x => x.endsWith('.md'))) {
    destinoPorSlug[basename(f, '.md')] = `${ruta}/${basename(f, '.md')}/`;
  }
}
Object.assign(destinoPorSlug, PAGINAS);

// 2. Leer el mapa viejo (url_vieja -> /slug-viejo/)
const viejo = JSON.parse(readFileSync(join(BK, 'meta', 'redirects.json'), 'utf8'));

const fallback = (slug, urlVieja) => {
  const s = slug + ' ' + urlVieja;
  const hit = SECCION_POR_SLUG.find(([re]) => re.test(s));
  return hit ? hit[1] : '/';
};

const mapa = {};
const conflictos = new Set();
const stats = { directo: 0, fallback: 0, home: 0 };
for (const [urlVieja, destinoViejo] of Object.entries(viejo)) {
  const slug = destinoViejo.replace(/^\/|\/$/g, '');
  let destino;
  if (!slug) { destino = '/'; stats.home++; }
  else if (destinoPorSlug[slug]) { destino = destinoPorSlug[slug]; stats.directo++; }
  else { destino = fallback(slug, urlVieja); destino === '/' ? stats.home++ : stats.fallback++; }

  // Astro no admite la raiz ni destinos identicos al origen
  const origen = urlVieja.split('?')[0];
  if (!origen || origen === '/' || origen === destino) continue;
  if (!/^\/[A-Za-z0-9._~\-\/]*$/.test(origen)) continue;  // sin querystring ni caracteres raros
  if (mapa[origen] && mapa[origen] !== destino) conflictos.add(origen);
  mapa[origen] = destino;
}

// Una misma ruta Joomla podía representar destinos distintos según la query.
// Los redirects por archivo no pueden leerla; nunca se elige arbitrariamente
// el último producto. Se usa un destino de sección si la ruta lo permite y,
// para /index.php, la portada neutral.
for (const origen of conflictos) mapa[origen] = fallback('', origen);

// 3. Astro: objeto de redirects (genera una pagina con meta-refresh + canonical)
const entradas = Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b));
writeFileSync(join('src', 'lib', 'redirects.mjs'),
  '// GENERADO por scripts/generar-redirects.mjs - no editar a mano.\n' +
  `// ${entradas.length} URLs del sitio Joomla anterior, preservadas para no perder SEO.\n` +
  'export default ' + JSON.stringify(Object.fromEntries(entradas), null, 0) + ';\n');

// 4. Cloudflare Pages / Netlify: 301 de verdad a nivel servidor
writeFileSync(join('public', '_redirects'),
  '# 301 del sitio Joomla anterior. Generado automaticamente.\n' +
  entradas.map(([de, a]) => `${de}  ${a}  301`).join('\n') + '\n');

console.log(`Redirecciones: ${entradas.length}`);
console.log(stats);
console.log('-> src/lib/redirects.mjs y public/_redirects');
