/**
 * Plantillas del header y del footer.
 *
 * Son funciones puras: reciben los datos de navegacion.mjs y una función
 * `enlazar(ruta, ancla?)` que devuelve el href relativo correcto para la
 * página que se está generando. No leen ni escriben archivos.
 */

import {
  PAGINAS,
  MENU_PRINCIPAL,
  BOTON_DESTACADO,
  COLUMNAS_PIE,
  CANALES,
  DATOS_INSTITUCIONALES,
} from './navegacion.mjs';

const ICONO_FLECHA = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ICONOS_CANALES = {
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.2-4A8 8 0 1 1 8.3 19z"/><path d="M9 8.8c0 3 2.6 6 6 6.4l1.2-1.4-1.9-1-.9.8a4.5 4.5 0 0 1-2.4-2.4l.8-.9-1-1.9z" fill="currentColor" stroke="none"/></svg>',
  correo:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
};

/** Convierte "Esto es REDH" en "esto-es-redh" para armar ids únicos. */
function aSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function tieneSecciones(pagina) {
  return Array.isArray(pagina.secciones) && pagina.secciones.length > 0;
}

function renderSubmenu(pagina, idSubmenu, enlazar) {
  const enlaces = pagina.secciones
    .map(
      (seccion) =>
        `<li><a class="submenu__enlace" href="${enlazar(pagina.ruta, seccion.ancla)}">${seccion.etiqueta}</a></li>`
    )
    .join('\n              ');

  return `<ul class="submenu" id="${idSubmenu}">
              ${enlaces}
            </ul>`;
}

function renderBotonSubmenu(pagina, idSubmenu) {
  return `<button class="submenu-boton" type="button" aria-expanded="false" aria-controls="${idSubmenu}"
              aria-label="Ver secciones de ${pagina.etiqueta}">${ICONO_FLECHA}</button>`;
}

/**
 * Un ítem de menú: el enlace a la página y, si tiene secciones, el botón y
 * el submenú. `claseExtra` permite marcar ítems que sólo van en el panel móvil.
 */
function renderItemMenu(pagina, enlazar, { claseExtra = '', sufijoId = '' } = {}) {
  const clases = ['nav__item', claseExtra].filter(Boolean).join(' ');
  const enlace = `<a class="nav__enlace" href="${enlazar(pagina.ruta)}">${pagina.etiqueta}</a>`;

  if (!tieneSecciones(pagina)) {
    return `<li class="${clases}">${enlace}</li>`;
  }

  const idSubmenu = `submenu-${aSlug(pagina.etiqueta)}${sufijoId}`;
  return `<li class="${clases}">
            ${enlace}
            ${renderBotonSubmenu(pagina, idSubmenu)}
            ${renderSubmenu(pagina, idSubmenu, enlazar)}
          </li>`;
}

function renderBotonDestacado(pagina, enlazar) {
  const idSubmenu = `submenu-${aSlug(pagina.etiqueta)}-destacado`;
  return `<div class="nav__item nav__item--destacado">
          <a class="btn btn--acento" href="${enlazar(pagina.ruta)}">${pagina.etiqueta}</a>
          ${renderBotonSubmenu(pagina, idSubmenu)}
          ${renderSubmenu(pagina, idSubmenu, enlazar)}
        </div>`;
}

function renderMarca(enlazar, { variante }) {
  const archivoLogo =
    variante === 'negativo' ? 'assets/imgs/logo-redh-horizontal-blanco.svg' : 'assets/imgs/logo-redh-horizontal.svg';

  return `<a class="marca" href="${enlazar(PAGINAS.inicio.ruta)}">
          <img class="marca__logo" src="${enlazar(archivoLogo)}" width="227" height="67"
            alt="${DATOS_INSTITUCIONALES.nombre} — Inicio">
        </a>`;
}

export function renderCabecera(enlazar) {
  const itemsMenu = [
    renderItemMenu(PAGINAS.inicio, enlazar, { claseExtra: 'nav__item--solo-panel' }),
    ...MENU_PRINCIPAL.map((pagina) => renderItemMenu(pagina, enlazar)),
    // en el panel móvil el botón destacado también se lista, con sus secciones
    renderItemMenu(BOTON_DESTACADO, enlazar, { claseExtra: 'nav__item--solo-panel', sufijoId: '-panel' }),
  ].join('\n          ');

  return `<header class="cabecera">
    <div class="contenedor cabecera__inner">
      ${renderMarca(enlazar, { variante: 'positivo' })}

      <nav class="nav" id="nav" aria-label="Navegación principal">
        <ul class="nav__lista">
          ${itemsMenu}
        </ul>
      </nav>

      <div class="cabecera__acciones">
        ${renderBotonDestacado(BOTON_DESTACADO, enlazar)}
        <button class="menu-boton" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">
          <span class="menu-boton__barras"></span>
        </button>
      </div>
    </div>
  </header>`;
}

function renderColumnaPie(columna, enlazar) {
  const { pagina, paginasExtra = [] } = columna;
  const enlacesSecciones = (pagina.secciones ?? []).map(
    (seccion) => `<li><a href="${enlazar(pagina.ruta, seccion.ancla)}">${seccion.etiqueta}</a></li>`
  );
  const enlacesPaginas = paginasExtra.map(
    (extra) => `<li><a href="${enlazar(extra.ruta)}">${extra.etiqueta}</a></li>`
  );

  return `<div>
          <h2 class="pie__titulo"><a href="${enlazar(pagina.ruta)}">${columna.titulo}</a></h2>
          <ul class="pie__lista">
            ${[...enlacesSecciones, ...enlacesPaginas].join('\n            ')}
          </ul>
        </div>`;
}

function renderCanales() {
  return CANALES.map(
    (canal) =>
      `<a href="${canal.url}" aria-label="${canal.nombre} de ${DATOS_INSTITUCIONALES.nombre}">${ICONOS_CANALES[canal.icono]}</a>`
  ).join('\n            ');
}

export function renderPie(enlazar) {
  const datos = DATOS_INSTITUCIONALES;
  const columnas = COLUMNAS_PIE.map((columna) => renderColumnaPie(columna, enlazar)).join('\n\n        ');

  return `<footer class="pie superficie-oscura">
    <div class="contenedor">
      <div class="pie__grid">
        <div>
          ${renderMarca(enlazar, { variante: 'negativo' })}
          <p class="pie__lema">${datos.lema}</p>
          <p class="pie__texto">${datos.descripcion}</p>
          <div class="redes">
            ${renderCanales()}
          </div>
        </div>

        ${columnas}
      </div>

      <div class="pie__legal">
        <p>© <span data-anio>${new Date().getFullYear()}</span> ${datos.nombre} · Entidad sin ánimo de lucro · NIT ${datos.nit}</p>
        <p>${datos.ciudad}</p>
      </div>
    </div>
  </footer>`;
}
