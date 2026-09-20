# Lola Mora Wine

Sitio institucional y catálogo de **Lola Mora Wine**: vinos finos argentinos,
delicatessen artesanales y regalos corporativos de Finca El Dátil.

Reemplaza al sitio anterior, que corría sobre **Joomla 1.5.9 (enero de 2009)** con
VirtueMart 1.x.

> **¿Solo querés cambiar un texto, un precio o una foto?**
> No necesitás nada de este README. Andá directo a **[CONTENIDO.md](CONTENIDO.md)**.

---

## Qué cambió respecto del sitio anterior

| | Antes (Joomla 1.5.9) | Ahora (Astro) |
|---|---|---|
| Plataforma | PHP + MySQL, sin parches desde 2012 | HTML estático, **sin servidor de aplicaciones** |
| Superficie de ataque | CVE-2015-8562 (ejecución remota sin autenticar) | Ninguna: no hay base de datos ni código en el servidor |
| URLs indexables | 4.099 URLs para 106 páginas reales (duplicación 43:1) | **84 páginas**, una por contenido |
| Canónicas | Todas apuntaban a la portada | Cada página se declara a sí misma |
| Etiquetas `<h1>` | **0** en todo el sitio | Exactamente una por página |
| Responsive | 0 media queries sobre un layout fijo de 926 px | Diseño fluido, verificado a 390 px |
| Peso de la portada | 2,72 MB (una imagen de 2,08 MB) | ~20 KB de HTML + imágenes WebP |
| Open Graph | Ninguno | Completo, con Twitter Cards y schema.org |
| Cabeceras de seguridad | 0 de 6 | 7, más CSP |
| Control de edad (Ley 24.788) | No existía | Implementado |
| Botón de arrepentimiento (Disp. 954/2025) | No existía | Implementado |

Las **3.880 URLs del sitio anterior redirigen** a su equivalente nueva. Ninguna queda en 404.

---

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:4321/lolamorawine/
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` para probar el resultado final |
| `npm run validar` | Audita SEO, enlaces, imágenes y restos del sitio viejo |
| `npm run capturas` | Validación visual en Chrome: 16 páginas × móvil/escritorio × claro/oscuro |
| `npm run check` | Verificación de tipos de Astro y TypeScript |

Requiere **Node.js 22 o superior**.

---

## Estructura

```
lolamorawine/
├── src/
│   ├── content/          ← EL CONTENIDO. Es lo único que se toca habitualmente
│   │   ├── productos/       12 fichas (vinos, delicatessen, estuches)
│   │   ├── noticias/         6 novedades
│   │   ├── historia/        14 páginas sobre Lola Mora
│   │   ├── finca/           13 sobre Finca El Dátil
│   │   ├── vinos/           13 guías de cata y varietales
│   │   ├── delicatessen/     9 artículos
│   │   └── paginas/          4 institucionales
│   ├── content.config.ts ← Esquema y validación de cada campo
│   ├── lib/
│   │   ├── sitio.ts      ← Datos de la empresa, contacto y menú
│   │   ├── colecciones.ts   Helpers de orden y agrupación
│   │   └── redirects.mjs    3.880 redirecciones (generado)
│   ├── layouts/          ← Base.astro (head y SEO) y Articulo.astro
│   ├── components/       ← Cabecera, Pie, Tarjeta, Miga, ControlEdad
│   ├── pages/            ← Las rutas del sitio
│   └── styles/global.css ← Sistema de diseño (colores, tipografía, espaciado)
├── public/
│   ├── img/              ← 434 imágenes en WebP
│   ├── descargas/           PDF de las ruedas de aromas y sabores
│   ├── admin/               Panel de edición visual
│   ├── _headers             Cabeceras de seguridad (Cloudflare/Netlify)
│   └── _redirects           301 reales a nivel servidor
├── scripts/              ← Herramientas de migración y validación
├── Dockerfile            ← Imagen de producción con nginx
└── .github/workflows/    ← Compilación, validación y publicación automáticas
```

---

## Diseño

El bordó **`#a72023`** viene del CSS del sitio original: es el color de marca heredado,
no una elección nueva.

- **Tipografías:** Petrona (títulos) y Archivo (texto), ambas de diseño argentino
- **Tema claro y oscuro**, siguiendo la preferencia del sistema, con interruptor manual
- **Accesibilidad:** enlace para saltar al contenido, foco visible, `alt` obligatorio en
  toda imagen (lo verifica `npm run validar`), respeta `prefers-reduced-motion`

Los colores viven en `src/styles/global.css` como variables CSS. Cambiar `--vino` ahí
lo cambia en todo el sitio.

---

## Publicación

### GitHub Pages (automático)

Cada `push` a `main` dispara el flujo de `.github/workflows/deploy.yml`:
compila → **valida** → publica. **Si la validación falla, no se publica**: queda online
la última versión correcta.

### Mudarse al dominio propio

Cuando `lolamorawine.com.ar` apunte acá, en *Settings → Secrets and variables → Actions →
Variables* del repositorio:

```
SITE_URL = https://www.lolamorawine.com.ar
BASE_PATH = /
```

No hace falta tocar código.

> **Recomendación:** para el dominio definitivo conviene **Cloudflare Pages** en lugar de
> GitHub Pages. Hace efectivas las cabeceras de `public/_headers` y convierte
> `public/_redirects` en **301 reales de servidor** (en GitHub Pages las redirecciones son
> páginas con `meta refresh`, que funcionan pero son más lentas y menos limpias para SEO).

### Docker

```bash
docker build -t lolamorawine --build-arg SITE_URL=https://www.lolamorawine.com.ar --build-arg BASE_PATH=/ .
docker run -p 8080:8080 lolamorawine
```

nginx sin root, con las cabeceras de seguridad aplicadas y healthcheck.

---

## Seguridad

Un sitio estático no tiene base de datos, ni panel de administración en el servidor, ni
código ejecutándose: **la clase de vulnerabilidad que afectaba al Joomla anterior no
puede existir acá**. Además:

- `Content-Security-Policy` restrictiva (`object-src 'none'`, sin `eval`)
- HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- Sin cookies, sin rastreadores de terceros, sin analítica que filtre datos
- Las únicas peticiones externas son las tipografías de Google Fonts
- `localStorage` sólo guarda dos preferencias locales: el tema y el control de edad

**Pendiente:** revocar el token de GitHub usado durante la migración y no volver a
compartir credenciales por chat.

---

## Cumplimiento legal

| Obligación | Estado |
|---|---|
| Ley 24.788 — venta a menores | ✅ Control de edad + leyenda en portada, fichas y pie |
| Disp. 954/2025 — botón de arrepentimiento | ✅ `/boton-de-arrepentimiento/`, sin registro previo |
| Ley 24.240 — términos y condiciones | ✅ `/terminos-y-condiciones/` |
| Ley 25.326 — datos personales | ✅ `/politica-de-privacidad/` |
| Ley 24.240 — identificación del proveedor | ⚠️ **Falta cargar razón social, CUIT y domicilio** en `src/lib/sitio.ts` |
| INV — inscripción y etiquetado | ⚠️ **Falta el número de INV** en `src/lib/sitio.ts` |

Los dos pendientes aparecen automáticamente en el sitio al completarlos. Mientras estén
vacíos, las páginas muestran un aviso en lugar de datos inventados.

---

## Qué falta para vender

Esto es un catálogo, no una tienda. Para empezar a facturar:

1. **Cargar los precios reales** en `src/content/productos/` (ver CONTENIDO.md)
2. **Completar los datos fiscales** en `src/lib/sitio.ts`
3. **Publicar en MercadoLibre** y pegar los links en cada ficha
4. **Sesión de fotos**: las actuales son de 480×480 px, suficientes para MercadoLibre
   pero no para una ficha con zoom
5. Cuando haya volumen, evaluar checkout propio (Tiendanube embebido)

---

## Origen del contenido

Las 84 páginas provienen del sitio Joomla anterior, procesadas en cinco pasos
reproducibles (`scripts/`):

| Script | Qué hace |
|---|---|
| `importar-contenido.mjs` | Convierte el backup en colecciones, limpia restos del CMS y corrige erratas |
| `corregir-titulos.mjs` | Arregla mojibake, mayúsculas a la inglesa y títulos largos |
| `optimizar-imagenes.mjs` | Limita a 1600 px y genera WebP |
| `usar-webp.mjs` | Reescribe las referencias y borra los originales |
| `generar-redirects.mjs` | Produce el mapa de 3.880 redirecciones |

El backup original está en `../backup-2026-08-28/`.
