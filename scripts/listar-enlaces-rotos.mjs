// Diagnóstico detallado de enlaces internos del HTML compilado.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH ?? '/lolamorawine').replace(/\/$/, '');
const paginas = [];

(function recorrer(dir) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) recorrer(ruta);
    else if (entrada.name === 'index.html') paginas.push(ruta);
  }
})(DIST);

const rotos = new Map();
for (const archivo of paginas) {
  const html = readFileSync(archivo, 'utf8');
  if (/http-equiv="refresh"/i.test(html)) continue;
  const origen = '/' + relative(DIST, archivo).replaceAll('\\', '/').replace(/index\.html$/, '');

  for (const coincidencia of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = coincidencia[1].replaceAll('&amp;', '&');
    const rutaHref = href.split(/[?#]/)[0];
    if (!rutaHref.startsWith(BASE + '/') || /\.(pdf|xml|svg|webp|jpe?g|png|ico|txt)$/i.test(rutaHref)) continue;
    const destino = join(DIST, rutaHref.slice(BASE.length + 1), 'index.html');
    if (existsSync(destino)) continue;
    if (!rotos.has(href)) rotos.set(href, []);
    rotos.get(href).push(origen);
  }
}

for (const [destino, origenes] of rotos) {
  console.log(destino);
  for (const origen of origenes) console.log(`  <- ${origen}`);
}
console.log(`\nDestinos rotos únicos: ${rotos.size}`);
process.exitCode = rotos.size ? 1 : 0;
