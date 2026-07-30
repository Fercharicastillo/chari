// CODEX: modificado para actualizar automaticamente todos los contadores de capitulos registrados
(function (window, document) {
  function contarCapitulos(capitulos) {
    if (!Array.isArray(capitulos)) {
      return 0;
    }

    return capitulos.length;
  }

  function obtenerEtiquetaCapitulos(total) {
    if (total <= 0) {
      return "En Construccion";
    }

    return total === 1 ? "1 capitulo" : `${total} capitulos`;
  }

  function obtenerCapitulosPorId(repositorioId) {
    const registros = window.PhysikosRecursosPlanes || {};
    return registros[repositorioId] || [];
  }

  function actualizarContadoresCapitulos() {
    document.querySelectorAll("[data-recursos-capitulos]").forEach(function (contador) {
      const repositorioId = contador.dataset.recursosCapitulos;
      const capitulos = obtenerCapitulosPorId(repositorioId);

      contador.textContent = obtenerEtiquetaCapitulos(contarCapitulos(capitulos));
    });
  }

  document.addEventListener("DOMContentLoaded", actualizarContadoresCapitulos);
})(window, document);
