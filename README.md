# Fundación REDH — sitio institucional

Sitio estático en **HTML, CSS y JavaScript puro**. Sin build, sin dependencias y
sin framework: se abre haciendo doble clic en `index.html` y se publica copiando
la carpeta a cualquier hosting estático.

> **Contexto**: REDH es una fundación colombiana con sede en Bogotá, constituida
> formalmente en 2020 sobre una iniciativa familiar que arrancó en 2015. Trabaja
> por los derechos humanos de niñas, niños, adolescentes y mujeres. Se
> autosostiene, en parte, con **TRAMA**, una marca de indumentaria con identidad
> propia. La fundación no vende nada de manera directa.

## Por qué así y no una SPA

- **SEO**: cada página es HTML servido tal cual. Para una fundación que necesita
  aparecer en Google por sus líneas de trabajo, eso es lo que más pesa.
- **Costo y vida útil**: no hay dependencias que actualizar. El sitio sigue
  funcionando dentro de tres años sin tocarlo.
- **Hosting**: entra en el plan gratuito de Netlify, Vercel, GitHub Pages o
  Cloudflare Pages, o en cualquier hosting compartido por FTP.
- **Velocidad**: no hay bundle de JS que descargar antes de ver contenido.
- **Multipágina y no landing**: la fundación necesita secciones que se enlacen y
  se compartan por separado (una línea de trabajo, una nota, la memoria anual).

## Estructura

Los nombres de sección salen del documento de contenido del cliente.

```
proyectoREDH/
├── index.html                Inicio (única página en la raíz)
├── pages/                    El resto de las páginas
│   ├── esto-es-redh.html         Hemos estado ahí (galería) · historia · misión y visión · así trabajamos · equipo
│   ├── lo-que-nos-mueve.html     Crecer con derechos · Vivir sin violencias · Brigadas de salud
│   ├── trama.html                Qué es TRAMA · cómo funciona · colecciones
│   ├── sumate.html               Voluntariado · aportes · alianzas
│   ├── hablemos.html             Formulario y canales institucionales
│   ├── novedades.html            Listado de notas (fuera del menú; se conserva)
│   ├── novedad-ejemplo.html      Plantilla de nota interna (duplicar por cada nota)
│   ├── transparencia.html        Memorias, balances y datos legales (fuera del menú; se conserva)
│   └── 404.html                  Página de error (noindex) — ver la nota de abajo
├── assets/
│   ├── index.css             Toda la hoja de estilos
│   ├── index.js              Todo el comportamiento
│   └── imgs/                 Logos del manual, favicon, galeria/ (fotos del cliente)
├── scripts/
│   ├── generar-layout.mjs    Escribe header y footer en cada HTML (npm run layout)
│   └── layout/
│       ├── navegacion.mjs    Fuente única del menú, submenús, footer y canales
│       └── plantillas.mjs    HTML del header y del footer
├── package.json              Sólo scripts de desarrollo, sin dependencias
├── robots.txt
├── sitemap.xml
└── docs/
    └── contenido-pendiente.md   Qué contenido falta pedirle al cliente
```

Las páginas están en `pages/` y no en `assets/`: por convención, `assets/` es
donde van los archivos con nombre versionado que no cambian nunca, y es la ruta
a la que se le suelen apuntar reglas de caché largo (`immutable`, un año). Un
HTML ahí adentro puede quedar cacheado en el navegador de un visitante durante
meses después de haberlo editado.

### Cómo se referencian las rutas

Desde `index.html` (raíz): `assets/index.css`, `pages/sumate.html`.

Desde una página de `pages/`: `../assets/index.css`, `../assets/index.js`,
`../assets/imgs/…` para los recursos; el nombre pelado (`sumate.html`) para las
hermanas; y `../index.html` para volver al inicio.

Si se agrega una página nueva, va en `pages/` y se copia la cabecera y el pie de
cualquiera de las que ya están, que ya traen esas rutas bien.

### URLs limpias (pendiente de configurar al publicar)

Tal como está, las URLs públicas quedan `fundacionredh.org/pages/sumate.html`.
Con una regla de *rewrite* en el host se pueden servir como
`fundacionredh.org/sumate`, sin la carpeta y sin la extensión. Los cuatro hosts
candidatos (Render, Netlify, Vercel, Hostinger) lo soportan.

En Render el orden es: primero busca si existe un recurso en esa ruta y lo
sirve; si no existe, aplica las reglas de arriba hacia abajo. Así que
`/assets/index.css` se sirve directo y `/sumate` cae en la regla. Render soporta
*placeholders*, así que conviene probar primero si una sola regla
`/:pagina → /pages/:pagina.html` cubre todas, antes de escribir las nueve.

### El 404 no está en la raíz

Los hosts estáticos buscan la página de error en `/404.html`. Como acá vive en
`pages/404.html`, **hay que configurarla a mano** o el visitante va a ver el 404
genérico del host en vez del del sitio:

- **Hostinger** (Apache/LiteSpeed) — en `.htaccess`:
  `ErrorDocument 404 /pages/404.html`
- **Netlify** — en `netlify.toml`:
  `[[redirects]] from = "/*" to = "/pages/404.html" status = 404`
- **Cloudflare Pages** — igual que Netlify, con un archivo `_redirects`
- **Vercel** — en `vercel.json`, una `route` con `"status": 404` apuntando ahí
- **Render** — sus reglas son *Redirect* (301) o *Rewrite* (200); no hay opción
  de status 404. Un `/* → /pages/404.html` por rewrite muestra la página pero
  responde **200**, que es un *soft 404* y Google lo puede indexar como página
  válida. Hay que probarlo en un deploy de prueba antes de darlo por resuelto.

`novedades.html` y `transparencia.html` no están en el documento del cliente: se
mantienen porque una fundación que pide donaciones necesita mostrar en qué gasta
y qué hace. Si el cliente no va a cargar notas, conviene sacar Novedades antes de
publicar: un blog vacío resta.

## Cómo verlo

Doble clic en `index.html` alcanza (las rutas son todas relativas, así que también anda sin servidor). Para trabajar con recarga automática:

```bash
python3 -m http.server 8000
# después: http://localhost:8000
```

## Cómo tocarlo

### Colores y tipografía

Está todo en `:root`, al principio de `assets/index.css`, y sale del manual de
marca (`archivos/manual inicial.pdf`):

- **Paleta** (`--marca-*`): azul `#2a4b9b`, naranja `#f9b03d`, violeta
  `#63318a`, gris `#dbdbdb` y azul noche `#29235c`, más los matices 80/50/20 %
  del manual. El resto de la hoja no usa esos nombres sino **roles**
  (`--color-texto`, `--color-primario`, `--color-acento`…): para cambiar qué
  color cumple qué función se toca una línea.
- **Tipografía**: h1 en Sniglet, h2 en Montserrat ExtraBold, h3 y cuerpo en
  Montserrat Light. Se cargan desde Google Fonts en el `<head>` de cada página.
- **Tamaños**: se respetan las proporciones del manual (cuerpo 14 · h3 18 · h2 20
  · h1 28). Sólo la base es fluida (16 → 18 px); los títulos se calculan con
  `calc()` a partir de ella, así la jerarquía es la misma en cualquier pantalla.
- **Naranja en los h2**: el manual pone los h2 en naranja, pero `#f9b03d` sobre
  blanco tiene un contraste de 1,9:1 y la WCAG pide 3:1 para texto grande. Por
  eso en fondos claros los h2 van en azul y el naranja se usa en las superficies
  oscuras (`.superficie-oscura`: franja de llamada a la acción y pie), donde
  llega a 7,6:1 sobre azul noche y 4,8:1 sobre violeta.

### Cabecera y pie

**No se editan a mano.** Los genera `scripts/generar-layout.mjs` a partir de
`scripts/layout/navegacion.mjs`, que es la única fuente del menú, sus submenús,
las columnas del pie y los canales de contacto. En cada HTML van entre dos
marcadores:

```html
<!-- layout:cabecera --> … <!-- /layout:cabecera -->
<!-- layout:pie -->      … <!-- /layout:pie -->
```

Para agregar, sacar o renombrar una sección:

1. Editar `scripts/layout/navegacion.mjs` (el `ancla` tiene que coincidir con el
   `id` de la `<section>` en la página).
2. `npm run layout` — reescribe el bloque en las 10 páginas.
3. `npm run layout:verificar` — no escribe nada; falla si alguna página quedó
   desactualizada o si un submenú apunta a un `id` que no existe. Conviene
   correrlo antes de publicar.

Node se usa sólo en la máquina de desarrollo y sin dependencias (no hay
`node_modules`). Lo que se publica sigue siendo HTML estático: el hosting no
necesita build ni servidor. Para una página nueva, copiar una existente
(ya trae los marcadores) y correr `npm run layout`.

Los submenús se abren con *hover* y foco en escritorio, y con el botón de
flecha (táctil y teclado); `Escape` los cierra. En el panel móvil funcionan como
acordeón. Esa lógica está en el bloque "3 bis" de `assets/index.js`.

El enlace activo del menú **no** se marca a mano: `assets/index.js` compara la
URL con cada `href` y le pone `aria-current="page"`.

### El menú y su punto de corte

Con Montserrat y las cuatro entradas actuales, logo + menú + botón entran holgados a 1101 px de ventana.
El menú hamburguesa aparece **por debajo de 1101 px**. "Inicio" y "Súmate" sólo
se listan dentro del panel móvil: en la barra, el logo lleva a Inicio y Súmate
es el botón destacado.

El número vive en dos lugares que tienen que coincidir: el `@media
(max-width: 1100px)` de `assets/index.css` y `ANCHO_MAXIMO_MENU_MOVIL` en
`assets/index.js`. Si se agrega una entrada al menú hay que volver a medirlo.

### Agregar una novedad

1. Duplicar `pages/novedad-ejemplo.html` en esa misma carpeta, con un
   nombre descriptivo (`2026-08-taller-en-soacha.html`).
2. Completar `<title>`, `<meta name="description">` y el cuerpo.
3. **Cambiar el `<meta name="robots">` de `noindex` a `index`**: la plantilla lo
   tiene en `noindex` a propósito, para que Google no indexe el texto de relleno.
4. Agregar la tarjeta en `pages/novedades.html` con el `data-categoria` que corresponda
   (el filtro se arma solo con ese atributo).
5. Sumar la URL a `sitemap.xml`.

### Imágenes

Las fotos del cliente están en `assets/imgs/galeria/`, redimensionadas a 1200 px
como máximo y en dos formatos (WebP con JPG de respaldo, dentro de `<picture>`).
Los originales quedan en `archivos/`.

Los recuadros a rayas son *placeholders*: `<div class="figura figura--ph">` con
la medida sugerida escrita adentro. Al llegar las fotos reales se reemplazan por
`<img class="figura" src="..." alt="..." width="..." height="..." loading="lazy">`.
El `alt` importa: describe la foto, no repite el título.

## Notas de maqueta

Cosas que ya están resueltas y conviene no romper:

- **`min-width: 0` en los hijos de `.bloque` y `.grilla`.** Una pista `1fr` no
  baja del min-content de su contenido: sin eso, un `<input>` o un correo largo
  empujan la columna más allá del contenedor y el `overflow-x: clip` del `body`
  recorta lo que sobra en silencio, sin barra de scroll que lo delate.
- **El desenfoque de la cabecera va en `.cabecera::before`, no en `.cabecera`.**
  `backdrop-filter` (igual que `transform` o `filter`) convierte al elemento en
  bloque contenedor de sus descendientes `position: fixed`. Con el desenfoque
  aplicado a la cabecera, el panel del menú móvil se posicionaba contra ella en
  vez de contra la ventana y quedaba de 72 px de alto, mostrando un solo enlace.
- **Las tarjetas de novedad son clicables enteras** vía `.nota__titulo a::after`
  con `inset: 0` y `z-index: 1`. Si se agrega un segundo enlace dentro de la
  tarjeta, hay que sacarlo del área estirada o dejará de ser alcanzable.
- **Las tablas anchas van dentro de `.tabla-envoltorio`**, que tiene
  `overflow-x: auto`. La tabla tiene `min-width: 520px` a propósito.
- **Áreas de toque de 24 px** (WCAG 2.5.8) en enlaces de pie, migas de pan,
  casillas y datos de contacto.

Verificado con capturas y medición automática en 320, 360, 375, 414, 768, 834,
1024, 1180, 1201, 1280, 1366, 1440 y 1920 px: sin desbordes horizontales, sin
elementos recortados y sin errores de JS en ninguna página.

## Pendientes antes de publicar

- [ ] Contenido que sigue faltando (ver `docs/contenido-pendiente.md`) — buscar `TODO`
- [x] ~~Dominio~~: `fundacionredh.org`, confirmado y ya aplicado en canonical, Open Graph, `robots.txt` y `sitemap.xml`
- [ ] Subdominio de TRAMA (lo decide el cliente: `.store` o `.org`) y su plataforma de e-commerce
- [ ] `assets/imgs/og-image.jpg` (1200 × 630) para cuando se comparta en redes
- [x] ~~Logo definitivo en vector y paleta de marca~~: aplicados desde el manual
- [ ] Autorización para publicar las fotos donde aparecen niñas y niños (ver TODO en `esto-es-redh.html`)
- [ ] Conectar los formularios: hoy sólo validan y muestran un mensaje, no envían nada
- [ ] Conectar la pasarela de pago (Wompi, Bold, ePayco o Mercado Pago Colombia)
- [ ] Definir si se usa analítica y, si sí, sumar el aviso de cookies
- [ ] Página de política de privacidad (la referencian los formularios)
