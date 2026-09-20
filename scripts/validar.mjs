// Auditoria automatica del sitio compilado.
// Comprueba exactamente lo que estaba roto en el Joomla anterior, para que no vuelva a pasar.
// Uso: npm run build && npm run validar
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, posix } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH ?? '/lolamorawine').replace(/\/$/, '');

if (!existsSync(DIST)) {
  console.error('No existe dist/. Ejecutá primero: npm run build');
  process.exit(1);
}

// ---------------------------------------------------------------- recoleccion
const paginas = [];
(function recorrer(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (e.name === 'index.html') paginas.push(p);
  }
})(DIST);

const esRedireccion = (html) => /http-equiv="refresh"/i.test(html);
// El panel del CMS no es una pagina del sitio: es noindex y no lleva SEO.
const esPanel = (ruta) => /[\\/]admin[\\/]/.test(ruta);

const publicas = paginas.filter((p) => !esPanel(p));
const reales = publicas.filter((p) => !esRedireccion(readFileSync(p, 'utf8')));
const redirecciones = publicas.length - reales.length;

// ---------------------------------------------------------------- comprobaciones
const fallos = [];
const avisos = [];
let pesoTotal = 0;
let pesoMaximo = { ruta: '', bytes: 0 };

const rutaPublica = (archivo) => {
  const partes = relative(DIST, archivo).split(/[\\/]/).slice(0, -1);
  return (BASE + '/' + partes.join('/') + '/').replace(/\/+/g, '/');
};

for (const archivo of reales) {
  const html = readFileSync(archivo, 'utf8');
  const ruta = rutaPublica(archivo).replace(/\/+/g, '/');
  const bytes = statSync(archivo).size;
  pesoTotal += bytes;
  if (bytes > pesoMaximo.bytes) pesoMaximo = { ruta, bytes };

  // 1. Exactamente un <h1>
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) fallos.push(`${ruta} — tiene ${h1} <h1> (debe ser exactamente 1)`);

  // 2. Canonica propia (el Joomla viejo apuntaba todo a la home)
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (!canon) fallos.push(`${ruta} — sin <link rel="canonical">`);
  else if (!canon.endsWith(ruta)) fallos.push(`${ruta} — canónica apunta a ${canon}`);

  // 3. Metadatos sociales
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:url']) {
    if (!html.includes(`property="${prop}"`)) fallos.push(`${ruta} — falta ${prop}`);
  }
  if (!html.includes('name="twitter:card"')) avisos.push(`${ruta} — sin twitter:card`);

  // 4. Descripcion
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '';
  if (desc.length < 40) fallos.push(`${ruta} — description de ${desc.length} caracteres`);
  if (desc.length > 200) avisos.push(`${ruta} — description larga (${desc.length})`);

  // 5. Titulo
  const titulo = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
  if (!titulo) fallos.push(`${ruta} — sin <title>`);
  if (titulo.length > 70) avisos.push(`${ruta} — title de ${titulo.length} caracteres`);

  // 6. Idioma y viewport
  if (!/<html[^>]+lang="es/i.test(html)) fallos.push(`${ruta} — sin lang="es"`);
  if (!html.includes('name="viewport"')) fallos.push(`${ruta} — sin viewport`);

  // 7. Datos estructurados
  if (!html.includes('application/ld+json')) avisos.push(`${ruta} — sin schema.org`);

  // 8. Imagenes con alt y con archivo existente
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (!/\balt=/i.test(attrs)) fallos.push(`${ruta} — <img> sin alt`);
    const src = attrs.match(/\bsrc="([^"]+)"/i)?.[1];
    if (src && src.startsWith(BASE + '/')) {
      const local = join(DIST, src.slice(BASE.length + 1));
      if (!existsSync(local)) fallos.push(`${ruta} — imagen inexistente: ${src}`);
    }
  }

  // 9. Restos del sitio viejo que no deben aparecer nunca mas
  for (const [patron, motivo] of [
    [/tvariable/, 'código JS roto del redimensionador'],
    [/&amp;(ntilde|aacute|eacute|iacute|oacute|uacute);/, 'entidad HTML doblemente codificada'],
    [/\$0,00/, 'precio en cero'],
    [/Viino/, 'errata "Viino"'],
    [/getflashplayer/i, 'enlace a Flash Player'],
    [/Delicatesen\b/, 'errata "Delicatesen"'],
  ]) {
    if (patron.test(html)) fallos.push(`${ruta} — ${motivo}`);
  }

  // 10. Enlaces internos que apuntan a una pagina inexistente
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = m[1];
    if (!href.startsWith(BASE + '/')) continue;
    if (/\.(pdf|xml|svg|webp|jpe?g|png|ico|txt)$/i.test(href)) {
      const rec = join(DIST, href.slice(BASE.length + 1));
      if (!existsSync(rec)) fallos.push(`${ruta} — enlace a archivo inexistente: ${href}`);
      continue;
    }
    const destino = join(DIST, href.slice(BASE.length + 1), 'index.html');
    if (!existsSync(destino)) fallos.push(`${ruta} — enlace roto: ${href}`);
  }
}

// 11. Archivos que deben existir
for (const f of ['sitemap-index.xml', 'robots.txt', '_redirects', '_headers', '404.html', 'favicon.svg']) {
  if (!existsSync(join(DIST, f))) avisos.push(`falta dist/${f}`);
}

// ---------------------------------------------------------------- informe
const kb = (b) => (b / 1024).toFixed(0) + ' KB';
console.log('======================================================');
console.log('  VALIDACIÓN DEL SITIO');
console.log('======================================================');
console.log(`Páginas reales:        ${reales.length}`);
console.log(`Páginas de redirección:${String(redirecciones).padStart(6)}`);
console.log(`Peso HTML promedio:    ${kb(pesoTotal / reales.length)}`);
console.log(`Página más pesada:     ${kb(pesoMaximo.bytes)}  ${pesoMaximo.ruta}`);
console.log('');

const unicos = (a) => [...new Set(a)];
const f = unicos(fallos), v = unicos(avisos);

if (f.length === 0) {
  console.log('✔ Sin fallos.');
} else {
  console.log(`✖ ${f.length} fallo(s):`);
  f.slice(0, 40).forEach((x) => console.log('   ' + x));
  if (f.length > 40) console.log(`   ... y ${f.length - 40} más`);
}
console.log('');
if (v.length) {
  console.log(`⚠ ${v.length} aviso(s):`);
  v.slice(0, 15).forEach((x) => console.log('   ' + x));
  if (v.length > 15) console.log(`   ... y ${v.length - 15} más`);
}

process.exit(f.length ? 1 : 0);
