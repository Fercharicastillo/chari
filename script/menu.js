// CODEX: modificado para dejar este archivo dedicado al menu principal responsive
(function (window, document) {
  const clickBtn = document.getElementById("btn_menu");
  const btnMenu = document.querySelector(".btn-menu");
  const menu = document.querySelector(".menu");
  const main = document.querySelector(".main");
  const menuMovilMedia = window.matchMedia("(max-width: 430px)");
  const iniciarMenuCerrado = document.documentElement.hasAttribute(
    "data-menu-inicial-cerrado"
  );

  // CODEX: añadido para cargar modulos hermanos sin repetir etiquetas script en cada pagina
  function cargarModuloMenu(nombreArchivo) {
    const scriptActual = document.currentScript;
    const base = scriptActual ? new URL(".", scriptActual.src).href : "script/";
    const script = document.createElement("script");

    script.src = `${base}${nombreArchivo}`;
    script.defer = true;
    document.head.appendChild(script);
  }

  cargarModuloMenu("menu_submenus.js");
  cargarModuloMenu("darkmode.js");
  cargarModuloMenu("fecha.js");

  if (!clickBtn || !btnMenu || !menu || !main) {
    return;
  }

  // CODEX: modificado para conservar el estado del menu movil y coordinar el overlay global
  function aplicarEstadoMenu(usarClaseMenuDs, guardarEstadoMovil = true) {
    btnMenu.classList.toggle("selected-btn-menu", usarClaseMenuDs);
    menu.classList.toggle("menu_ds", usarClaseMenuDs);
    main.classList.toggle("main_ds", usarClaseMenuDs);

    if (guardarEstadoMovil && menuMovilMedia.matches) {
      sessionStorage.setItem("menuMovilAbierto", usarClaseMenuDs ? "true" : "false");
    }

    if (window.PhysikosOverlay && menuMovilMedia.matches) {
      if (usarClaseMenuDs) {
        window.PhysikosOverlay.mostrar({
          target: ".main",
          onClick: () => aplicarEstadoMenu(false)
        });
      } else {
        window.PhysikosOverlay.ocultar();
      }
    }
  }

  // CODEX: modificado para restaurar temprano el menu movil abierto despues de navegar
  function restaurarEstadoMenuMovil() {
    if (iniciarMenuCerrado) {
      // En escritorio la clase menu_ds cierra el menu; en movil lo abre.
      aplicarEstadoMenu(!menuMovilMedia.matches, false);
      document.documentElement.classList.remove(
        "menu-escritorio-inicial-cerrado",
        "menu-movil-inicial-abierto"
      );
      return;
    }

    if (!menuMovilMedia.matches) {
      return;
    }

    const menuMovilAbierto = sessionStorage.getItem("menuMovilAbierto") === "true";

    if (menuMovilAbierto) {
      aplicarEstadoMenu(true, false);
    }

    document.documentElement.classList.remove("menu-movil-inicial-abierto");
  }

  clickBtn.addEventListener("click", () => {
    aplicarEstadoMenu(!menu.classList.contains("menu_ds"));
  });

  if (iniciarMenuCerrado) {
    menuMovilMedia.addEventListener("change", (evento) => {
      aplicarEstadoMenu(!evento.matches, false);
    });
  }

  menu.addEventListener("mouseenter", () => {
    menu.classList.add("overflow-visible");
  });

  menu.addEventListener("mouseleave", () => {
    menu.classList.remove("overflow-visible");
  });

  window.aplicarEstadoMenu = aplicarEstadoMenu;
  window.restaurarEstadoMenuMovil = restaurarEstadoMenuMovil;

  restaurarEstadoMenuMovil();
})(window, document);
