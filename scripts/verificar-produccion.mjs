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
      await p.waitForTimeout(100);
      const focoInicial = await p.evaluate(() => document.activeElement?.id);
      if (focoInicial !== 'edad-si') problemas.push(`el control de edad inicia el foco en ${focoInicial || 'ningún elemento'}`);
      await p.keyboard.press('Shift+Tab');
      const focoAtras = await p.evaluate(() => document.activeElement?.textContent?.trim());
      if (focoAtras !== 'No') problemas.push('el foco escapa del control de edad al retroceder con Tab');
      await p.keyboard.press('Tab');
      const focoVuelta = await p.evaluate(() => document.activeElement?.id);
      if (focoVuelta !== 'edad-si') problemas.push('el foco no queda contenido dentro del control de edad');
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
    // La barra de la portada cambia de estado con el scroll: hay que esperar a que
    // el listener vuelva a ejecutarse en el tope antes de capturar.
    await p.waitForTimeout(700);

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

    if (nombre === 'inicio') {
      const temaAntes = await p.locator('#tema').getAttribute('aria-label');
      await p.click('#tema');
      const temaDespues = await p.locator('#tema').getAttribute('aria-label');
      if (!temaAntes || temaAntes === temaDespues) problemas.push(`[${vista.n}] inicio — el selector de tema no anuncia el cambio`);

      if (vista.movil) {
        await p.click('#abrir-menu');
        if (await p.locator('#menu-movil').isHidden()) problemas.push('[movil] inicio — el menú no abre');
        await p.keyboard.press('Escape');
        if (await p.locator('#menu-movil').isVisible()) problemas.push('[movil] inicio — Escape no cierra el menú');
        if ((await p.locator('#abrir-menu').getAttribute('aria-expanded')) !== 'false') problemas.push('[movil] inicio — aria-expanded queda incorrecto');
      }
    }

    if (nombre === 'producto') {
      const hrefConsulta = await p.locator('[data-analytics="product_inquiry"]').getAttribute('href');
      if (!hrefConsulta?.includes('/contacto/?producto=')) problemas.push(`[${vista.n}] producto — la consulta no conserva el producto`);
    }

    for (const e of errores) problemas.push(`[${vista.n}] ${ruta} — ${e}`);

    await p.screenshot({ path: `${SALIDA}/${vista.n}-${nombre}.png` });
    await p.close();
  }
  await ctx.close();
}

// Flujos que necesitan una URL con parámetros y recursos fuera del documento.
const ctxFlujos = await nav.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-AR' });
await ctxFlujos.addInitScript(() => localStorage.setItem('lm-edad-ok', '1'));
const flujo = await ctxFlujos.newPage();
await flujo.goto(`${BASE}/contacto/?producto=Vino%20Lola%20Mora%20Malbec`, { waitUntil: 'networkidle' });
if ((await flujo.locator('#consulta-contexto').textContent())?.trim() !== 'Tu consulta: Vino Lola Mora Malbec') {
  problemas.push('contacto contextual — no muestra el producto consultado');
}
const mailtoContextual = await flujo.locator('#contacto-email').getAttribute('href');
if (!mailtoContextual?.includes('Consulta%3A%20Vino%20Lola%20Mora%20Malbec')) {
  problemas.push('contacto contextual — el email no incluye el producto en el asunto');
}

const robots = await (await flujo.request.get(`${BASE}/robots.txt`)).text();
if (BASE.includes('github.io') && !/Disallow:\s*\//.test(robots)) problemas.push('robots.txt — el entorno de prueba no bloquea la indexación');
if (!BASE.includes('github.io') && !/Sitemap:/i.test(robots)) problemas.push('robots.txt — falta la referencia al sitemap');

const gaAntesDeConsentir = await flujo.evaluate(() =>
  performance.getEntriesByType('resource').some((r) => r.name.includes('googletagmanager.com'))
);
if (gaAntesDeConsentir) problemas.push('analítica — Google Analytics cargó antes del consentimiento');
await flujo.close();
await ctxFlujos.close();

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
