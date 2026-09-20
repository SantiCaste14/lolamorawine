// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import redirectsCrudos from './src/lib/redirects.mjs';

// El dominio y la ruta base se pueden cambiar sin tocar el codigo.
// Para publicar en lolamorawine.com.ar:  SITE_URL=https://www.lolamorawine.com.ar BASE_PATH=/ npm run build
const SITE = process.env.SITE_URL || 'https://santiagocastellanos14.github.io';
const BASE = process.env.BASE_PATH ?? '/lolamorawine';

// Astro aplica `base` al origen de cada redireccion, pero no al destino.
// Sin este prefijo, en GitHub Pages las 3.880 redirecciones apuntarian fuera del sitio.
const prefijo = BASE === '/' ? '' : BASE.replace(/\/$/, '');
const redirects = Object.fromEntries(
  Object.entries(redirectsCrudos).map(([de, a]) => [de, prefijo + a])
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
      lastmod: new Date(),
    }),
  ],
  image: { responsiveStyles: true },
  markdown: {
    shikiConfig: { theme: 'css-variables', wrap: true },
  },
  vite: { build: { cssMinify: 'lightningcss' } },
});
