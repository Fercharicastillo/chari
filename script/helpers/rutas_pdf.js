// CODEX: añadido para centralizar la construccion de URLs publicas de PDF.js Viewer
(function (window) {
  const BASE_PUBLICA = "https://fercharicastillo.github.io/chari";
  const RUTA_VISOR_PDF = "visor_pdfs/web/viewer.html?file=pdfs/";

  const RUTAS_PDF = {
    planesMecanicaNewtoniana: "pdfs_repositorio_planes_de_clase/mecanica_newtoniana/",
    librosAlgebraLineal: "pdfs_repositorio_libros/algebra_lineal/"
  };

  function limpiarSegmento(segmento) {
    return String(segmento || "").replace(/^\/+|\/+$/g, "");
  }

  function unirSegmentos(segmentos) {
    return segmentos
      .filter(Boolean)
      .map(limpiarSegmento)
      .filter(Boolean)
      .join("/");
  }

  function construirUrlViewerPdf(rutaPdfPublica) {
    const rutaLimpia = limpiarSegmento(rutaPdfPublica);
    if (!rutaLimpia) return "";

    return `${BASE_PUBLICA}/${RUTA_VISOR_PDF}${rutaLimpia}`;
  }

  function construirPdfPlanesMecanica(carpeta, archivo) {
    if (!carpeta || !archivo) return "";

    return construirUrlViewerPdf(
      unirSegmentos([RUTAS_PDF.planesMecanicaNewtoniana, carpeta, archivo])
    );
  }

  function construirPdfLibroAlgebraLineal(archivo) {
    if (!archivo) return "";

    return construirUrlViewerPdf(
      unirSegmentos([RUTAS_PDF.librosAlgebraLineal, archivo])
    );
  }

  window.PhysikosRutasPdf = {
    BASE_PUBLICA,
    RUTA_VISOR_PDF,
    RUTAS_PDF,
    construirUrlViewerPdf,
    construirPdfPlanesMecanica,
    construirPdfLibroAlgebraLineal
  };
})(window);
