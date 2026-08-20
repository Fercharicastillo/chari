// CODEX: añadido para aislar la logica de submenus y flechas del menu lateral
(function (document) {
  function inicializarSubmenusMenu() {
    const seccionesConSubmenu = [
      "menu-simuladores",
      "menu-proyectos",
      "menu-repositorio-planes",
      "menu-repositorio-libros",
      "menu-hoja-vida"
    ];

    seccionesConSubmenu.forEach((claseSeccion) => {
      const encabezadoSubmenu = document.querySelector(`.content__content .${claseSeccion}`);

      if (!encabezadoSubmenu || encabezadoSubmenu.querySelector(".menu-submenu-toggle")) {
        return;
      }

      const subelementos = [];
      let siguienteElemento = encabezadoSubmenu.nextElementSibling;

      while (siguienteElemento && siguienteElemento.querySelector("a.toc-section")) {
        subelementos.push(siguienteElemento);
        siguienteElemento = siguienteElemento.nextElementSibling;
      }

      if (subelementos.length === 0) {
        return;
      }

      const enlaceEncabezado = encabezadoSubmenu.querySelector("a.toc-part");
      const nombreSubmenu = enlaceEncabezado ? enlaceEncabezado.textContent.trim() : "submenu";
      const submenu = document.createElement("div");
      submenu.className = `menu-submenu menu-submenu-${claseSeccion.replace("menu-", "")}`;

      subelementos[0].parentNode.insertBefore(submenu, subelementos[0]);
      subelementos.forEach((subelemento) => submenu.appendChild(subelemento));

      const submenuActivo = encabezadoSubmenu.classList.contains("current") ||
        subelementos.some((subelemento) => subelemento.classList.contains("current"));
      const iniciarCerrado = !submenuActivo;
      const flechaVisible = encabezadoSubmenu.classList.contains("current");

      submenu.classList.toggle("menu-submenu-cerrado", iniciarCerrado);
      submenu.setAttribute("aria-hidden", iniciarCerrado ? "true" : "false");

      const botonToggle = document.createElement("button");
      botonToggle.className = "menu-submenu-toggle";
      botonToggle.type = "button";
      botonToggle.classList.toggle("is-visible", flechaVisible);
      botonToggle.setAttribute("aria-label", iniciarCerrado ? `Expandir ${nombreSubmenu}` : `Contraer ${nombreSubmenu}`);
      botonToggle.setAttribute("aria-expanded", iniciarCerrado ? "false" : "true");

      encabezadoSubmenu.classList.add("menu-submenu-header");
      encabezadoSubmenu.classList.toggle("menu-submenu-header-cerrado", iniciarCerrado);
      encabezadoSubmenu.appendChild(botonToggle);

      function cerrarOtrosSubmenus() {
        document.querySelectorAll(".menu .content__content .menu-submenu").forEach((otroSubmenu) => {
          if (otroSubmenu === submenu) return;

          const otroEncabezado = otroSubmenu.previousElementSibling;
          const otroToggle = otroEncabezado ? otroEncabezado.querySelector(".menu-submenu-toggle") : null;

          otroSubmenu.classList.add("menu-submenu-cerrado");
          otroSubmenu.setAttribute("aria-hidden", "true");

          if (otroEncabezado) {
            otroEncabezado.classList.add("menu-submenu-header-cerrado");
          }

          if (otroToggle) {
            otroToggle.classList.toggle("is-visible", otroEncabezado && otroEncabezado.classList.contains("current"));
            otroToggle.setAttribute("aria-expanded", "false");
          }
        });
      }

      botonToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (submenu.classList.contains("menu-submenu-cerrado")) {
          cerrarOtrosSubmenus();
        }

        const estaCerrado = submenu.classList.toggle("menu-submenu-cerrado");
        encabezadoSubmenu.classList.toggle("menu-submenu-header-cerrado", estaCerrado);
        botonToggle.classList.toggle("is-visible", flechaVisible);
        submenu.setAttribute("aria-hidden", estaCerrado ? "true" : "false");
        botonToggle.setAttribute("aria-expanded", estaCerrado ? "false" : "true");
        botonToggle.setAttribute("aria-label", estaCerrado ? `Expandir ${nombreSubmenu}` : `Contraer ${nombreSubmenu}`);
      });

      encabezadoSubmenu.addEventListener("click", (event) => {
        if (event.target.closest("a") || event.target.closest(".menu-submenu-toggle")) return;
        if (!submenu.classList.contains("menu-submenu-cerrado")) return;

        cerrarOtrosSubmenus();
        submenu.classList.remove("menu-submenu-cerrado");
        encabezadoSubmenu.classList.remove("menu-submenu-header-cerrado");
        botonToggle.classList.toggle("is-visible", flechaVisible);
        submenu.setAttribute("aria-hidden", "false");
        botonToggle.setAttribute("aria-expanded", "true");
        botonToggle.setAttribute("aria-label", `Contraer ${nombreSubmenu}`);
      });
    });
  }

  inicializarSubmenusMenu();
  window.inicializarSubmenusMenu = inicializarSubmenusMenu;
})(document);
