// CODEX: añadido para navegar entre perfil, artículos y libros sin duplicar páginas del autor
(function (window, document) {
  const tabs = Array.from(document.querySelectorAll("[data-author-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-author-panel]"));

  if (tabs.length === 0 || panels.length === 0) {
    return;
  }

  function normalizarTexto(texto) {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function activarPestana(id, actualizarHistorial = true) {
    const tabActiva = tabs.find((tab) => tab.dataset.authorTab === id) || tabs[0];
    const idActivo = tabActiva.dataset.authorTab;

    tabs.forEach((tab) => {
      const activa = tab === tabActiva;
      tab.classList.toggle("is-active", activa);
      tab.setAttribute("aria-selected", activa ? "true" : "false");
      tab.tabIndex = activa ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authorPanel !== idActivo;
    });

    if (actualizarHistorial) {
      const hash = idActivo === "perfil" ? "" : `#${idActivo}`;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
  }

  function filtrarObras(tipo, consulta) {
    const lista = document.querySelector(`[data-author-work-list="${tipo}"]`);
    const mensajeVacio = document.querySelector(`[data-author-work-empty="${tipo}"]`);

    if (!lista) return;

    const termino = normalizarTexto(consulta);
    let visibles = 0;

    lista.querySelectorAll("[data-author-work]").forEach((obra) => {
      const coincide = normalizarTexto(obra.dataset.authorWork).includes(termino) ||
        normalizarTexto(obra.textContent).includes(termino);

      obra.hidden = !coincide;
      if (coincide) visibles += 1;
    });

    if (mensajeVacio) {
      mensajeVacio.hidden = visibles !== 0;
    }
  }

  tabs.forEach((tab, indice) => {
    tab.addEventListener("click", () => activarPestana(tab.dataset.authorTab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const desplazamiento = event.key === "ArrowRight" ? 1 : -1;
      const siguienteIndice = (indice + desplazamiento + tabs.length) % tabs.length;
      tabs[siguienteIndice].focus();
      activarPestana(tabs[siguienteIndice].dataset.authorTab);
    });
  });

  document.querySelectorAll("[data-author-work-search]").forEach((busqueda) => {
    busqueda.addEventListener("input", () => {
      filtrarObras(busqueda.dataset.authorWorkSearch, busqueda.value);
    });
  });

  window.addEventListener("hashchange", () => {
    activarPestana(window.location.hash.slice(1) || "perfil", false);
  });

  activarPestana(window.location.hash.slice(1) || "perfil", false);
})(window, document);
