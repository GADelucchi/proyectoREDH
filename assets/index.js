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

  /* Debe coincidir con el @media (max-width: 1100px) de assets/index.css,
     donde la barra horizontal pasa a panel móvil. */
  var ANCHO_MAXIMO_MENU_MOVIL = 1100;

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
      if (window.innerWidth > ANCHO_MAXIMO_MENU_MOVIL) cerrarMenu();
    });
  }

  /* ------------------------------------------------------------------
     3 bis. Submenús de la navegación
     En escritorio el CSS los abre con :hover y :focus-within; este bloque
     agrega el botón de flecha (táctil y teclado), Escape y clic afuera.
     En el panel móvil funcionan como acordeón con el mismo botón.
     ------------------------------------------------------------------ */
  (function submenus() {
    var CLASE_ABIERTO = 'nav__item--abierto';
    var CLASE_CERRADO_FORZADO = 'nav__item--cerrado-forzado';
    var botones = $$('.submenu-boton');
    if (!botones.length) return;

    function itemDe(boton) {
      return boton.closest('.nav__item');
    }

    function abrirSubmenu(boton) {
      itemDe(boton).classList.add(CLASE_ABIERTO);
      itemDe(boton).classList.remove(CLASE_CERRADO_FORZADO);
      boton.setAttribute('aria-expanded', 'true');
    }

    function cerrarSubmenu(boton) {
      itemDe(boton).classList.remove(CLASE_ABIERTO);
      boton.setAttribute('aria-expanded', 'false');
    }

    function cerrarTodosMenos(botonQueQuedaAbierto) {
      botones.forEach(function (boton) {
        if (boton !== botonQueQuedaAbierto) cerrarSubmenu(boton);
      });
    }

    botones.forEach(function (boton) {
      boton.addEventListener('click', function (evento) {
        evento.stopPropagation();
        var estaAbierto = boton.getAttribute('aria-expanded') === 'true';
        cerrarTodosMenos(boton);
        if (estaAbierto) cerrarSubmenu(boton);
        else abrirSubmenu(boton);
      });

      /* tras un Escape el submenú queda oculto aunque el mouse siga encima;
         al salir del ítem vuelve a responder al hover normalmente */
      itemDe(boton).addEventListener('mouseleave', function () {
        itemDe(boton).classList.remove(CLASE_CERRADO_FORZADO);
      });
      itemDe(boton).addEventListener('focusout', function (evento) {
        if (!itemDe(boton).contains(evento.relatedTarget)) {
          itemDe(boton).classList.remove(CLASE_CERRADO_FORZADO);
        }
      });
    });

    document.addEventListener('click', function (evento) {
      if (!evento.target.closest('.nav__item')) cerrarTodosMenos(null);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key !== 'Escape') return;
      var itemConFoco = document.activeElement && document.activeElement.closest('.nav__item');

      botones.forEach(function (boton) {
        var item = itemDe(boton);
        /* sólo se fuerza el cierre de lo que está visible en este momento;
           si se marcara todo, un ítem que nunca recibió el mouse quedaría
           bloqueado hasta un mouseleave que no va a llegar */
        var estaVisible = item.classList.contains(CLASE_ABIERTO) || item.matches(':hover, :focus-within');
        cerrarSubmenu(boton);
        if (estaVisible) item.classList.add(CLASE_CERRADO_FORZADO);
      });

      /* si el foco estaba dentro de un submenú, vuelve a su botón */
      var botonDelItem = itemConFoco && $('.submenu-boton', itemConFoco);
      if (botonDelItem) botonDelItem.focus();
    });

    /* un enlace a una sección de la misma página no recarga: hay que
       cerrar el submenú a mano para que no tape el contenido */
    $$('.submenu__enlace').forEach(function (enlace) {
      enlace.addEventListener('click', function () {
        cerrarTodosMenos(null);
        /* el header es sticky: tras el salto el mouse sigue sobre el submenú
           y el :hover lo mantendría abierto encima del contenido */
        if (document.activeElement) document.activeElement.blur();
        /* después del blur: su focusout limpia la marca de cierre forzado */
        enlace.closest('.nav__item').classList.add(CLASE_CERRADO_FORZADO);
      });
    });
  })();

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
})();
