#!/usr/bin/env node
/**
 * Genera el header y el footer de todas las páginas del sitio.
 *
 * Uso:
 *   npm run layout             reescribe el bloque entre marcadores en cada HTML
 *   npm run layout:verificar   no escribe nada; falla si algún HTML está
 *                              desactualizado o si un submenú apunta a un
 *                              ancla que no existe (útil antes de publicar)
 *
 * Es una herramienta de desarrollo: corre en la máquina de quien edita, sin
 * dependencias externas. Lo que se publica sigue siendo HTML estático.
 *
 * Cada página marca dónde va cada bloque con un par de comentarios:
 *   <!-- layout:cabecera --> ... <!-- /layout:cabecera -->
 *   <!-- layout:pie -->      ... <!-- /layout:pie -->
 *
 * Además completa el href de todo enlace con data-canal (ver
 * scripts/layout/canales.mjs), así el número de WhatsApp y las redes se
 * cambian en un solo lugar:
 *   <a class="btn btn--whatsapp" data-canal="whatsapp" data-mensaje="Hola…" href="">
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGINAS } from './layout/navegacion.mjs';
import { renderCabecera, renderPie } from './layout/plantillas.mjs';
import { construirUrlCanal, faltaNumeroWhatsapp } from './layout/canales.mjs';

const RAIZ_SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETAS_CON_PAGINAS = ['.', 'pages'];

const BLOQUES = [
  { nombre: 'cabecera', render: renderCabecera },
  { nombre: 'pie', render: renderPie },
];

const modoVerificar = process.argv.includes('--verificar');

/** Devuelve los .html del sitio como rutas relativas a la raíz ("pages/sumate.html"). */
async function listarPaginas() {
  const paginas = [];
  for (const carpeta of CARPETAS_CON_PAGINAS) {
    const archivos = await readdir(path.join(RAIZ_SITIO, carpeta));
    archivos
      .filter((archivo) => archivo.endsWith('.html'))
      .forEach((archivo) => paginas.push(path.posix.join(carpeta, archivo)));
  }
  return paginas;
}

/**
 * Crea la función de enlaces para una página: convierte una ruta relativa a
 * la raíz del sitio en un href relativo a la carpeta de esa página.
 */
function crearEnlazador(rutaPagina) {
  const carpetaPagina = path.posix.dirname(rutaPagina);
  return function enlazar(rutaDestino, ancla) {
    const href = path.posix.relative(carpetaPagina, rutaDestino);
    return ancla ? `${href}#${ancla}` : href;
  };
}

function patronDeBloque(nombre) {
  return new RegExp(`(<!-- layout:${nombre} -->)[\\s\\S]*?(<!-- /layout:${nombre} -->)`);
}

function reemplazarBloques(html, rutaPagina) {
  const enlazar = crearEnlazador(rutaPagina);
  let resultado = html;

  for (const bloque of BLOQUES) {
    const patron = patronDeBloque(bloque.nombre);
    if (!patron.test(resultado)) {
      throw new Error(`${rutaPagina}: falta el marcador <!-- layout:${bloque.nombre} -->`);
    }
    resultado = resultado.replace(patron, (_, apertura, cierre) => `${apertura}\n  ${bloque.render(enlazar)}\n  ${cierre}`);
  }
  return resultado;
}

const PATRON_ENLACE_DE_CANAL = /<a\b[^>]*\bdata-canal="([a-z]+)"[^>]*>/g;
const PATRON_MENSAJE = /\bdata-mensaje="([^"]*)"/;
const PATRON_HREF = /\bhref="[^"]*"/;

/** Reescribe el href de los enlaces marcados con data-canal="...". */
function actualizarEnlacesDeCanales(html) {
  return html.replace(PATRON_ENLACE_DE_CANAL, (etiqueta, idCanal) => {
    const mensaje = etiqueta.match(PATRON_MENSAJE)?.[1];
    const href = `href="${construirUrlCanal(idCanal, mensaje)}"`;
    return PATRON_HREF.test(etiqueta) ? etiqueta.replace(PATRON_HREF, href) : etiqueta.replace('<a', `<a ${href}`);
  });
}

/** Comprueba que cada ancla de la configuración exista como id en su página. */
async function verificarAnclas() {
  const errores = [];
  for (const pagina of Object.values(PAGINAS)) {
    if (!pagina.secciones) continue;
    const html = await readFile(path.join(RAIZ_SITIO, pagina.ruta), 'utf8');
    for (const { ancla } of pagina.secciones) {
      if (!html.includes(`id="${ancla}"`)) {
        errores.push(`${pagina.ruta}: no existe ningún elemento con id="${ancla}"`);
      }
    }
  }
  return errores;
}

async function main() {
  const paginas = await listarPaginas();
  const desactualizadas = [];

  for (const rutaPagina of paginas) {
    const rutaAbsoluta = path.join(RAIZ_SITIO, rutaPagina);
    const original = await readFile(rutaAbsoluta, 'utf8');
    const generado = actualizarEnlacesDeCanales(reemplazarBloques(original, rutaPagina));

    if (generado === original) continue;
    desactualizadas.push(rutaPagina);
    if (!modoVerificar) await writeFile(rutaAbsoluta, generado);
  }

  const erroresAnclas = await verificarAnclas();
  erroresAnclas.forEach((error) => console.error(`✗ ${error}`));

  // aviso, no error: el sitio funciona igual (wa.me deja elegir el contacto)
  if (faltaNumeroWhatsapp()) {
    console.warn('⚠ Falta el número de WhatsApp en scripts/layout/navegacion.mjs → CANALES.whatsapp.numero');
  }

  if (modoVerificar) {
    desactualizadas.forEach((pagina) => console.error(`✗ ${pagina}: header/footer desactualizado (correr npm run layout)`));
    const hayErrores = desactualizadas.length > 0 || erroresAnclas.length > 0;
    console.log(hayErrores ? 'Verificación con errores.' : `✓ ${paginas.length} páginas al día.`);
    process.exitCode = hayErrores ? 1 : 0;
    return;
  }

  console.log(`✓ Header y footer generados. Páginas modificadas: ${desactualizadas.length} de ${paginas.length}.`);
  if (erroresAnclas.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
