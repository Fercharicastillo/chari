// CODEX: añadido para aislar el temporizador del cuestionario y reutilizar su control
(function (window, document) {
  function crearTemporizadorQuiz(opciones) {
    const duracionSegundos = opciones.duracionSegundos;
    const timer = opciones.timer;
    const alTerminar = opciones.alTerminar;
    let tiempo = duracionSegundos;
    let intervalo = null;

    function pintarTiempo() {
      if (!timer) return;

      const minutos = Math.floor(tiempo / 60);
      const segundos = tiempo % 60;

      timer.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");
    }

    function iniciar() {
      intervalo = setInterval(() => {
        pintarTiempo();

        if (tiempo <= 0) {
          detener();
          if (typeof alTerminar === "function") {
            alTerminar();
          }
          return;
        }

        tiempo--;
      }, 1000);
    }

    function detener() {
      if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
      }
    }

    iniciar();

    return {
      detener
    };
  }

  window.PhysikosQuizTimer = {
    crearTemporizadorQuiz
  };
})(window, document);
