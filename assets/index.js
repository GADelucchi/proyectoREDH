/* ==========================================================================
   Fundación REDH — comportamiento del sitio
   Un único archivo, sin dependencias. Cada bloque se auto-desactiva si los
   elementos que necesita no están en la página, así que el mismo script
   sirve para todas.
   ========================================================================== */

(function () {
  'use strict';

  /* marca que el JS corrió: el CSS lo usa para las animaciones de entrada */
  document.documentElement.classList.add('con-js');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------------
     1. Alto real de la cabecera → variable CSS --cabecera-h
     La usan el menú móvil (inset) y el scroll-margin de las anclas.
     ------------------------------------------------------------------ */
  var cabecera = $('.cabecera');

  function medirCabecera() {
    if (!cabecera) return;
    document.documentElement.style.setProperty(
      '--cabecera-h',
      cabecera.offsetHeight + 'px'
    );
  }

  medirCabecera();
  window.addEventListener('resize', medirCabecera);

  /* ------------------------------------------------------------------
     2. Sombra de la cabecera al scrollear
     ------------------------------------------------------------------ */
  if (cabecera) {
    var pintarCabecera = function () {
      cabecera.classList.toggle('cabecera--fija', window.scrollY > 8);
    };
    pintarCabecera();
    window.addEventListener('scroll', pintarCabecera, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. Menú móvil
     ------------------------------------------------------------------ */
  var menuBoton = $('.menu-boton');
  var nav = $('#nav');

  function cerrarMenu() {
    if (!menuBoton || !nav) return;
    menuBoton.setAttribute('aria-expanded', 'false');
    nav.setAttribute('data-abierto', 'false');
    document.documentElement.classList.remove('menu-abierto');
  }

  function alternarMenu() {
    var abierto = menuBoton.getAttribute('aria-expanded') === 'true';
    if (abierto) {
      cerrarMenu();
    } else {
      menuBoton.setAttribute('aria-expanded', 'true');
      nav.setAttribute('data-abierto', 'true');
      document.documentElement.classList.add('menu-abierto');
    }
  }

  if (menuBoton && nav) {
    menuBoton.addEventListener('click', alternarMenu);

    /* al tocar un enlace del menú se cierra solo */
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', cerrarMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrarMenu();
    });

    /* si se vuelve a escritorio con el menú abierto, se resetea */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1200) cerrarMenu();
    });
  }

  /* ------------------------------------------------------------------
     4. Enlace activo en la navegación
     Compara el archivo de la URL con el href de cada enlace, así no hay
     que tocar el HTML de cada página para marcar dónde estamos.
     ------------------------------------------------------------------ */
  (function marcarActivo() {
    /* se queda con el nombre del archivo, sin carpetas, ancla ni query: así da
       igual que los href sean relativos ("sumate.html"), suban de carpeta
       ("../../index.html") o bajen ("assets/html/sumate.html") */
    function archivo(ruta) {
      return ruta.split('#')[0].split('?')[0].split('/').pop() || 'index.html';
    }

    var actual = archivo(window.location.pathname);

    $$('.nav__enlace').forEach(function (enlace) {
      var destino = archivo(enlace.getAttribute('href') || '');
      if (!destino) return;
      if (destino === actual) {
        enlace.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ------------------------------------------------------------------
     5. Año actual en el pie
     ------------------------------------------------------------------ */
  $$('[data-anio]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------------------
     6. Aparición al hacer scroll
     ------------------------------------------------------------------ */
  (function revelar() {
    var elementos = $$('[data-revelar]');
    if (!elementos.length) return;

    var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sinMovimiento || !('IntersectionObserver' in window)) {
      elementos.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    elementos.forEach(function (el) { observador.observe(el); });
  })();

  /* ------------------------------------------------------------------
     7. Acordeón (preguntas frecuentes / transparencia)
     ------------------------------------------------------------------ */
  $$('.acordeon__boton').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var panel = document.getElementById(boton.getAttribute('aria-controls'));
      if (!panel) return;
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
    });
  });

  /* ------------------------------------------------------------------
     8. Filtros de novedades
     Filtra en el cliente por data-categoria. Cuando haya muchas notas
     conviene pasar esto a paginado del lado del servidor o a un JSON.
     ------------------------------------------------------------------ */
  (function filtrarNovedades() {
    var filtros = $$('.filtro');
    var notas = $$('[data-categoria]');
    if (!filtros.length || !notas.length) return;

    var vacio = $('[data-sin-resultados]');

    filtros.forEach(function (filtro) {
      filtro.addEventListener('click', function () {
        var categoria = filtro.dataset.filtro;

        filtros.forEach(function (f) {
          f.setAttribute('aria-pressed', String(f === filtro));
        });

        var visibles = 0;
        notas.forEach(function (nota) {
          var coincide = categoria === 'todas' || nota.dataset.categoria === categoria;
          nota.hidden = !coincide;
          if (coincide) visibles++;
        });

        if (vacio) vacio.hidden = visibles > 0;
      });
    });
  })();

  /* ------------------------------------------------------------------
     9. Grupos de botones tipo "elegí uno" (frecuencia y monto de donación)
     Cada contenedor .montos es su propio grupo: elegir un monto no debe
     desmarcar la frecuencia. Si el grupo tiene data-destino, el valor del
     botón elegido se copia a ese input.
     ------------------------------------------------------------------ */
  $$('.montos').forEach(function (grupo) {
    var botones = $$('.monto', grupo);
    if (!botones.length) return;

    var destino = grupo.dataset.destino
      ? document.getElementById(grupo.dataset.destino)
      : null;

    botones.forEach(function (boton) {
      boton.addEventListener('click', function () {
        botones.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === boton));
        });
        if (destino) destino.value = boton.dataset.monto || '';
      });
    });

    /* si se escribe un monto a mano, ningún preset queda marcado */
    if (destino) {
      destino.addEventListener('input', function () {
        botones.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      });
    }
  });

  /* ------------------------------------------------------------------
     10. Formularios
     Validación mínima del lado del cliente + mensaje de confirmación.
     TODO: conectar con el backend / servicio de formularios que se elija
     (Formspree, un endpoint propio, etc.). Hoy sólo simula el envío.
     ------------------------------------------------------------------ */
  $$('form[data-formulario]').forEach(function (form) {
    var aviso = $('[data-aviso]', form);

    form.setAttribute('novalidate', '');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var primerError = null;

      $$('.campo', form).forEach(function (campo) {
        var control = $('input, select, textarea', campo);
        var error = $('.campo__error', campo);
        if (!control) return;

        var valido = control.checkValidity();
        campo.classList.toggle('campo--error', !valido);

        if (error) {
          error.hidden = valido;
          if (!valido) error.textContent = control.validationMessage;
        }

        if (!valido && !primerError) primerError = control;
      });

      if (primerError) {
        primerError.focus();
        return;
      }

      if (aviso) {
        aviso.hidden = false;
        aviso.textContent =
          '¡Gracias! Recibimos tu mensaje y te vamos a responder a la brevedad.';
        aviso.setAttribute('role', 'status');
      }

      form.reset();
    });
  });
})();
