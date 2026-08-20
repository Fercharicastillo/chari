// CODEX: añadido para abrir publicaciones del perfil con el visor PDF.js público de Physikos
(function (window, document) {
  const RUTA_TEMPLATE_PUBLICACIONES = "templatepdfs_autores.html";

  function obtenerPublicacionPorId(publicacionId) {
    const publicaciones = Array.isArray(window.PhysikosPublicacionesPdf)
      ? window.PhysikosPublicacionesPdf
      : [];

    return publicaciones.find(function (publicacion) {
      return publicacion.id === publicacionId;
    });
  }

  function construirRutaPublicacion(archivo) {
    const rutasPdf = window.PhysikosRutasPdf;

    if (!rutasPdf || typeof rutasPdf.construirPdfPublicacionAutor !== "function") {
      console.error("No se encontró el constructor de rutas para publicaciones.");
      return "";
    }

    return rutasPdf.construirPdfPublicacionAutor(archivo);
  }

  function abrirPublicacion(event) {
    event.preventDefault();

    const enlace = event.currentTarget;
    const publicacion = obtenerPublicacionPorId(enlace.dataset.publicacionPdf);

    if (!publicacion) {
      console.error("No se encontró la publicación PDF registrada:", enlace.dataset.publicacionPdf);
      return;
    }

    const pdfSrc = construirRutaPublicacion(publicacion.archivo);

    if (!pdfSrc) {
      console.error("No se pudo construir la URL del PDF:", publicacion.titulo);
      return;
    }

    sessionStorage.setItem("pdfSrc", pdfSrc);
    sessionStorage.setItem("pdfTitulo", publicacion.titulo);
    sessionStorage.setItem("pdfTipo", publicacion.tipo);
    sessionStorage.setItem("autorPdfActivo", "chari-fernando");
    window.location.href = enlace.getAttribute("href") || RUTA_TEMPLATE_PUBLICACIONES;
  }

  function inicializarPublicacionesPdf() {
    document.querySelectorAll("[data-publicacion-pdf]").forEach(function (enlace) {
      enlace.addEventListener("click", abrirPublicacion);
    });
  }

  document.addEventListener("DOMContentLoaded", inicializarPublicacionesPdf);
})(window, document);
