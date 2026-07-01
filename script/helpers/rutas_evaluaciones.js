// CODEX: añadido para centralizar rutas de la plantilla y bancos de evaluaciones
(function (window) {
  const BANCO_POR_DEFECTO = "cinematica_mru";
  const RUTA_PLANTILLA_EVALUACION = "../evaluaciones/rp_formulario_3BGU.html";
  const RUTA_BANCOS_CINEMATICA = "../../script/evaluaciones/bancos/cinematica/";

  function construirUrlPlantilla(bancoId) {
    if (!bancoId) return "";

    return `${RUTA_PLANTILLA_EVALUACION}?banco=${encodeURIComponent(bancoId)}`;
  }

  function construirRutaBancoCinematica(nombreArchivo) {
    if (!nombreArchivo) return "";

    return `${RUTA_BANCOS_CINEMATICA}${nombreArchivo}`;
  }

  function obtenerBancoPorDefecto() {
    return BANCO_POR_DEFECTO;
  }

  window.PhysikosRutasEvaluaciones = {
    construirUrlPlantilla,
    construirRutaBancoCinematica,
    obtenerBancoPorDefecto
  };
})(window);
