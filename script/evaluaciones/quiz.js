// CODEX: añadido para centralizar estado, renderizado, navegacion y calificacion del cuestionario
(function (window, document) {
  let preguntaActual = 0;
  let respuestas = {};
  let quizFinalizado = false;
  let temporizadorQuiz = null;
  const horaInicio = new Date();
  const letras = ["A", "B", "C", "D"];

  function obtenerPreguntas() {
    // CODEX: modificado para respetar los bancos existentes que declaran const preguntas en el ambito global
    if (typeof preguntas !== "undefined" && Array.isArray(preguntas)) {
      return preguntas;
    }

    return Array.isArray(window.preguntas) ? window.preguntas : [];
  }

  function obtenerFeedback() {
    return window.PhysikosQuizFeedback || {};
  }

  function actualizarContador() {
    const respondidas = document.getElementById("respondidas");
    const totalPreguntas = document.getElementById("totalPreguntas");
    const preguntas = obtenerPreguntas();

    if (respondidas) respondidas.textContent = Object.keys(respuestas).length;
    if (totalPreguntas) totalPreguntas.textContent = preguntas.length;
  }

  function marcarRespondida(id) {
    const boton = document.querySelector(`.quiz-num[data-pregunta="${id}"]`);
    if (boton) boton.classList.add("respondida");
  }

  function actualizarBotonesLaterales() {
    const preguntas = obtenerPreguntas();
    const pregunta = preguntas[preguntaActual];
    if (!pregunta) return;

    document.querySelectorAll(".quiz-num").forEach((btn) => {
      btn.classList.remove("active");
    });

    const botonActual = document.querySelector(`.quiz-num[data-pregunta="${pregunta.id}"]`);
    if (botonActual) botonActual.classList.add("active");
  }

  function actualizarBotones() {
    const preguntas = obtenerPreguntas();
    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    if (!btnAnterior || !btnSiguiente || preguntas.length === 0) return;

    if (preguntaActual === 0) {
      btnAnterior.classList.add("oculto");
      btnAnterior.classList.remove("visible");
    } else {
      btnAnterior.classList.add("visible");
      btnAnterior.classList.remove("oculto");
    }

    if (preguntaActual === preguntas.length - 1) {
      btnSiguiente.classList.add("oculto");
      btnSiguiente.classList.remove("visible");
    } else {
      btnSiguiente.classList.add("visible");
      btnSiguiente.classList.remove("oculto");
    }
  }

  function mostrarPregunta() {
    const preguntas = obtenerPreguntas();
    const p = preguntas[preguntaActual];
    const contenedor = document.getElementById("quizForm");
    const feedback = obtenerFeedback();

    if (!p || !contenedor) return;

    contenedor.innerHTML = `
      <div class="pregunta">
        <h3>${p.id}. ${p.enunciado}</h3>

        ${p.afirmaciones.length > 0 ? `
          <ol class="afirmaciones">
            ${p.afirmaciones.map((a) => `<li>${a}</li>`).join("")}
          </ol>
        ` : ""}

        <div class="opciones_respuesta">
          ${p.opciones.map((opcion, i) => `
            <label>
              <input type="radio" name="p${p.id}" value="${letras[i]}"
                ${respuestas[p.id] === letras[i] ? "checked" : ""}>
              ${opcion}
            </label>
          `).join("")}
        </div>
      </div>
    `;

    document.querySelectorAll(`input[name="p${p.id}"]`).forEach((input) => {
      input.addEventListener("change", () => {
        respuestas[p.id] = input.value;
        marcarRespondida(p.id);
        actualizarContador();
      });
    });

    actualizarBotonesLaterales();
    if (typeof feedback.renderizarLatex === "function") {
      feedback.renderizarLatex();
    }
    actualizarBotones();
  }

  function preguntaSiguiente() {
    const preguntas = obtenerPreguntas();
    if (preguntaActual < preguntas.length - 1) {
      preguntaActual++;
      mostrarPregunta();
    }
  }

  function preguntaAnterior() {
    if (preguntaActual > 0) {
      preguntaActual--;
      mostrarPregunta();
    }
  }

  function irAPregunta(numero) {
    const preguntas = obtenerPreguntas();
    const indice = numero - 1;

    if (indice >= 0 && indice < preguntas.length) {
      preguntaActual = indice;
      mostrarPregunta();
    }
  }

  function renderizarNavegacionPreguntas() {
    const contenedorNavegacion = document.querySelector(".navegar_respuestas");
    const preguntas = obtenerPreguntas();

    if (!contenedorNavegacion || preguntas.length === 0) return;

    contenedorNavegacion.innerHTML = preguntas.map((pregunta, index) => `
      <button class="quiz-num${index === 0 ? " active" : ""}" data-pregunta="${pregunta.id}">${pregunta.id}</button>
    `).join("");
  }

  function conectarNavegacionPreguntas(opciones) {
    document.querySelectorAll(".quiz-num").forEach((boton) => {
      boton.addEventListener("click", () => {
        irAPregunta(Number(boton.dataset.pregunta));

        if (opciones && typeof opciones.alSeleccionar === "function") {
          opciones.alSeleccionar();
        }
      });
    });
  }

  function finalizarInterfazLateral() {
    if (temporizadorQuiz) {
      temporizadorQuiz.detener();
    }

    const timerText = document.querySelector(".quiz-timer");
    if (timerText) {
      timerText.innerHTML = "Tiempo detenido";
    }

    const btnFinalizarIntento = document.querySelector(".finalizar_intento");
    if (btnFinalizarIntento) {
      btnFinalizarIntento.style.display = "none";
    }
  }

  function calificarQuiz() {
    const preguntas = obtenerPreguntas();
    const contenedor = document.getElementById("quizForm");
    const feedback = obtenerFeedback();
    let puntaje = 0;

    if (quizFinalizado || !contenedor || preguntas.length === 0) return;
    quizFinalizado = true;
    contenedor.innerHTML = "";

    preguntas.forEach((p) => {
      const respuestaUsuario = respuestas[p.id];
      const esCorrecta = respuestaUsuario === p.correcta;

      if (esCorrecta) puntaje++;

      contenedor.innerHTML += `
        <div class="pregunta resultado-pregunta">
          <h3>Pregunta ${p.id}. ${p.enunciado}</h3>

          ${p.afirmaciones.length > 0 ? `
            <ol class="afirmaciones">
              ${p.afirmaciones.map((a) => `<li>${a}</li>`).join("")}
            </ol>
          ` : ""}

          <div class="opciones_respuesta">
            ${p.opciones.map((opcion, i) => {
              const letra = letras[i];
              const marcada = respuestaUsuario === letra;
              const correcta = p.correcta === letra;

              return `
                <label class="
                  ${correcta ? "opcion-correcta" : ""}
                  ${marcada && !correcta ? "opcion-incorrecta" : ""}
                ">
                  <input type="radio" disabled ${marcada ? "checked" : ""}>
                  ${letra}) ${opcion}
                </label>
              `;
            }).join("")}
          </div>

          <div class="retroalimentacion">
            <strong>${esCorrecta ? "Respuesta correcta." : "Respuesta incorrecta."}</strong><br>
            La respuesta correcta es: <strong>${p.correcta}</strong><br>
            ${p.retroalimentacion || ""}
          </div>
        </div>
      `;
    });

    const horaFin = new Date();
    const opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    const fechaComenzado = horaInicio.toLocaleDateString("es-ES", opcionesFecha);
    const fechaCompletado = horaFin.toLocaleDateString("es-ES", opcionesFecha);
    const diferenciaMs = horaFin - horaInicio;
    const totalSegundos = Math.floor(diferenciaMs / 1000);
    const minutosDuracion = Math.floor(totalSegundos / 60);
    const segundosDuracion = totalSegundos % 60;
    const textoDuracion = `${minutosDuracion} minutos ${segundosDuracion} segundos`;
    const porcentaje = ((puntaje / preguntas.length) * 100).toFixed(0);

    document.getElementById("resultadoQuiz").innerHTML = `
      <table class="tabla-resumen-intento">
        <tr>
          <td><strong>Estado</strong></td>
          <td>Finalizado</td>
        </tr>
        <tr>
          <td><strong>Comenzado</strong></td>
          <td>${fechaComenzado}</td>
        </tr>
        <tr>
          <td><strong>Completado</strong></td>
          <td>${fechaCompletado}</td>
        </tr>
          <td><strong>Duración</strong></td>
          <td>${textoDuracion}</td>
        </tr>
        <tr>
          <td><strong>Puntos</strong></td>
          <td>${puntaje},00/${preguntas.length},00</td>
        </tr>
        <tr>
          <td><strong>Calificación</strong></td>
          <td><strong>${puntaje},00</strong> de 10,00 (${porcentaje}%)</td>
        </tr>
      </table>
    `;

    document.getElementById("resultadoQuizFinal").innerHTML = `
      <div style="text-align: center">
        <a href="../repositorio_planes/rp_mecanica_newtoniana.html" class="btn-finalizar-revision">Finalizar Revisión</a>
      </div>
    `;

    const barraBotones = document.querySelector(".botones_preguntas");
    if (barraBotones) barraBotones.style.display = "none";

    finalizarInterfazLateral();

    if (typeof feedback.renderizarLatex === "function") {
      feedback.renderizarLatex();
    }
  }

  function iniciarTemporizador() {
    if (!window.PhysikosQuizTimer) return;

    temporizadorQuiz = window.PhysikosQuizTimer.crearTemporizadorQuiz({
      duracionSegundos: 20 * 60,
      timer: document.getElementById("timer"),
      alTerminar: () => {
        calificarQuiz();
        const feedback = obtenerFeedback();
        if (typeof feedback.mostrarMensajeTiempoTerminado === "function") {
          feedback.mostrarMensajeTiempoTerminado();
        }
      }
    });
  }

  function iniciarQuiz() {
    renderizarNavegacionPreguntas();
    actualizarContador();
    iniciarTemporizador();
    mostrarPregunta();
    actualizarBotones();
  }

  window.PhysikosQuiz = {
    iniciar: iniciarQuiz,
    calificarQuiz,
    preguntaSiguiente,
    preguntaAnterior,
    irAPregunta,
    renderizarNavegacionPreguntas,
    conectarNavegacionPreguntas,
    finalizarInterfazLateral
  };

  window.mostrarPregunta = mostrarPregunta;
  window.preguntaSiguiente = preguntaSiguiente;
  window.preguntaAnterior = preguntaAnterior;
  window.irAPregunta = irAPregunta;
  window.calificarQuiz = calificarQuiz;
  window.actualizarContador = actualizarContador;
  window.actualizarBotones = actualizarBotones;
  window.finalizarInterfazLateral = finalizarInterfazLateral;
})(window, document);
