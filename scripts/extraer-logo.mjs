// Recupera los activos de marca del sitio viejo: escudo, firma y dibujos del encabezado.
// Se extraen desde el navegador porque varios son fondos CSS, no etiquetas <img>.
import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const SALIDA = 'public/img/marca';
if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

const nav = await chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('https://www.lolamorawine.com.ar/', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);

// Todo lo visual dentro de los primeros 230px de alto (la banda del encabezado)
const activos = await p.evaluate(() => {
  const salida = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.top > 240 || r.width < 12 || r.height < 12) continue;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (bg && bg !== 'none') {
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        salida.push({ url: m[1], via: 'css', w: Math.round(r.width), h: Math.round(r.height), sel: el.tagName + (el.id ? '#' + el.id : '') });
      }
    }
    if (el.tagName === 'IMG' && el.src) {
      salida.push({ url: el.src, via: 'img', w: Math.round(r.width), h: Math.round(r.height), sel: 'IMG' + (el.alt ? `[${el.alt}]` : '') });
    }
  }
  return salida;
});

const vistos = new Set();
console.log('=== activos del encabezado ===');
for (const a of activos) {
  if (vistos.has(a.url)) continue;
  vistos.add(a.url);
  const nombre = decodeURIComponent(a.url.split('/').pop().split('?')[0]);
  console.log(`  ${String(a.w + 'x' + a.h).padStart(10)}  ${a.via.padEnd(4)} ${a.sel.padEnd(22)} ${nombre}`);
  try {
    const res = await p.request.get(a.url);
    if (res.ok()) {
      const buf = Buffer.from(await res.body());
      if (buf.length > 400) {
        writeFileSync(`${SALIDA}/${nombre.replace(/[^A-Za-z0-9._-]/g, '_')}`, buf);
      }
    }
  } catch { /* recurso no accesible */ }
}

// Recorte del encabezado completo, como referencia visual
await p.screenshot({ path: 'capturas/referencias/00-encabezado-viejo.png', clip: { x: 150, y: 0, width: 980, height: 220 } });
console.log('\nRecorte del encabezado: capturas/referencias/00-encabezado-viejo.png');

await nav.close();
