// CODEX: añadido para renderizar el menu lateral desde datos reutilizables
(function () {
  const menuItems = window.PhysikosMenuItems;

  if (!Array.isArray(menuItems)) {
    return;
  }

  function resolverRuta(base, href) {
    if (!href || href.startsWith("#") || href.startsWith("http")) {
      return href || "#";
    }

    return `${base || ""}${href}`;
  }

  function crearEnlace(texto, href, clase) {
    const enlace = document.createElement("a");
    enlace.href = href;
    enlace.textContent = texto;

    if (clase) {
      enlace.className = clase;
    }

    return enlace;
  }

  function crearItemMenu(item, opciones) {
    const parrafo = document.createElement("p");
    const esActivo = item.id === opciones.actual;
    const clases = [];

    if (esActivo) {
      clases.push("current", "current-part");
    }

    if (item.clase) {
      clases.push(item.clase);
    }

    parrafo.className = clases.join(" ");
    // CODEX: añadido para identificar elementos renderizados desde scripts especificos sin depender de clases visuales
    parrafo.dataset.menuItemId = item.id;
    parrafo.appendChild(
      crearEnlace(
        item.texto,
        resolverRuta(opciones.base, item.href),
        item.id === "introduccion" ? "" : "toc-part"
      )
    );

    return parrafo;
  }

  // CODEX: añadido para renderizar subelementos del menu solo cuando la pagina lo solicita
  function crearSubitemMenu(subitem, opciones) {
    const parrafo = document.createElement("p");
    const clases = ["current-part"];

    if (subitem.id === opciones.subactual) {
      clases.unshift("current");
    }

    parrafo.className = clases.join(" ");
    // CODEX: añadido para permitir que paginas especiales marquen el subitem activo renderizado
    parrafo.dataset.menuSubitemId = subitem.id;
    parrafo.appendChild(
      crearEnlace(
        subitem.texto,
        resolverRuta(opciones.base, subitem.href),
        "toc-section"
      )
    );

    return parrafo;
  }

  document.querySelectorAll("[data-menu-render]").forEach((contenedor) => {
    const opciones = {
      base: contenedor.dataset.menuBase || "",
      actual: contenedor.dataset.menuCurrent || "",
      subactual: contenedor.dataset.menuSubcurrent || "",
      incluirSubmenus: contenedor.dataset.menuSubmenus === "true"
    };

    contenedor.innerHTML = "";
    menuItems.forEach((item) => {
      contenedor.appendChild(crearItemMenu(item, opciones));

      if (opciones.incluirSubmenus && Array.isArray(item.subitems)) {
        item.subitems.forEach((subitem) => {
          contenedor.appendChild(crearSubitemMenu(subitem, opciones));
        });
      }
    });
  });
})();
