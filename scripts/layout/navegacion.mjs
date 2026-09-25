/**
 * Fuente única de la navegación del sitio.
 *
 * Con estos datos, scripts/generar-layout.mjs escribe el header (menú y
 * submenús) y el footer de cada página. Para agregar, quitar o renombrar una
 * sección se edita este archivo y se corre `npm run layout`.
 *
 * Reglas:
 * - `ruta` es relativa a la raíz del sitio. El generador la convierte en un
 *   enlace relativo correcto para cada página (index.html o pages/*.html).
 * - `ancla` tiene que coincidir con el `id` de la <section> en la página de
 *   destino. `npm run layout:verificar` avisa si alguna no existe.
 * - Las etiquetas de las secciones son los subtítulos del documento del
 *   cliente (archivos/Contenido página web - REDH.pdf).
 */

export const PAGINAS = Object.freeze({
  inicio: {
    etiqueta: 'Inicio',
    ruta: 'index.html',
  },

  estoEsRedh: {
    etiqueta: 'Esto es REDH',
    ruta: 'pages/esto-es-redh.html',
    secciones: [
      { etiqueta: 'Hemos estado ahí', ancla: 'hemos-estado-ahi' },
      { etiqueta: 'Nuestra historia', ancla: 'historia' },
      { etiqueta: 'Misión y visión', ancla: 'mision-vision' },
      { etiqueta: 'Así trabajamos', ancla: 'asi-trabajamos' },
      { etiqueta: 'Quienes hacen REDH', ancla: 'equipo' },
    ],
  },

  loQueNosMueve: {
    etiqueta: 'Lo que nos mueve',
    ruta: 'pages/lo-que-nos-mueve.html',
    secciones: [
      { etiqueta: 'Crecer con derechos', ancla: 'crecer-con-derechos' },
      { etiqueta: 'Vivir sin violencias', ancla: 'vivir-sin-violencias' },
      { etiqueta: 'Brigadas de salud', ancla: 'brigadas-de-salud' },
    ],
  },


  hablemos: {
    etiqueta: 'Hablemos',
    ruta: 'pages/hablemos.html',
  },

  trama: {
    etiqueta: 'TRAMA',
    ruta: 'pages/trama.html',
    secciones: [
      { etiqueta: '¿Qué es TRAMA?', ancla: 'que-es-trama' },
      { etiqueta: '¿Cómo funciona?', ancla: 'como-funciona' },
      { etiqueta: 'Colecciones', ancla: 'colecciones' },
    ],
  },

  sumate: {
    etiqueta: 'Súmate',
    ruta: 'pages/sumate.html',
    secciones: [
      { etiqueta: 'Quiero ser voluntaria/o', ancla: 'voluntariado' },
      { etiqueta: 'Quiero aportar', ancla: 'aportar' },
      { etiqueta: 'Quiero proponer una alianza', ancla: 'alianzas' },
    ],
  },

  /* Fuera del menú: no figuran en el documento del cliente. Los archivos se
     conservan por si se retoman más adelante. */
  novedades: {
    etiqueta: 'Novedades',
    ruta: 'pages/novedades.html',
  },

  transparencia: {
    etiqueta: 'Transparencia',
    ruta: 'pages/transparencia.html',
  },
});

/** Orden de la barra del header. "Inicio" lo resuelve el logo. */
export const MENU_PRINCIPAL = [
  PAGINAS.estoEsRedh,
  PAGINAS.loQueNosMueve,
  PAGINAS.hablemos,
  PAGINAS.trama,
];

/** Botón destacado del header (siempre visible, también en móvil). */
export const BOTON_DESTACADO = PAGINAS.sumate;

/**
 * Columnas del footer: cada una lista las secciones de una página y, si
 * hace falta, enlaces a otras páginas completas.
 */
export const COLUMNAS_PIE = [
  { titulo: 'La fundación', pagina: PAGINAS.estoEsRedh },
  { titulo: 'Lo que nos mueve', pagina: PAGINAS.loQueNosMueve },
  { titulo: 'Súmate', pagina: PAGINAS.sumate, paginasExtra: [PAGINAS.trama, PAGINAS.hablemos] },
];

/**
 * Canales institucionales (documento del cliente, sección "Hablemos").
 * TODO: reemplazar las URL por las reales antes de publicar. Para WhatsApp,
 * el formato es https://wa.me/57XXXXXXXXXX (código de país sin "+").
 */
export const CANALES = [
  { nombre: 'Instagram', url: '#', icono: 'instagram' },
  { nombre: 'WhatsApp', url: '#', icono: 'whatsapp' },
  { nombre: 'Correo', url: 'mailto:contacto@fundacionredh.org', icono: 'correo' },
];

export const DATOS_INSTITUCIONALES = {
  nombre: 'Fundación REDH',
  lema: 'Protección humanitaria',
  descripcion:
    'Trabajamos por la promoción y protección de los derechos humanos de niñas, niños, adolescentes y mujeres, en Bogotá y en distintos territorios de Colombia.',
  // TODO: NIT y datos de registro reales (Cámara de Comercio de Bogotá)
  nit: '000.000.000-0',
  ciudad: 'Bogotá D.C., Colombia',
};
