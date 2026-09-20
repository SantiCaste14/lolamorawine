// Reescribe todas las referencias de imagen a .webp y borra los originales,
// salvo la imagen que se usa para compartir en redes (mejor compatibilidad en JPEG).
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const DIR = join('public', 'img');
const CONSERVAR = new Set(['images_fotosarticulos_escudo-lola-mora-wine.jpg']);

// 1. Reescribir referencias en el contenido
let cambios = 0;
function recorrer(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) { recorrer(p); continue; }
    if (!f.name.endsWith('.md')) continue;
    const antes = readFileSync(p, 'utf8');
    const despues = antes.replace(/(\/img\/[^)"'\s]+?)\.(jpe?g|png|gif)\b/gi, (m, base, ext) => {
      const archivo = basename(base) + '.' + ext;
      if (CONSERVAR.has(archivo)) return m;
      return existsSync(join(DIR, basename(base) + '.webp')) ? base + '.webp' : m;
    });
    if (antes !== despues) { writeFileSync(p, despues); cambios++; }
  }
}
recorrer(join('src', 'content'));

// 2. Borrar originales que ya tienen WebP
let borrados = 0, liberados = 0;
for (const f of readdirSync(DIR)) {
  if (!/\.(jpe?g|png|gif)$/i.test(f)) continue;
  if (CONSERVAR.has(f)) continue;
  const webp = join(DIR, basename(f, extname(f)) + '.webp');
  if (!existsSync(webp)) continue;
  liberados += statSync(join(DIR, f)).size;
  unlinkSync(join(DIR, f));
  borrados++;
}

console.log(`Archivos de contenido actualizados: ${cambios}`);
console.log(`Originales borrados: ${borrados}  (${(liberados / 1048576).toFixed(1)} MB liberados)`);
console.log(`Quedan en public/img: ${readdirSync(DIR).length} archivos`);
