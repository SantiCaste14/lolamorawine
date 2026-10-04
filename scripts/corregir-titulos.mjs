// Corrige titulos heredados del CMS viejo: mojibake, Title Case en ingles
// aplicado al castellano, puntos finales y titulos demasiado largos para el <title>.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** slug -> { titulo, descripcion? } */
const CORRECCIONES = {
  'finca/carruajes-antiguos-en-competencia-el-tala-salta-argentina': {
    titulo: 'Competencia en El Tala, Salta',
  },
  'finca/carruajes-antiguos-en-el-festival-de-jesus-mara-a-cordoba-argentina': {
    titulo: 'Festival de Jesús María, Córdoba',
  },
  'finca/carruajes-antiguos-en-el-tala-salta-argentina': {
    titulo: 'Carruajes antiguos en El Tala, Salta',
  },
  'finca/caballos-peruanos-de-paso': { titulo: 'Galería de caballos peruanos de paso' },
  'delicatessen/salame-de-llama': { titulo: 'Salame de llama' },
  'noticias/con-diseno-de-cesar-pelli-inauguraron-el-centro-cultural-lola-mora-en-': {
    titulo: 'Centro Cultural Lola Mora, por César Pelli',
  },
  'noticias/roberto-arce-vadillo-conociendo-el-mundo-del-vino': {
    titulo: 'Roberto Arce Vadillo y el mundo del vino',
  },
  'finca/la-finca': { titulo: 'Finca El Dátil' },
  'finca/caballos-de-paso-de-finca-el-datil': { titulo: 'Caballos de paso de Finca El Dátil' },
  'finca/finca-el-datil-una-propiedad-con-historia': { titulo: 'Finca El Dátil, una propiedad con historia' },
  'finca/carruajes-antiguos': { titulo: 'Carruajes antiguos' },
  'finca/alfredo-guzman-biografia-de-un-pionero': { titulo: 'Alfredo Guzmán, biografía de un pionero' },
};

/** Nombres propios que el ajuste de mayusculas no debe tocar. */
const PROPIOS = [
  [/\bFinca el Dátil\b/g, 'Finca El Dátil'],
  [/\ben el Tala\b/g, 'en El Tala'],
  [/\bel Tala\b/g, 'El Tala'],
  [/\bel Dátil\b/g, 'El Dátil'],
];

/** Palabras que quedan en minuscula dentro de un titulo en castellano. */
const MINUSCULAS = new Set([
  'a', 'ante', 'bajo', 'con', 'contra', 'de', 'del', 'desde', 'durante', 'e',
  'el', 'en', 'entre', 'hacia', 'hasta', 'la', 'las', 'los', 'o', 'para', 'por',
  'según', 'sin', 'sobre', 'tras', 'u', 'un', 'una', 'y',
]);

/** "Carruajes Antiguos En El Tala" -> "Carruajes antiguos en El Tala" */
function casoCastellano(t) {
  const palabras = t.split(' ');
  // Solo actuar si parece Title Case ingles: mayoria de palabras capitalizadas
  const capitalizadas = palabras.filter((p) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(p)).length;
  if (capitalizadas < palabras.length * 0.7 || palabras.length < 3) return t;

  return palabras
    .map((p, i) => {
      const limpio = p.replace(/[(),.]/g, '');
      if (i > 0 && MINUSCULAS.has(limpio.toLowerCase())) {
        return p.replace(limpio, limpio.toLowerCase());
      }
      return p;
    })
    .join(' ');
}

const MOJIBAKE = [
  [/Marã­a/g, 'María'], [/ã­/g, 'í'], [/ã¡/g, 'á'], [/ã©/g, 'é'],
  [/ã³/g, 'ó'], [/ãº/g, 'ú'], [/ã±/g, 'ñ'], [/â€œ/g, '“'], [/â€/g, '”'],
];

let tocados = 0;
for (const coleccion of readdirSync(join('src', 'data'))) {
  const dir = join('src', 'data', coleccion);
  for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const ruta = join(dir, archivo);
    const clave = `${coleccion}/${archivo.replace(/\.md$/, '')}`;
    let texto = readFileSync(ruta, 'utf8');
    const original = texto;

    // 1. Mojibake en todo el archivo
    for (const [re, a] of MOJIBAKE) texto = texto.replace(re, a);

    // 2. Titulo: correccion manual, luego caso castellano, luego punto final
    texto = texto.replace(/^titulo: "(.*)"$/m, (m, t) => {
      let nuevo = CORRECCIONES[clave]?.titulo ?? t;
      for (const [re, a] of MOJIBAKE) nuevo = nuevo.replace(re, a);
      nuevo = casoCastellano(nuevo).replace(/\s*\.\s*$/, '').trim();
      for (const [re, a] of PROPIOS) nuevo = nuevo.replace(re, a);
      return `titulo: ${JSON.stringify(nuevo)}`;
    });

    if (texto !== original) { writeFileSync(ruta, texto); tocados++; }
  }
}
console.log(`Archivos corregidos: ${tocados}`);

// Informe de titulos que siguen siendo largos para el <title> (con el sufijo de marca)
const LIMITE = 52;
for (const coleccion of readdirSync(join('src', 'data'))) {
  const dir = join('src', 'data', coleccion);
  for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const t = readFileSync(join(dir, archivo), 'utf8').match(/^titulo: "(.*)"$/m)?.[1] ?? '';
    if (t.length > LIMITE) console.log(`  largo (${t.length}): ${coleccion}/${archivo} — ${t}`);
  }
}
