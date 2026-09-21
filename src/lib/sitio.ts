/**
 * Configuracion central del sitio.
 * Todo lo editable sin tocar componentes vive aca: datos de la empresa,
 * menu de navegacion y textos legales obligatorios.
 */

export const sitio = {
  nombre: 'Lola Mora Wine',
  lema: 'Vinos con historia',
  bajada: 'Arte argentino en cada etiqueta',
  descripcion:
    'Vinos finos argentinos, delicatessen artesanales y regalos corporativos de Finca El Dátil. Malbec y Tempranillo, jamón crudo, salame de llama y aceite de oliva.',

  /** Datos de la empresa. COMPLETAR antes de publicar (Ley 24.240). */
  empresa: {
    razonSocial: '', // TODO: razón social que factura
    cuit: '',        // TODO: CUIT
    domicilio: '',   // TODO: domicilio fiscal
    inv: '',         // TODO: número de inscripción en el INV
  },

  contacto: {
    email: 'ventas@lolamorawine.com.ar',
    /** Formato internacional, sin espacios ni signos. */
    whatsapp: '',    // TODO: p. ej. 5493511234567
    telefono: '',    // TODO
  },

  redes: {
    instagram: '',   // TODO: URL del perfil real
    facebook: '',    // TODO: URL del perfil real
  },

  /** Navegacion principal. El orden es el que se ve. */
  navegacion: [
    { texto: 'Vinos', href: '/vinos/' },
    { texto: 'Delicatessen', href: '/delicatessen/' },
    { texto: 'Regalos corporativos', href: '/regalos-empresariales/' },
    { texto: 'La Finca', href: '/finca-el-datil/' },
    { texto: 'Lola Mora', href: '/lola-mora/' },
    { texto: 'Guías del vino', href: '/guias/' },
  ],

  pie: [
    {
      titulo: 'Productos',
      enlaces: [
        { texto: 'Vinos', href: '/vinos/' },
        { texto: 'Delicatessen', href: '/delicatessen/' },
        { texto: 'Regalos corporativos', href: '/regalos-empresariales/' },
      ],
    },
    {
      titulo: 'Historia',
      enlaces: [
        { texto: 'Lola Mora, la escultora', href: '/lola-mora/' },
        { texto: 'Finca El Dátil', href: '/finca-el-datil/' },
        { texto: 'Noticias', href: '/noticias/' },
      ],
    },
    {
      titulo: 'Institucional',
      enlaces: [
        { texto: 'Nosotros', href: '/nosotros/' },
        { texto: 'Contacto', href: '/contacto/' },
        { texto: 'Política de privacidad', href: '/politica-de-privacidad/' },
        { texto: 'Términos y condiciones', href: '/terminos-y-condiciones/' },
        { texto: 'Créditos de imágenes', href: '/creditos/' },
      ],
    },
  ],

  /** Leyenda obligatoria por Ley 24.788 en todo sitio que promocione alcohol. */
  leyendaAlcohol:
    'Beber con moderación. Prohibida su venta a menores de 18 años.',
} as const;

/** Prefija la ruta base configurada (GitHub Pages usa un subdirectorio). */
export function u(ruta: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|tel:|#)/i.test(ruta)) return ruta;
  return base + (ruta.startsWith('/') ? ruta : '/' + ruta);
}

export const categorias = {
  vinos: { nombre: 'Vinos', ruta: '/vinos/' },
  delicatessen: { nombre: 'Delicatessen', ruta: '/delicatessen/' },
  regalos: { nombre: 'Regalos corporativos', ruta: '/regalos-empresariales/' },
} as const;
