// Verificacion de punta a punta contra el sitio publicado.
// Uso: node scripts/verificar-produccion.mjs [url-base]
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'https://santiagocastellanos14.github.io/lolamorawine').replace(/\/$/, '');
const SALIDA = 'capturas/produccion';
if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

const RUTAS = [
  ['inicio', '/'],
  ['vinos', '/vinos/'],
  ['producto', '/productos/vino-lola-mora-malbec/'],
  ['regalos', '/regalos-empresariales/'],
  ['articulo', '/lola-mora/lola-mora-esplendor-1895-1909/'],
  ['contacto', '/contacto/'],
];

const problemas = [];
const nav = await chromium.launch({ channel: 'chrome' });

for (const vista of [
  { n: 'escritorio', w: 1440, h: 900, movil: false },
  { n: 'movil', w: 390, h: 844, movil: true },
]) {
  const ctx = await nav.newContext({
    viewport: { width: vista.w, height: vista.h },
    isMobile: vista.movil,
    hasTouch: vista.movil,
    locale: 'es-AR',
  });

  for (const [nombre, ruta] of RUTAS) {
    const p = await ctx.newPage();
    const errores = [];
    p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    p.on('response', (r) => { if (r.status() >= 400) errores.push(`${r.status()} ${r.url()}`); });

    await p.goto(BASE + ruta, { waitUntil: 'networkidle', timeout: 45000 });

    // La primera visita real muestra el control de edad: comprobarlo y pasarlo
    if (nombre === 'inicio' && vista.n === 'escritorio') {
      const visible = await p.isVisible('#control-edad');
      if (!visible) problemas.push('el control de edad no aparece en la primera visita');
      await p.click('#edad-si').catch(() => {});
    } else {
      await p.evaluate(() => { try { localStorage.setItem('lm-edad-ok', '1'); } catch {} });
      await p.reload({ waitUntil: 'networkidle' });
    }

    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(600);

    const rotas = await p.evaluate(() =>
      [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
    );
    for (const r of rotas) problemas.push(`[${vista.n}] ${ruta} — imagen rota: ${r}`);

    const desborde = await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (desborde > 2) problemas.push(`[${vista.n}] ${ruta} — desborde horizontal de ${desborde}px`);

    const h1 = await p.locator('h1').count();
    if (h1 !== 1) problemas.push(`[${vista.n}] ${ruta} — ${h1} <h1>`);

    for (const e of errores) problemas.push(`[${vista.n}] ${ruta} — ${e}`);

    await p.screenshot({ path: `${SALIDA}/${vista.n}-${nombre}.png` });
    await p.close();
  }
  await ctx.close();
}

await nav.close();

console.log('======================================================');
console.log('  VERIFICACIÓN EN PRODUCCIÓN');
console.log('======================================================');
console.log(`URL: ${BASE}`);
console.log(`Páginas: ${RUTAS.length} × 2 vistas`);
const u = [...new Set(problemas)];
console.log('');
if (!u.length) console.log('✔ El sitio publicado funciona correctamente.');
else { console.log(`✖ ${u.length} problema(s):`); u.forEach((x) => console.log('   ' + x)); }
process.exit(u.length ? 1 : 0);
