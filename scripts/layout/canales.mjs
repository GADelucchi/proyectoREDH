/**
 * Construye los enlaces a los canales institucionales a partir de CANALES.
 * Lo usan las plantillas del pie y el generador, para los botones de las
 * páginas marcados con data-canal="instagram | whatsapp | correo".
 */

import { CANALES } from './navegacion.mjs';

const URL_BASE_WHATSAPP = 'https://wa.me/';

/** Enlace de WhatsApp con un mensaje ya escrito ("click to chat"). */
function construirUrlWhatsapp(mensaje) {
  const { numero, mensajePorDefecto } = CANALES.whatsapp;
  const texto = encodeURIComponent(mensaje || mensajePorDefecto);
  // sin número, wa.me abre WhatsApp y deja elegir el contacto: no se rompe
  return `${URL_BASE_WHATSAPP}${numero}?text=${texto}`;
}

export function construirUrlCanal(idCanal, mensaje) {
  if (!(idCanal in CANALES)) {
    throw new Error(`Canal desconocido: "${idCanal}". Los válidos son: ${Object.keys(CANALES).join(', ')}`);
  }
  return idCanal === 'whatsapp' ? construirUrlWhatsapp(mensaje) : CANALES[idCanal].url;
}

export function faltaNumeroWhatsapp() {
  return CANALES.whatsapp.numero === '';
}
