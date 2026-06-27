let preguntaActual = 0;
//Guarda las respuestas
let respuestas = {};
// Guardamos el momento exacto en el que el estudiante inicia el cuestionario
const horaInicio = new Date();

/*Muestra las preguntas*/
function mostrarPregunta() {
  const p = preguntas[preguntaActual];
  const contenedor = document.getElementById("quizForm");

  const letras = ["A", "B", "C", "D"];

  contenedor.innerHTML = `
    <div class="pregunta">
      <h3>${p.id}. ${p.enunciado}</h3>

      ${p.afirmaciones.length > 0 ? `
        <ol class="afirmaciones">
          ${p.afirmaciones.map(a => `<li>${a}</li>`).join("")}
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

  document.querySelectorAll(`input[name="p${p.id}"]`).forEach(input => {
    input.addEventListener("change", () => {
      respuestas[p.id] = input.value;
      marcarRespondida(p.id);
      actualizarContador();
    });
  });

  actualizarBotonesLaterales();
  renderizarLatex();
  actualizarBotones();
}

let tiempo = 20 * 60;
const timer = document.getElementById("timer");

let intervalo = setInterval(() => {
  // ... Tu código actual del temporizador ...
  const minutos = Math.floor(tiempo / 60);
  const segundos = tiempo % 60;

  timer.textContent =
    String(minutos).padStart(2, "0") + ":" +
    String(segundos).padStart(2, "0");

  if (tiempo <= 0) {
    clearInterval(intervalo);
    calificarQuiz();
    mostrarMensajeTiempoTerminado();
  }

  tiempo--;
}, 1000);

/*Avenza de Pregunta*/
function preguntaSiguiente() {
  if (preguntaActual < preguntas.length - 1) {
    preguntaActual++;
    mostrarPregunta();
  }
}
/*Retrocede de Pregunta*/
function preguntaAnterior() {
  if (preguntaActual > 0) {
    preguntaActual--;
    mostrarPregunta();
  }
}
/*salta desde el panel lateral.*/
function irAPregunta(numero) {
  preguntaActual = numero - 1;
  mostrarPregunta();
}

function marcarRespondida(id) {
  const boton = document.querySelector(`.quiz-num[data-pregunta="${id}"]`);
  if (boton) boton.classList.add("respondida");
}

function actualizarBotonesLaterales() {
  document.querySelectorAll(".quiz-num").forEach(btn => {
    btn.classList.remove("active");
  });

  const botonActual = document.querySelector(`.quiz-num[data-pregunta="${preguntas[preguntaActual].id}"]`);
  if (botonActual) botonActual.classList.add("active");
}

function actualizarContador() {
  document.getElementById("respondidas").textContent = Object.keys(respuestas).length;
  document.getElementById("totalPreguntas").textContent = preguntas.length;
}
/*calcula puntaje y muestra retroalimentación. */
function calificarQuiz() {
  let puntaje = 0;
  const contenedor = document.getElementById("quizForm");
  const letras = ["A", "B", "C", "D"];

  contenedor.innerHTML = "";

  preguntas.forEach(p => {
    const respuestaUsuario = respuestas[p.id];
    const esCorrecta = respuestaUsuario === p.correcta;

    if (esCorrecta) puntaje++;

    contenedor.innerHTML += `
      <div class="pregunta resultado-pregunta">
        <h3>Pregunta ${p.id}. ${p.enunciado}</h3>

        ${p.afirmaciones.length > 0 ? `
          <ol class="afirmaciones">
            ${p.afirmaciones.map(a => `<li>${a}</li>`).join("")}
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

  // Opciones para formatear la fecha en español de forma elegante
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const fechaComenzado = horaInicio.toLocaleDateString('es-ES', opcionesFecha);
  const fechaCompletado = horaFin.toLocaleDateString('es-ES', opcionesFecha);

  // Calcular la diferencia de tiempo (Duración)
  const diferenciaMs = horaFin - horaInicio;
  const totalSegundos = Math.floor(diferenciaMs / 1000);
  const minutosDuracion = Math.floor(totalSegundos / 60);
  const segundosDuracion = totalSegundos % 60;
  const textoDuracion = `${minutosDuracion} minutos ${segundosDuracion} segundos`;

  // Calcular el porcentaje alcanzado
  const porcentaje = ((puntaje / preguntas.length) * 100).toFixed(0);

  // 🌟 INYECTAMOS LA TABLA RESUMEN Y EL BOTÓN DE FINALIZAR REVISIÓN
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

  // Ocultamos la barra inferior de navegación
  const barraBotones = document.querySelector(".botones_preguntas");
  if (barraBotones) barraBotones.style.display = "none";

  // Detenemos el reloj y limpiamos el panel derecho
  finalizarInterfazLateral();

  renderizarLatex();
}

// CODEX: añadido para reemplazar la confirmacion nativa por un modal interno de Physikos
const quizConfirmModal = document.getElementById("quizConfirmModal");
const quizConfirmCancel = document.querySelector(".quiz-confirm-cancel");
const quizConfirmSubmit = document.querySelector(".quiz-confirm-submit");

function abrirModalConfirmacionQuiz() {
  if (!quizConfirmModal) return;

  quizConfirmModal.hidden = false;
  quizConfirmModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("quiz-confirm-open");
}

function cerrarModalConfirmacionQuiz() {
  if (!quizConfirmModal) return;

  quizConfirmModal.hidden = true;
  quizConfirmModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("quiz-confirm-open");
}
/*abre el ventana interno. */
function confirmarCalificacion() {
  abrirModalConfirmacionQuiz();
}
/*ejecuta calificarQuiz() y bloquearQuiz() */
function finalizarIntentoConfirmado() {
  cerrarModalConfirmacionQuiz();
  calificarQuiz();
  bloquearQuiz();
}

function mostrarMensajeTiempoTerminado() {
  const resultadoFinal = document.getElementById("resultadoQuizFinal");
  if (resultadoFinal) {
    resultadoFinal.innerHTML = `<p class="quiz-time-ended">El tiempo ha terminado.</p>`;
  }
}


// CODEX: añadido para manejar las acciones del modal de finalización
if (quizConfirmCancel) {
  quizConfirmCancel.addEventListener("click", cerrarModalConfirmacionQuiz);
}

if (quizConfirmSubmit) {
  quizConfirmSubmit.addEventListener("click", finalizarIntentoConfirmado);
}

if (quizConfirmModal) {
  quizConfirmModal.addEventListener("click", (event) => {
    if (event.target === quizConfirmModal) {
      cerrarModalConfirmacionQuiz();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quizConfirmModal && !quizConfirmModal.hidden) {
    cerrarModalConfirmacionQuiz();
  }
});

function bloquearQuiz() {
  document.querySelectorAll("#quizForm input").forEach(input => {
    input.disabled = true;
  });
}

function renderizarLatex() {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ]
    });
  }
}

// CODEX: anadido para construir la navegacion segun el banco de preguntas cargado
function renderizarNavegacionPreguntas() {
  const contenedorNavegacion = document.querySelector(".navegar_respuestas");
  if (!contenedorNavegacion || typeof preguntas === "undefined" || !Array.isArray(preguntas)) return;

  contenedorNavegacion.innerHTML = preguntas.map((pregunta, index) => `
    <button class="quiz-num${index === 0 ? " active" : ""}" data-pregunta="${pregunta.id}">${pregunta.id}</button>
  `).join("");
}

function actualizarBotones() {
    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // Control del botón Anterior
    if (preguntaActual === 0) {
        btnAnterior.classList.add("oculto");
        btnAnterior.classList.remove("visible");
    } else {
        btnAnterior.classList.add("visible");
        btnAnterior.classList.remove("oculto");
    }

    // Control del botón Siguiente
    if (preguntaActual === preguntas.length - 1) {
        btnSiguiente.classList.add("oculto");
        btnSiguiente.classList.remove("visible");
    } else {
        btnSiguiente.classList.add("visible");
        btnSiguiente.classList.remove("oculto");
    }
}

// CODEX: modificado para conectar la navegacion movil superior y flotante al mismo panel lateral
const quizMobileNavBtns = document.querySelectorAll(".quiz-mobile-nav-btn, .quiz-floating-nav-btn");
const quizPanel = document.querySelector(".evaluaciones-temporizador");
const quizPanelCloseBtn = document.querySelector(".quiz-panel-close");
const quizPanelOverlay = document.querySelector(".quiz-nav-overlay");
const quizMobileMedia = window.matchMedia("(max-width: 768px)");

function actualizarEstadoPanelQuiz(abierto) {
  if (!quizPanel || !quizPanelOverlay) return;

  quizPanel.classList.toggle("is-open", abierto);
  quizPanelOverlay.classList.toggle("is-open", abierto);
  quizPanelOverlay.hidden = !abierto;
  document.body.classList.toggle("quiz-panel-open", abierto);

  quizMobileNavBtns.forEach(boton => {
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  quizPanel.setAttribute("aria-hidden", quizMobileMedia.matches ? String(!abierto) : "false");
}

function abrirPanelQuizMovil() {
  if (!quizMobileMedia.matches) return;
  actualizarEstadoPanelQuiz(true);
}

function cerrarPanelQuizMovil() {
  actualizarEstadoPanelQuiz(false);
}

function sincronizarPanelQuizResponsive() {
  if (!quizMobileMedia.matches) {
    actualizarEstadoPanelQuiz(false);
    if (quizPanel) quizPanel.setAttribute("aria-hidden", "false");
  } else if (quizPanel && !quizPanel.classList.contains("is-open")) {
    quizPanel.setAttribute("aria-hidden", "true");
  }
}

quizMobileNavBtns.forEach(boton => {
  boton.addEventListener("click", abrirPanelQuizMovil);
});

if (quizPanelCloseBtn) {
  quizPanelCloseBtn.addEventListener("click", cerrarPanelQuizMovil);
}

if (quizPanelOverlay) {
  quizPanelOverlay.addEventListener("click", cerrarPanelQuizMovil);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    cerrarPanelQuizMovil();
  }
});

if (typeof quizMobileMedia.addEventListener === "function") {
  quizMobileMedia.addEventListener("change", sincronizarPanelQuizResponsive);
} else if (typeof quizMobileMedia.addListener === "function") {
  quizMobileMedia.addListener(sincronizarPanelQuizResponsive);
}

sincronizarPanelQuizResponsive();

renderizarNavegacionPreguntas();

document.querySelectorAll(".quiz-num").forEach(boton => {
  boton.addEventListener("click", () => {
    irAPregunta(Number(boton.dataset.pregunta));
    if (quizMobileMedia.matches) {
      cerrarPanelQuizMovil();
    }
  });
});

function finalizarInterfazLateral() {
  // 1. Detener el reloj permanentemente
  clearInterval(intervalo);
  
  // 2. Ocultar el texto del temporizador (opcional, o puedes dejarlo congelado)
  const timerText = document.querySelector(".quiz-timer");
  if (timerText) {
      timerText.innerHTML = "Tiempo detenido"; 
  }

  // 3. Ocultar el botón "Finalizar intento" de la esquina inferior derecha
  const btnFinalizarIntento = document.querySelector(".finalizar_intento");
  if (btnFinalizarIntento) {
      btnFinalizarIntento.style.display = "none";
  }
}

actualizarContador();
mostrarPregunta();
actualizarBotones();