// Captura el sitio viejo y las referencias premium, para diseñar con criterio y no de memoria.
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';

const SALIDA = 'capturas/referencias';
if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

const SITIOS = [
  ['01-viejo-home', 'https://www.lolamorawine.com.ar/', 1280],
  ['02-viejo-vinos', 'https://www.lolamorawine.com.ar/vinos-lola-mora.html', 1280],
  ['03-viejo-historia', 'https://www.lolamorawine.com.ar/historia.html', 1280],
  ['04-enemigo', 'https://enemigowines.com/', 1440],
  ['05-catena', 'https://www.catenawines.com/', 1440],
  ['06-zuccardi', 'https://www.zuccardiwines.com/', 1440],
  ['07-rutini', 'https://www.rutiniwines.com/', 1440],
];

const nav = await chromium.launch({ channel: 'chrome' });

for (const [nombre, url, ancho] of SITIOS) {
  const ctx = await nav.newContext({
    viewport: { width: ancho, height: 900 },
    locale: 'es-AR',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  });
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(3500);

    // Cerrar controles de edad / cookies que tapan el diseño
    for (const texto of ['Sí', 'SI', 'Yes', 'Aceptar', 'Acepto', 'Ingresar', 'Entrar', 'ACCEPT', 'Soy mayor']) {
      const b = p.locator(`button:has-text("${texto}"), a:has-text("${texto}")`).first();
      if (await b.count().catch(() => 0)) {
        await b.click({ timeout: 2500 }).catch(() => {});
        await p.waitForTimeout(1200);
        break;
      }
    }

    await p.evaluate(async () => {
      for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1200);

    await p.screenshot({ path: `${SALIDA}/${nombre}.png` });
    // Paleta real: colores dominantes de la página
    const paleta = await p.evaluate(() => {
      const cuenta = {};
      for (const el of [...document.querySelectorAll('*')].slice(0, 2500)) {
        const cs = getComputedStyle(el);
        for (const c of [cs.backgroundColor, cs.color]) {
          if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) cuenta[c] = (cuenta[c] || 0) + 1;
        }
      }
      return Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 10);
    });
    const fuentes = await p.evaluate(() => {
      const f = new Set();
      for (const el of [...document.querySelectorAll('h1,h2,h3,p,body,a')].slice(0, 400)) {
        f.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, ''));
      }
      return [...f].slice(0, 8);
    });
    console.log(`\n### ${nombre}`);
    console.log('  colores:', paleta.map(([c, n]) => `${c}×${n}`).join('  '));
    console.log('  fuentes:', fuentes.join(', '));
  } catch (e) {
    console.log(`\n### ${nombre} — no se pudo capturar: ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
}

await nav.close();
console.log(`\nCapturas en ${SALIDA}/`);
