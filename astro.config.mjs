// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import redirectsCrudos from './src/lib/redirects.mjs';
import rehypeRutasInternas from './src/lib/rehype-rutas-internas.mjs';

// El dominio y la ruta base se pueden cambiar sin tocar el codigo.
// Para publicar en lolamorawine.com.ar:  SITE_URL=https://www.lolamorawine.com.ar BASE_PATH=/ npm run build
const SITE = process.env.SITE_URL || 'https://santiagocastellanos14.github.io';
const BASE = process.env.BASE_PATH ?? '/lolamorawine';

// Astro aplica `base` al origen de cada redireccion, pero no al destino.
// Sin este prefijo, en GitHub Pages las 3.880 redirecciones apuntarian fuera del sitio.
const prefijo = BASE === '/' ? '' : BASE.replace(/\/$/, '');
// Un host estático no puede distinguir las antiguas consultas por `product_id`:
// todas comparten /index.php. Enviar esa ruta al último producto importado era
// engañoso; la raíz es el único destino estático neutral hasta migrar el dominio
// a un edge worker que sí lea la query string.
const redirectsSeguros = { ...redirectsCrudos, '/index.php': '/' };
const redirects = Object.fromEntries(
  Object.entries(redirectsSeguros).map(([de, a]) => [de, prefijo + a])
);

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  redirects,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
    }),
  ],
  image: { responsiveStyles: true },
  markdown: {
    shikiConfig: { theme: 'css-variables', wrap: true },
    processor: unified({ rehypePlugins: [[rehypeRutasInternas, { base: prefijo }]] }),
  },
  vite: { build: { cssMinify: 'lightningcss' } },
});
