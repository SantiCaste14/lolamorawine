# Auditoría comparativa y correcciones — Lola Mora Wine

**Fecha:** 4 de octubre de 2026  
**Sitio anterior:** <https://www.lolamorawine.com.ar/>  
**Nueva versión auditada:** <https://santiagocastellanos14.github.io/lolamorawine/>  
**Repositorio:** <https://github.com/santiagocastellanos14/lolamorawine>

## 1. Conclusión ejecutiva

La nueva versión supera ampliamente al sitio anterior en diseño, adaptación móvil, claridad de navegación, accesibilidad, SEO técnico, mantenimiento y seguridad de dependencias. Antes de esta intervención, sin embargo, todavía no estaba lista para reemplazar al sitio principal: contenía enlaces internos que fallaban bajo el subdirectorio de GitHub Pages, datos comerciales incompletos, afirmaciones no comprobadas sobre el origen y la elaboración de los productos, disponibilidad ficticia en datos estructurados, residuos visuales del Joomla anterior y fallas funcionales de accesibilidad.

Esos problemas técnicos y editoriales fueron corregidos. El sitio compilado queda con:

- 83 páginas reales y 3.880 rutas históricas de redirección;
- cero enlaces o imágenes internas rotas en la compilación;
- cero errores y cero advertencias de Astro sobre el código del sitio;
- cero vulnerabilidades conocidas informadas por `npm audit`;
- pruebas visuales aprobadas en 64 combinaciones de página, dispositivo y tema;
- pruebas funcionales aprobadas para control de edad, menú móvil, tema, consulta de producto, contacto contextual, analítica y `robots.txt`.

La principal limitación pendiente ya no es técnica: faltan datos comerciales y de producto que sólo puede aportar el titular de la marca o el elaborador actual. Mientras no se incorporen, la web debe presentarse como **catálogo con consulta**, no como tienda en línea ni como ficha técnica definitiva.

## 2. Comparación con el sitio anterior

| Área | Sitio anterior | Nueva versión corregida |
|---|---|---|
| Diseño | Estructura Joomla estrecha, densa y fechada | Sistema visual editorial, premium y coherente con vino/arte |
| Móvil | Navegación y grillas heredadas con mala adaptación | Diseño responsive verificado en 390×844 px |
| Jerarquía | Muchos módulos compiten por atención | Propuesta de valor, categorías y llamados a la acción claros |
| Tecnología | Dependencias históricas, rastros de Flash y componentes obsoletos | Astro estático, sin Flash y con dependencias actualizadas |
| Velocidad percibida | Muchas imágenes y módulos de terceros | Hero responsive y recursos locales optimizados |
| Accesibilidad | Navegación y controles antiguos | Foco visible, diálogo de edad contenido, Escape en menú, temas con contraste |
| SEO | Canónicas y rutas antiguas poco confiables | Títulos, descripciones, canónicas, Open Graph, sitemap y robots coherentes |
| Conversión | Carrito antiguo y mensajes ambiguos | Consulta por producto y cotización corporativa contextual |
| Veracidad comercial | Mezcla Finca El Dátil, viñedos, uvas y elaboración | Distingue historia de marca, origen de uva y elaboración de la partida |
| Mantenimiento | Contenido acoplado al Joomla | Colecciones editables y CMS separado del frontend |

La comparación visual actual también confirmó que el sitio anterior todavía muestra un aviso para instalar Flash, iconografía social obsoleta, tipografías genéricas y una presentación de producto que no funciona como catálogo contemporáneo. La nueva versión conserva el escudo, el bordó, el dorado y el vínculo con la obra de Lola Mora, pero elimina esos patrones envejecidos.

## 3. Correcciones implementadas

### 3.1 Rutas, enlaces y despliegue en GitHub Pages

- Se corrigieron todas las rutas absolutas que escapaban de `/lolamorawine/` y generaban errores 404 en GitHub Pages.
- Se incorporó un procesador de contenido para prefijar enlaces e imágenes internas también dentro de Markdown y HTML heredado.
- Se repararon enlaces a contacto, vinos, obras de Lola Mora y noticias.
- Se eliminó el comportamiento incorrecto que enviaba todas las variantes de `index.php?...` al último producto procesado.
- `/index.php` ahora tiene un destino neutral y seguro. Un hosting estático no puede decidir una redirección según el query string.
- El validador ahora entiende parámetros y fragmentos de URL sin confundirlos con rutas inexistentes.
- La compilación falla si una ruta futura vuelve a escapar del `BASE_PATH`.

### 3.2 Veracidad del producto y del origen

- Se eliminó la afirmación de que los vinos se elaboran en Finca El Dátil.
- Se aclaró que Finca El Dátil está en El Tala, Salta, y funciona como origen histórico/narrativo de la marca.
- Se separaron explícitamente cuatro conceptos que no deben mezclarse:
  1. ubicación de Finca El Dátil;
  2. origen de las uvas;
  3. lugar/bodega de elaboración;
  4. procedencia declarada en la etiqueta de cada partida.
- Se informó que fuentes históricas de la propia marca mencionan viñas familiares en Nonogasta, La Rioja, y uvas seleccionadas en Mendoza. Esto no autoriza a presentar esos datos como vigentes para la botella actual.
- Las fichas de vino ya no inventan añada, alcohol, bodega ni indicación geográfica.
- El dato válido para venta debe ser el de la etiqueta y la ficha técnica de la partida vigente.
- Se reescribieron las 12 descripciones comerciales de producto para evitar textos truncados, genéricos o engañosos.
- Se corrigió “aceite extra virgen” y se detalló el contenido de los packs cuando el material disponible lo permitía.
- Se eliminó el estado `InStock` automático. El schema de producto sólo publica oferta/disponibilidad si hay información explícita.

### 3.3 Historia de Lola Mora y Finca El Dátil

Las fuentes públicas oficiales no son uniformes: algunas sitúan el nacimiento en El Tala, Salta; otras en Trancas o San Miguel de Tucumán; también difieren entre 1866 y 1867. Por esa razón:

- se dejó de presentar una única versión como hecho definitivamente resuelto;
- se identifica la versión de El Tala como parte del archivo y la tradición de la marca;
- se añadió una nota editorial visible en la sección histórica;
- se sustituyeron expresiones categóricas como “casa natal” por formulaciones históricamente prudentes donde correspondía;
- los artículos documentales se conservaron, pero encuadrados como argumentos y testimonios de una controversia.

Fuentes primarias/oficiales consultadas:

- Secretaría de Cultura de la Nación, 17/11/2025: <https://www.argentina.gob.ar/noticias/17-de-noviembre-dia-del-escultor-en-homenaje-lola-mora>
- Secretaría de Cultura de la Nación, 07/06/2026: <https://www.argentina.gob.ar/noticias/lola-mora-pionera-del-arte-monumental-argentino>
- Decreto 1665/2013 sobre la fecha considerada por la Academia Nacional de la Historia: <https://www.argentina.gob.ar/normativa/nacional/decreto-1665-2013-221613/texto>
- Turismo oficial de Salta sobre El Tala y Finca El Dátil: <https://visitsalta.ar/valle-historico-y-gaucho/el-tala/>

### 3.4 Residuos del sitio anterior

- Se retiraron botones de galería que habían quedado convertidos en imágenes dentro de los artículos.
- Se eliminaron estrellas vacías, enlaces a usuarios, categorías y pantallas del antiguo componente JomTube.
- Cinco páginas de videos sin archivo recuperado se transformaron en registros históricos honestos: conservan tema, fecha y duración, y explican que el video no está disponible.
- Se quitaron llamadas a Flash Player y navegación interna obsoleta.
- Se corrigieron erratas visibles y encabezados que se enlazaban a sí mismos mediante rutas inexistentes.

### 3.5 Contacto y conversión

- Cada producto dirige a contacto conservando su nombre en la URL.
- La página de contacto muestra el producto consultado y prepara asunto/cuerpo del email sin incluir datos personales en analítica.
- Se separó el flujo de consulta individual del de regalos corporativos.
- La solicitud corporativa pide cantidad, presupuesto unitario, fecha, destinos y personalización.
- Se retiró una fecha límite de noviembre que había quedado obsoleta.
- Se añadió un aviso visible: el sitio es un catálogo y no procesa pagos en línea.

### 3.6 Información legal y privacidad

- Se reemplazó una política genérica por una explicación coherente con el funcionamiento real: sin cuentas, formularios ni pagos internos; contacto mediante email/WhatsApp; almacenamiento local para edad/tema; analítica opcional con consentimiento.
- Los términos ya no muestran advertencias internas para desarrolladores.
- Se agregó el acceso al botón de arrepentimiento.
- Se mantuvo la leyenda de consumo responsable y prohibición de venta a menores.
- El control de edad ahora se presenta como medida preventiva; no se afirma que por sí solo satisfaga todas las obligaciones comerciales.

Normativa primaria revisada (la implementación no sustituye asesoramiento legal):

- Ley 24.240 de Defensa del Consumidor: <https://www.argentina.gob.ar/normativa/nacional/638/actualizacion>
- Resolución MERCOSUR 37/2019 sobre información al consumidor en comercio electrónico: <https://www.argentina.gob.ar/normativa/nacional/norma-341934/texto>
- Resolución INV 20/2020: <https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-20-2020-337824/texto>
- Disposición 954/2025 sobre botón de arrepentimiento: <https://www.argentina.gob.ar/normativa/nacional/norma-417152/texto>

### 3.7 Accesibilidad

- El diálogo de edad lleva el foco al botón principal, contiene la navegación con Tab y restaura el foco al cerrar.
- El contenido de fondo queda `inert` mientras el diálogo está abierto.
- El menú móvil se cierra con Escape, al elegir un enlace y al volver a escritorio.
- `aria-expanded` y los nombres accesibles reflejan el estado real.
- El selector de tema anuncia la acción disponible (“Activar tema claro/oscuro”).
- Se mejoraron contrastes de texto y estados interactivos.
- Se verificó que todas las páginas tengan exactamente un H1 y que las imágenes tengan texto alternativo.

### 3.8 SEO y entornos

- Canónica propia, metadescripción, Open Graph y Twitter Card en todas las páginas reales.
- Schema de organización sin atribuir a la empresa una categoría de bodega que no está documentada.
- Schema de producto sin precio/disponibilidad inventados.
- Sitemap sin fechas artificiales que cambiarían en cada compilación.
- GitHub Pages queda con `noindex, nofollow` y `robots.txt` bloqueado para evitar que Google indexe la URL de prueba.
- El dominio comercial queda preparado para permitir indexación cuando `SITE_URL` y `BASE_PATH` se configuren para producción.
- Se eliminaron duplicados de “Quiénes somos” y “Política de privacidad”.

### 3.9 Analítica

- Se incorporó soporte opcional para GA4 mediante `PUBLIC_GA4_ID`.
- Google Analytics no carga antes del consentimiento.
- Se definieron eventos para consulta de producto, email, WhatsApp, cotización y compra externa.
- No se envían el email ni otros datos personales como parámetros de evento.

### 3.10 Seguridad y mantenimiento

- Astro y dependencias principales fueron actualizados a versiones vigentes compatibles.
- `npm audit` informa cero vulnerabilidades conocidas.
- Sveltia CMS quedó fijado a una versión concreta para evitar cambios inesperados por usar `latest`.
- La política CSP fue actualizada para los recursos realmente utilizados.
- Advertencia: GitHub Pages no aplica el archivo `_headers`; los encabezados de seguridad requieren Cloudflare, Netlify u otro hosting/proxy compatible.

### 3.11 Rendimiento e imágenes

- El hero tiene variantes WebP de 720 y 1280 píxeles; el navegador descarga la adecuada para el viewport.
- La variante de 720 px pesa aproximadamente 52 KB y la de 1280 px aproximadamente 141 KB.
- Se redujo la dependencia de fuentes externas mediante fallbacks de sistema.
- Se inspeccionó la fotografía del Tempranillo: el archivo fuente real tiene sólo 228×400 px. Se generó una restauración experimental, pero fue **rechazada** porque inventó caracteres y detalles de etiqueta. No se publicó una imagen comercial falsa.

## 4. Validaciones realizadas

### Validación estática

- `npm run check`: 0 errores, 0 advertencias; sólo 9 sugerencias no bloqueantes en scripts de importación/mantenimiento.
- `npm run build`: compilación correcta de 84 rutas Astro, con 83 páginas reales y 3.880 redirecciones históricas.
- `npm run validar`: sin fallos en H1, canónicas, metadatos, descripciones, imágenes, enlaces, rutas base y archivos esenciales.
- `npm audit --audit-level=high`: 0 vulnerabilidades.

### Navegador real

Se probaron Inicio, Vinos, ficha Malbec, Regalos, artículo histórico y Contacto en escritorio (1440×900) y móvil (390×844). Resultado: sin errores de consola, respuestas HTTP fallidas, imágenes rotas ni desbordes.

Flujos comprobados:

- aparición del control de edad en primera visita;
- foco inicial y contención con Tab/Shift+Tab;
- persistencia de la aceptación;
- cambio de tema y nombre accesible;
- apertura/cierre del menú móvil y cierre con Escape;
- enlace de producto con contexto;
- asunto de email contextual;
- ausencia de carga de GA antes de consentir;
- comportamiento de `robots.txt` según entorno.

La matriz visual ampliada cubrió 16 páginas × 2 dispositivos × 2 temas = **64 combinaciones**, sin problemas visuales, de consola ni de recursos.

## 5. Pendientes que requieren información del negocio

### Prioridad crítica antes de vender o recibir pagos

1. Razón social exacta del vendedor.
2. CUIT.
3. Domicilio legal/fiscal y jurisdicción.
4. Número de inscripción/registro INV aplicable.
5. Teléfono y WhatsApp comercial.
6. Condiciones de venta, entrega, cambios, devoluciones y medios de pago.
7. Confirmación de quién factura cada categoría de producto.

### Prioridad crítica para cada vino

1. Foto frontal y trasera de la botella actualmente ofrecida.
2. Bodega/elaborador y número de establecimiento.
3. Origen/indicación geográfica de la uva y del vino.
4. Añada vigente.
5. Graduación alcohólica.
6. Volumen y composición varietal declarada.
7. Ficha técnica y datos de trazabilidad.
8. Precio final, stock real y alcance geográfico de entrega.

### Fotografías necesarias

No conviene generar con IA la botella, la etiqueta, alimentos ni contenido de un pack. Para vender, deben ser fotografías del producto real. Se recomienda producir:

- botella frontal sobre fondo neutro;
- contraetiqueta legible;
- botella a 45°;
- detalle de etiqueta y cápsula;
- cada pack abierto y cerrado con sus componentes reales;
- jamón, salame y aceite con envase/rotulado vigente;
- una foto de uso/lifestyle por categoría;
- formato maestro mínimo de 2400 px en el lado largo, luz suave y color calibrado.

La IA sí puede utilizarse para fondos decorativos o piezas editoriales sin producto, siempre que no altere envases, obras protegidas o hechos históricos.

## 6. Recomendaciones de marketing y producto

### Etapa 1 — Confianza y conversión

- Completar los datos críticos anteriores.
- Sustituir las fotos antiguas por una sesión real de producto.
- Publicar precios o explicar claramente cómo se cotiza.
- Definir zonas, costos y tiempos de entrega.
- Activar WhatsApp comercial con respuestas rápidas y horarios.
- Configurar GA4 y Search Console en el dominio final.

### Etapa 2 — Propuesta de valor

- Definir una frase comercial comprobable: qué hace diferente al vino, para quién es y en qué ocasión se elige.
- Separar la narrativa histórica del argumento enológico: la historia atrae; la ficha técnica, las reseñas y la experiencia sostienen la compra.
- Crear fichas por vino con notas de cata validadas, maridaje, temperatura de servicio y ocasión de consumo.
- Crear una página corporativa con escalas de cantidad, personalización, tiempos mínimos y casos reales.

### Etapa 3 — Adquisición y retención

- SEO transaccional para “regalos empresariales con vino”, “estuches corporativos” y búsquedas geográficas donde realmente se entrega.
- Campañas Meta/Google sólo después de medir consultas y disponer de stock/precio fiables.
- Email de seguimiento para cotizaciones, sin incorporar contactos a marketing sin consentimiento.
- Calendario editorial con arte argentino, historia de las etiquetas, guía del vino y casos de regalos corporativos.

### KPIs recomendados

- tasa de clic desde producto a contacto;
- consultas calificadas por producto;
- cotizaciones corporativas iniciadas;
- porcentaje de cotizaciones respondidas en menos de 24 horas;
- conversión de consulta a venta;
- valor medio del pedido;
- consultas sin respuesta o abandonadas;
- fuentes de tráfico que generan ventas, no sólo visitas.

## 7. Decisión de lanzamiento

**Técnicamente apto para publicar como catálogo de consulta.**  
**No apto todavía para presentarse como tienda o catálogo técnico definitivo** hasta completar identidad legal, ficha vigente, precio, stock, procedencia, elaborador y fotografías reales.

El orden recomendado es: publicar las correcciones técnicas, mantener la URL de GitHub fuera del índice, completar los datos del negocio y producto, reemplazar fotografías, volver a validar y recién entonces apuntar `www.lolamorawine.com.ar` a la nueva versión.
