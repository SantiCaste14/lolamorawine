import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** Campos que comparten todas las colecciones editoriales. */
const base = {
  titulo: z.string().min(3),
  descripcion: z.string().min(20).max(300),
  /** URL que tenia esta pagina en el sitio Joomla anterior (solo referencia). */
  urlOriginal: z.string().optional(),
  /** Ruta de la imagen principal, relativa a /public. */
  portada: z.string().optional(),
  /** Subseccion dentro de la coleccion, para agrupar en los indices. */
  grupo: z.string().optional(),
  /** Orden manual dentro de la coleccion. Menor = primero. */
  orden: z.number().default(99),
  /** Marcar true para que no se publique. */
  borrador: z.boolean().default(false),
};

const md = (carpeta: string) =>
  glob({ pattern: '**/*.md', base: `./src/data/${carpeta}` });

/** Fichas de producto: vinos, delicatessen y regalos empresariales. */
const productos = defineCollection({
  loader: md('productos'),
  schema: z.object({
    ...base,
    categoria: z.enum(['vinos', 'delicatessen', 'regalos']),
    /** Precio en pesos. Dejar sin definir mientras no haya precio real:
     *  la ficha muestra "Consultar" en lugar de un precio falso. */
    precio: z.number().positive().optional(),
    /** Enlace a la publicacion de MercadoLibre, si existe. */
    mercadolibre: z.url().optional(),
    /** Lista de componentes, para los packs de regalo. */
    contenido: z.array(z.string()).optional(),
    /** Datos de ficha tecnica de vino. */
    anada: z.string().optional(),
    varietal: z.string().optional(),
    graduacion: z.string().optional(),
    volumen: z.string().optional(),
    origen: z.string().optional(),
    disponible: z.boolean().optional(),
  }),
});

// El Content Layer actual requiere que las colecciones con loader vivan fuera
// de src/content. src/data evita el modo heredado y compila igual en CI y local.
const vinos = defineCollection({ loader: md('vinos'), schema: z.object(base) });
const delicatessen = defineCollection({ loader: md('delicatessen'), schema: z.object(base) });
const historia = defineCollection({ loader: md('historia'), schema: z.object(base) });
const finca = defineCollection({ loader: md('finca'), schema: z.object(base) });
const paginas = defineCollection({ loader: md('paginas'), schema: z.object(base) });

const noticias = defineCollection({
  loader: md('noticias'),
  schema: z.object({ ...base, fecha: z.coerce.date() }),
});

export const collections = { productos, vinos, delicatessen, historia, finca, noticias, paginas };
