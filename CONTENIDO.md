# Cómo editar el contenido del sitio

Esta guía es para **cualquier persona del equipo**, con o sin conocimientos técnicos.
No hace falta saber programar para cambiar textos, fotos, precios o agregar noticias.

---

## Índice

1. [Las tres formas de editar](#1-las-tres-formas-de-editar)
2. [Editar desde GitHub, sin instalar nada](#2-editar-desde-github-sin-instalar-nada)
3. [Tareas más frecuentes](#3-tareas-más-frecuentes)
4. [Cómo se organiza el contenido](#4-cómo-se-organiza-el-contenido)
5. [Los campos de cada tipo de página](#5-los-campos-de-cada-tipo-de-página)
6. [El panel visual (opcional)](#6-el-panel-visual-opcional)
7. [Qué hacer si algo sale mal](#7-qué-hacer-si-algo-sale-mal)

---

## 1. Las tres formas de editar

| Forma | Para quién | Qué hace falta |
|---|---|---|
| **GitHub en el navegador** | Cualquiera | Una cuenta de GitHub con acceso al repositorio. **Nada más.** |
| **Panel visual** (`/admin`) | Cualquiera | Una configuración inicial de una sola vez (§6) |
| **En la computadora** | Perfil técnico | Node.js y Git |

**Después de guardar cualquier cambio, el sitio se actualiza solo en unos 2 minutos.**
No hay que avisarle a nadie ni apretar ningún botón de "publicar".

---

## 2. Editar desde GitHub, sin instalar nada

Es la forma más simple y no requiere ninguna configuración previa.

1. Entrá a **https://github.com/SantiagoCastellanos14/lolamorawine**
2. Abrí la carpeta **`src/content`**
3. Entrá a la sección que quieras (ver §4) y hacé clic en el archivo `.md`
4. Tocá el **lápiz** ✏️ arriba a la derecha
5. Editá el texto
6. Abajo, escribí en una línea qué cambiaste (por ejemplo: *"Corrijo el precio del Malbec"*)
7. Botón verde **Commit changes**

Listo. En un par de minutos el cambio está online.

> **Consejo:** si querés ver cómo va a quedar antes de guardar, usá la pestaña **Preview**
> que aparece arriba del editor.

---

## 3. Tareas más frecuentes

### Cambiar el precio de un producto

1. `src/content/productos/` → abrí el producto
2. Buscá la línea `precio:`
3. Escribí el número **sin puntos, sin comas y sin el signo $**

```yaml
precio: 18500
```

Si **no** hay precio confirmado, borrá la línea entera. La ficha va a mostrar
*"Consultar precio y disponibilidad"* en lugar de un precio falso.

> Nunca dejes `precio: 0`. El sitio viejo mostraba todos los productos a $0,00 y eso
> destruye la confianza de quien entra a comprar.

### Agregar el link de MercadoLibre a un producto

```yaml
mercadolibre: "https://articulo.mercadolibre.com.ar/MLA-123456789"
```

Aparece automáticamente un botón **Comprar en MercadoLibre** en la ficha.

### Cambiar la foto de un producto o artículo

1. Subí la foto nueva a la carpeta **`public/img/`**
   (en GitHub: entrá a la carpeta → *Add file* → *Upload files*)
2. En el archivo del producto, poné el nombre del archivo precedido de `/img/`:

```yaml
portada: "/img/malbec-2024.webp"
```

**Recomendaciones de foto:**
- Formato **`.webp`** (pesa 5 veces menos que un JPG y se ve igual)
- Ancho máximo **1600 px**
- Las fotos de producto quedan mejor **cuadradas**

Si no sabés convertir a `.webp`, subí el JPG igual y avisá: hay un comando que lo hace
automáticamente (`npm run optimizar`).

### Escribir una noticia nueva

1. `src/content/noticias/` → **Add file** → **Create new file**
2. Nombre del archivo: `titulo-de-la-noticia.md` (minúsculas, sin acentos, con guiones)
3. Pegá esta plantilla y completala:

```markdown
---
titulo: "Título de la noticia"
descripcion: "Un resumen de una o dos líneas. Es lo que se ve en Google y en el listado."
fecha: 2026-09-20
portada: "/img/foto-de-la-noticia.webp"
orden: 1
borrador: false
---

Acá va el texto de la noticia.

## Un subtítulo

Otro párrafo. Para poner una palabra en **negrita** se usan dos asteriscos,
y para *cursiva*, uno solo.
```

### Ocultar una página sin borrarla

Poné `borrador: true`. Desaparece del sitio pero el archivo queda guardado.

```yaml
borrador: true
```

### Cambiar el orden en que aparecen

El campo `orden` manda: **el número más chico aparece primero.**

```yaml
orden: 1   # este va primero
orden: 2   # este después
```

### Cambiar el teléfono, el email o el WhatsApp

Todos los datos de contacto están en **un solo archivo**: `src/lib/sitio.ts`

```ts
contacto: {
  email: 'ventas@lolamorawine.com.ar',
  whatsapp: '5493511234567',   // sin +, sin espacios, sin guiones
  telefono: '(0351) 123-4567',
},
```

En ese mismo archivo están la **razón social**, el **CUIT**, el **domicilio** y el
**número de INV**. Al completarlos aparecen solos en la página de contacto y en los
términos y condiciones.

### Cambiar el menú de navegación

También en `src/lib/sitio.ts`, en `navegacion`. El orden de la lista es el orden del menú.

---

## 4. Cómo se organiza el contenido

Todo vive en **`src/content/`**, una carpeta por sección:

| Carpeta | Qué contiene | Dónde se ve |
|---|---|---|
| `productos/` | Las 12 fichas: vinos, delicatessen y estuches | `/productos/...` |
| `noticias/` | Novedades y prensa | `/noticias/` |
| `historia/` | Biografía y obras de Lola Mora | `/lola-mora/` |
| `finca/` | Finca El Dátil, caballos, carruajes | `/finca-el-datil/` |
| `vinos/` | Guías de cata y varietales | `/guias/` |
| `delicatessen/` | Artículos sobre jamón, salame y aceite | `/delicatessen/` |
| `paginas/` | Nosotros, escudo, privacidad | `/nosotros/` |

**El nombre del archivo es la dirección web.**
`src/content/historia/fuente-de-las-nereidas.md` → `/lola-mora/fuente-de-las-nereidas/`

> ⚠️ **Cambiar el nombre de un archivo cambia la dirección** y rompe los links que ya
> circulan. Si hace falta cambiarlo, avisá para agregar una redirección.

---

## 5. Los campos de cada tipo de página

Todo archivo empieza con un bloque entre `---` llamado *frontmatter*. Son los datos de
la página. Debajo va el texto.

### Comunes a todas

| Campo | Obligatorio | Para qué sirve |
|---|:---:|---|
| `titulo` | Sí | El título. Ideal hasta 52 caracteres |
| `descripcion` | Sí | Resumen de 40 a 200 caracteres. **Es lo que lee Google** |
| `portada` | No | Foto principal, ruta dentro de `/img/` |
| `grupo` | No | Subsección para agrupar en el listado |
| `orden` | No | Orden de aparición (menor primero) |
| `borrador` | No | `true` lo oculta del sitio |

### Solo en productos

| Campo | Para qué sirve |
|---|---|
| `categoria` | `vinos`, `delicatessen` o `regalos`. **Obligatorio** |
| `precio` | Número sin símbolos. Sin este campo muestra "Consultar" |
| `mercadolibre` | URL de la publicación; agrega el botón de compra |
| `contenido` | Lista de lo que trae el pack |
| `anada`, `varietal`, `graduacion`, `volumen`, `origen` | Ficha técnica del vino |
| `disponible` | `false` lo marca sin stock |

### Solo en noticias

| Campo | Para qué sirve |
|---|---|
| `fecha` | `AAAA-MM-DD`. Ordena de más nueva a más vieja |

---

## 6. El panel visual (opcional)

Hay un panel de edición visual en **`/admin`** que evita tocar archivos: se ven
formularios, un editor de texto con botones y un selector de imágenes.

**Requiere una configuración inicial de una sola vez**, porque GitHub necesita autorizar
el panel para escribir en el repositorio:

1. En GitHub: *Settings* → *Developer settings* → *OAuth Apps* → **New OAuth App**
2. Completar:
   - **Homepage URL:** la dirección del sitio
   - **Authorization callback URL:** la que indique la documentación de Sveltia CMS
3. Copiar el *Client ID* y el *Client Secret*
4. Configurar el servicio de autenticación según
   [la documentación de Sveltia CMS](https://github.com/sveltia/sveltia-cms#readme)
5. Entrar a `/admin` e iniciar sesión con GitHub

La configuración de los formularios ya está lista en `public/admin/config.yml`.

> **Mientras tanto**, el método de §2 (editar en GitHub) funciona hoy y no requiere
> ninguna configuración. Para el volumen de cambios de este sitio, alcanza y sobra.

---

## 7. Qué hacer si algo sale mal

### El cambio no aparece en el sitio

1. Entrá a la pestaña **Actions** del repositorio
2. Mirá la última ejecución:
   - **✅ verde** → ya está publicado; probá recargar con `Ctrl+F5`
   - **❌ roja** → hacé clic y leé el error

### Aparece una ❌ roja

Casi siempre es una de estas tres:

| Error que aparece | Qué pasó | Cómo se arregla |
|---|---|---|
| `descripcion: String must contain at least 20 character(s)` | La descripción quedó muy corta | Escribí al menos 40 caracteres |
| `enlace roto: /...` | Un link apunta a una página que no existe | Corregí o quitá ese link |
| `imagen inexistente: /img/...` | La foto no se subió o el nombre no coincide | Verificá el nombre exacto en `public/img/` |

**El sitio publicado no se rompe nunca por un error de estos.** Si la validación falla,
la publicación se cancela y queda online la última versión que estaba bien.

### Deshacer un cambio

En GitHub, entrá al archivo → **History** → elegí la versión anterior → **Revert**.
Todo queda registrado y siempre se puede volver atrás.

---

## Comandos (solo para perfil técnico)

```bash
npm install          # instalar dependencias, una sola vez
npm run dev          # ver el sitio en vivo mientras se edita → http://localhost:4321
npm run build        # compilar el sitio
npm run validar      # revisar SEO, enlaces, imágenes y restos del sitio viejo
npm run capturas     # validación visual con navegador real
```
