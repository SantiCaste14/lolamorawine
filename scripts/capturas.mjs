// Validacion visual con un navegador real: captura las paginas clave en
// escritorio y movil, en tema claro y oscuro, y reporta errores de consola,
// recursos que fallan y desborde horizontal.
// Usa el Chrome instalado en el sistema (Playwright no puede descargar el suyo aca).
import { chromium } from 'playwright';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH ?? '/lolamorawine').replace(/\/$/, '');
const PUERTO = 4331;
const SALIDA = 'capturas';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.pdf': 'application/pdf',
  '.txt': 'text/plain', '.ico': 'image/x-icon', '.gif': 'image/gif',
};

// ---------------------------------------------------------------- servidor
const servidor = createServer(async (req, res) => {
  try {
    let ruta = decodeURIComponent(req.url.split('?')[0]);
    if (BASE && ruta.startsWith(BASE)) ruta = ruta.slice(BASE.length) || '/';
    let archivo = join(DIST, ruta);
    try {
      if ((await stat(archivo)).isDirectory()) archivo = join(archivo, 'index.html');
    } catch {
      if (!extname(archivo)) archivo = join(archivo, 'index.html');
    }
    const cuerpo = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': MIME[extname(archivo)] ?? 'application/octet-stream' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    try { res.end(await readFile(join(DIST, '404.html'))); } catch { res.end('404'); }
  }
});
await new Promise((r) => servidor.listen(PUERTO, r));

// ---------------------------------------------------------------- paginas a revisar
const PAGINAS = [
  ['inicio', '/'],
  ['vinos', '/vinos/'],
  ['producto-malbec', '/productos/vino-lola-mora-malbec/'],
  ['regalos', '/regalos-empresariales/'],
  ['producto-pack', '/productos/pack-para-regalo-empresarial-1/'],
  ['delicatessen', '/delicatessen/'],
  ['lola-mora', '/lola-mora/'],
  ['articulo', '/lola-mora/lola-mora-esplendor-1895-1909/'],
  ['finca', '/finca-el-datil/'],
  ['guias', '/guias/'],
  ['noticias', '/noticias/'],
  ['nosotros', '/nosotros/'],
  ['contacto', '/contacto/'],
  ['arrepentimiento', '/boton-de-arrepentimiento/'],
  ['terminos', '/terminos-y-condiciones/'],
  ['404', '/no-existe-esta-pagina/'],
];

const VISTAS = [
  { nombre: 'escritorio', ancho: 1440, alto: 900, movil: false },
  { nombre: 'movil', ancho: 390, alto: 844, movil: true },
];

if (existsSync(SALIDA)) rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

const problemas = [];
const navegador = await chromium.launch({ channel: 'chrome' });

for (const vista of VISTAS) {
  for (const tema of ['light', 'dark']) {
    const ctx = await navegador.newContext({
      viewport: { width: vista.ancho, height: vista.alto },
      deviceScaleFactor: 1,
      isMobile: vista.movil,
      hasTouch: vista.movil,
      colorScheme: tema,
      locale: 'es-AR',
    });
    // Saltar el control de edad para poder capturar el contenido
    await ctx.addInitScript(() => {
      try { localStorage.setItem('lm-edad-ok', '1'); } catch {}
    });

    for (const [nombre, ruta] of PAGINAS) {
      const pagina = await ctx.newPage();
      const consola = [];
      const fallidos = [];
      pagina.on('console', (m) => { if (m.type() === 'error') consola.push(m.text()); });
      pagina.on('requestfailed', (r) => fallidos.push(r.url()));
      pagina.on('response', (r) => { if (r.status() >= 400) fallidos.push(`${r.status()} ${r.url()}`); });

      const destino = `http://localhost:${PUERTO}${BASE}${ruta}`;
      try {
        await pagina.goto(destino, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (e) {
        problemas.push(`[${vista.nombre}/${tema}] ${ruta} — no cargó: ${e.message}`);
        await pagina.close();
        continue;
      }

      // Recorrer la pagina para que se disparen las imagenes con loading="lazy".
      // Cada espera lleva tope propio: sin el, una imagen que nunca emite evento
      // dejaria el script colgado para siempre.
      await pagina.evaluate(async () => {
        const paso = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += paso) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
        await Promise.all(
          [...document.images].map((img) =>
            img.complete
              ? Promise.resolve()
              : Promise.race([
                  new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }),
                  new Promise((r) => setTimeout(r, 3000)),
                ])
          )
        );
      });
      await pagina.waitForTimeout(200);

      // Imagenes que quedaron sin cargar (rotas de verdad)
      const rotas = await pagina.evaluate(() =>
        [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
      );
      for (const r of rotas) problemas.push(`[${vista.nombre}/${tema}] ${ruta} — imagen rota: ${r}`);

      // Desborde horizontal: el sintoma clasico del sitio viejo en movil
      const desborde = await pagina.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (desborde > 2) {
        problemas.push(`[${vista.nombre}/${tema}] ${ruta} — desborde horizontal de ${desborde}px`);
      }

      // Contraste minimo: que el texto no quede del mismo color que el fondo
      const invisible = await pagina.evaluate(() => {
        const cuerpo = getComputedStyle(document.body);
        return cuerpo.color === cuerpo.backgroundColor;
      });
      if (invisible) problemas.push(`[${vista.nombre}/${tema}] ${ruta} — texto del mismo color que el fondo`);

      // En la prueba de 404 el estado 404 es el resultado correcto, no un fallo.
      if (nombre !== '404') {
        for (const c of consola) problemas.push(`[${vista.nombre}/${tema}] ${ruta} — consola: ${c}`);
        for (const r of fallidos) problemas.push(`[${vista.nombre}/${tema}] ${ruta} — recurso: ${r}`);
      } else {
        const titulo = await pagina.title();
        if (!/no encontrada/i.test(titulo)) {
          problemas.push(`[${vista.nombre}/${tema}] la página 404 no se está sirviendo (título: ${titulo})`);
        }
      }

      if (tema === 'light' || nombre === 'inicio' || nombre === 'producto-malbec') {
        await pagina.screenshot({
          path: join(SALIDA, `${vista.nombre}-${tema}-${nombre}.png`),
        });
      }
      await pagina.close();
    }
    await ctx.close();
  }
}

await navegador.close();
servidor.close();

console.log('======================================================');
console.log('  VALIDACIÓN VISUAL');
console.log('======================================================');
console.log(`Páginas revisadas: ${PAGINAS.length} × ${VISTAS.length} vistas × 2 temas`);
console.log(`Capturas en: ${SALIDA}/`);
console.log('');
const unicos = [...new Set(problemas)];
if (unicos.length === 0) {
  console.log('✔ Sin problemas visuales, de consola ni de recursos.');
} else {
  console.log(`✖ ${unicos.length} problema(s):`);
  unicos.slice(0, 40).forEach((p) => console.log('   ' + p));
  if (unicos.length > 40) console.log(`   ... y ${unicos.length - 40} más`);
}
process.exit(unicos.length ? 1 : 0);
