import { getCollection, type CollectionEntry } from 'astro:content';

export type ColeccionEditorial = 'vinos' | 'delicatessen' | 'historia' | 'finca' | 'noticias' | 'paginas';

/** Ruta publica de cada coleccion. Cambiarla acá la cambia en todo el sitio. */
export const RUTAS: Record<string, string> = {
  productos: '/productos',
  vinos: '/guias',
  delicatessen: '/delicatessen',
  historia: '/lola-mora',
  finca: '/finca-el-datil',
  noticias: '/noticias',
  paginas: '/nosotros',
};

/** Entradas publicadas (descarta borradores) y ordenadas. */
export async function publicadas<T extends ColeccionEditorial>(nombre: T) {
  const todas = await getCollection(nombre, ({ data }: any) => data.borrador !== true);
  return todas.sort((a: any, b: any) => {
    if (nombre === 'noticias') {
      return new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime();
    }
    const d = (a.data.orden ?? 99) - (b.data.orden ?? 99);
    return d !== 0 ? d : a.data.titulo.localeCompare(b.data.titulo, 'es');
  });
}

/** Agrupa por el campo `grupo`, conservando el orden de aparición. */
export function porGrupo<T extends { data: { grupo?: string } }>(entradas: T[]) {
  const mapa = new Map<string, T[]>();
  for (const e of entradas) {
    const g = e.data.grupo ?? 'General';
    if (!mapa.has(g)) mapa.set(g, []);
    mapa.get(g)!.push(e);
  }
  return [...mapa.entries()];
}

/** Vecinos dentro de la misma colección, para la navegación del pie del artículo. */
export function vecinos(entradas: { id: string; data: { titulo: string } }[], id: string, base: string) {
  const i = entradas.findIndex((e) => e.id === id);
  const a = i > 0 ? entradas[i - 1] : null;
  const s = i >= 0 && i < entradas.length - 1 ? entradas[i + 1] : null;
  return {
    anterior: a ? { titulo: a.data.titulo, href: `${base}/${a.id}/` } : null,
    siguiente: s ? { titulo: s.data.titulo, href: `${base}/${s.id}/` } : null,
  };
}

export async function productosPorCategoria(categoria: 'vinos' | 'delicatessen' | 'regalos') {
  const todos = (await getCollection('productos', ({ data }: any) => data.borrador !== true)) as CollectionEntry<'productos'>[];
  return todos
    .filter((p) => p.data.categoria === categoria)
    .sort((a, b) => (a.data.orden ?? 99) - (b.data.orden ?? 99));
}
