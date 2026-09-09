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
│   ├── esto-es-redh.html         Historia · misión y visión · trayectoria · enfoques · equipo
│   ├── lo-que-nos-mueve.html     Crecer con derechos · Vivir sin violencias · Brigadas de salud
│   ├── trama.html                Estrategia de autosostenimiento y su relación con REDH
│   ├── sumate.html               Donaciones · voluntariado · alianzas · boletín
│   ├── hablemos.html             Formulario y datos de contacto
│   ├── novedades.html            Listado de notas, con filtro por categoría
│   ├── novedad-ejemplo.html      Plantilla de nota interna (duplicar por cada nota)
│   ├── transparencia.html        Memorias, balances, datos legales y preguntas frecuentes
│   └── 404.html                  Página de error (noindex) — ver la nota de abajo
├── assets/
│   ├── index.css             Toda la hoja de estilos
│   ├── index.js              Todo el comportamiento
│   └── imgs/                 Fotos, logos, favicon, og-image
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

Está todo en `:root`, al principio de `assets/index.css`. Cambiando esas
variables se repinta el sitio entero. Las tipografías (Fraunces + Inter) se
cargan desde Google Fonts en el `<head>` de cada página.

### Cabecera y pie

Están duplicados en cada archivo HTML, que es el precio de no tener build. Si se
edita el menú hay que replicar el cambio en las 10 páginas. Cuando eso moleste,
se resuelve en 20 líneas con un script de build o con los *includes* de Netlify;
no hace falta migrar a un framework.

El enlace activo del menú **no** se marca a mano: `assets/index.js` compara la
URL con cada `href` y le pone `aria-current="page"`.

### El menú y su punto de corte

La barra horizontal necesita unos 1190 px para las siete etiquetas sin recortarse
(medido con la tipografía de reemplazo, que es más ancha que Inter). Por eso el
menú hamburguesa aparece **por debajo de 1200 px**, y por encima de ese ancho se
oculta el enlace "Inicio" de la lista, porque el logo ya cumple esa función.

Si se agrega o se renombra una sección del menú, hay que volver a medir ese
punto de corte. Es lo único del layout que no se ajusta solo.

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
- [ ] Logo definitivo en vector (hoy hay uno provisorio) y paleta de marca
- [ ] Conectar los formularios: hoy sólo validan y muestran un mensaje, no envían nada
- [ ] Conectar la pasarela de pago (Wompi, Bold, ePayco o Mercado Pago Colombia)
- [ ] Definir si se usa analítica y, si sí, sumar el aviso de cookies
- [ ] Página de política de privacidad (la referencian los formularios)
