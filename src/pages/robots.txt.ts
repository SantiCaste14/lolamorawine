import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const url = site ?? new URL('https://santiagocastellanos14.github.io');
  const esProduccion = ['lolamorawine.com.ar', 'www.lolamorawine.com.ar'].includes(url.hostname);
  const base = import.meta.env.BASE_URL;
  const sitemap = new URL(`${base}sitemap-index.xml`.replace(/\/+/g, '/'), url).href;
  const reglas = esProduccion
    ? ['User-agent: *', 'Allow: /']
    : ['User-agent: *', 'Disallow: /'];

  return new Response([...reglas, '', `Sitemap: ${sitemap}`, ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
