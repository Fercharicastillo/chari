// CODEX: modificado para centralizar bancos de preguntas cargables usando el helper de rutas de evaluaciones
if (!window.PhysikosRutasEvaluaciones) {
  console.error("No se encontro PhysikosRutasEvaluaciones. Verifica que rutas_evaluaciones.js cargue antes de evaluaciones_index.js.");
}

const EVALUACIONES_INDEX = {
  cinematica_mru: {
    titulo: "(1.1) Movimiento Rectilineo Uniforme",
    archivo: window.PhysikosRutasEvaluaciones
      ? window.PhysikosRutasEvaluaciones.construirRutaBancoCinematica("mru.js")
      : ""
  },

  cinematica_mruv: {
    titulo: "(1.2) Movimiento Rectilineo Uniformemente Variado",
    archivo: window.PhysikosRutasEvaluaciones
      ? window.PhysikosRutasEvaluaciones.construirRutaBancoCinematica("mruv.js")
      : ""
  },

  cinematica_movimiento_parabolico: {
    titulo: "(1.3) Movimiento de Proyectiles",
    archivo: window.PhysikosRutasEvaluaciones
      ? window.PhysikosRutasEvaluaciones.construirRutaBancoCinematica("movimiento_parabolico.js")
      : ""
  }
};
