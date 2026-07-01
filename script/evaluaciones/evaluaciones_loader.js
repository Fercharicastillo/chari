// CODEX: modificado para cargar solo bancos registrados y evitar caer siempre en MRU ante parametros invalidos
(function cargarBancoEvaluacion() {
  if (!window.PhysikosRutasEvaluaciones) {
    console.error("No se encontro PhysikosRutasEvaluaciones. Verifica que rutas_evaluaciones.js cargue antes de evaluaciones_loader.js.");
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const bancoId = parametros.get("banco") || window.PhysikosRutasEvaluaciones.obtenerBancoPorDefecto();
  const banco = EVALUACIONES_INDEX[bancoId];

  if (!banco) {
    throw new Error("Banco de preguntas no registrado: " + bancoId);
  }

  window.evaluacionActual = {
    id: bancoId,
    titulo: banco.titulo
  };

  document.write(`<script src="${banco.archivo}"><\/script>`);
})();
