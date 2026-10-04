/**
 * Prefija las URL internas escritas en Markdown o HTML importado.
 *
 * Los componentes Astro pasan sus rutas por `u()`, pero las 71 páginas
 * migradas desde Joomla conservan enlaces como `/img/...` y `/descargas/...`.
 * En GitHub Pages esas rutas apuntan a la raíz del dominio y devuelven 404.
 */
export default function rehypeRutasInternas({ base = '' } = {}) {
  const prefijo = base === '/' ? '' : String(base).replace(/\/$/, '');
  if (!prefijo) return () => {};

  const corregir = (valor) => {
    if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//')) return valor;
    if (valor === prefijo || valor.startsWith(`${prefijo}/`)) return valor;
    return `${prefijo}${valor}`;
  };

  const corregirSrcset = (valor) =>
    typeof valor === 'string'
      ? valor.split(',').map((parte) => {
          const [url, ...descriptor] = parte.trim().split(/\s+/);
          return [corregir(url), ...descriptor].join(' ');
        }).join(', ')
      : valor;

  const recorrer = (nodo) => {
    if (!nodo || typeof nodo !== 'object') return;

    if (nodo.type === 'element' && nodo.properties) {
      for (const atributo of ['href', 'src', 'poster', 'action']) {
        if (atributo in nodo.properties) nodo.properties[atributo] = corregir(nodo.properties[atributo]);
      }
      if ('srcSet' in nodo.properties) nodo.properties.srcSet = corregirSrcset(nodo.properties.srcSet);
      if ('srcset' in nodo.properties) nodo.properties.srcset = corregirSrcset(nodo.properties.srcset);
    }

    // El HTML crudo dentro de Markdown no siempre se convierte en nodos HAST.
    if (nodo.type === 'raw' && typeof nodo.value === 'string') {
      nodo.value = nodo.value.replace(
        /\b(href|src|poster|action)=(['"])\/(?!\/)/gi,
        (_todo, atributo, comilla) => `${atributo}=${comilla}${prefijo}/`,
      );
    }

    if (Array.isArray(nodo.children)) nodo.children.forEach(recorrer);
  };

  return (arbol) => recorrer(arbol);
}
