// CODEX: añadido para centralizar el overlay oscuro reutilizable de Physikos
(function () {
  const OVERLAY_ID = 'physikosUiOverlay';
  let accionCerrar = null;
  let cierrePorEscape = true;
  let hostActual = null;

  function resolverHost(target) {
    if (target instanceof HTMLElement) {
      return target;
    }

    if (typeof target === 'string') {
      return document.querySelector(target) || document.body;
    }

    return document.body;
  }

  function obtenerOverlay(host = document.body) {
    let overlay = document.getElementById(OVERLAY_ID);

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.className = 'ui-overlay';
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');

      overlay.addEventListener('click', (event) => {
        if (event.target !== overlay) return;

        if (typeof accionCerrar === 'function') {
          accionCerrar();
        } else {
          ocultarOverlay();
        }
      });
    }

    if (overlay.parentElement !== host) {
      overlay.remove();
      host.appendChild(overlay);
    }

    return overlay;
  }

  function mostrarOverlay(opciones = {}) {
    const host = resolverHost(opciones.target);
    const overlay = obtenerOverlay(host);
    hostActual = host;
    accionCerrar = typeof opciones.onClick === 'function' ? opciones.onClick : null;
    cierrePorEscape = opciones.closeOnEscape !== false;

    overlay.classList.toggle('ui-overlay--content', host !== document.body);
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ui-overlay-open');
    host.classList.add('ui-overlay-host');
    requestAnimationFrame(() => overlay.classList.add('is-open'));
  }

  function ocultarOverlay() {
    const overlay = document.getElementById(OVERLAY_ID) || obtenerOverlay(hostActual || document.body);
    accionCerrar = null;
    cierrePorEscape = true;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ui-overlay-open');

    if (hostActual) {
      hostActual.classList.remove('ui-overlay-host');
    }

    window.setTimeout(() => {
      if (!overlay.classList.contains('is-open')) {
        overlay.hidden = true;
        overlay.classList.remove('ui-overlay--content');
      }
    }, 200);

    hostActual = null;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !cierrePorEscape) return;

    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay || overlay.hidden) return;

    if (typeof accionCerrar === 'function') {
      accionCerrar();
    } else {
      ocultarOverlay();
    }
  });

  window.PhysikosOverlay = {
    mostrar: mostrarOverlay,
    ocultar: ocultarOverlay
  };
})();


