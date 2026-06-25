const preguntas = [
  {
    id: 1,
    enunciado: "Relaciona el proceso con la propiedad aplicada. Luego, selecciona la respuesta correcta.",
    afirmaciones: [
      "a) $-0.17 + 0.17 = 0$",
      "b) $-8\\sqrt[5]{3} + 2e = 2e - 8\\sqrt[5]{3}$",
      "c) $\\frac{3}{4} + \\sqrt{2} - \\pi = \\frac{3}{4} + (\\sqrt{2} - \\pi)$",
      "d) $-7\\sqrt{89} + 6\\sqrt{89} = -\\sqrt{89}$",
      "<strong>Propiedad Aplicada:</strong> 1) Conmutativa, 2) Clausurativa, 3) Cancelativa, 4) Asociativa"
    ],
    opciones: [
      "1c, 2a, 3d, 4b",
      "1b, 2d, 3a, 4c",
      "1a, 2b, 3c, 4d",
      "1d, 2c, 3b, 4a"
    ],
    correcta: "B",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 2,
    enunciado: "Relaciona cada operación con su resultado.",
    afirmaciones: [
      "a) $(-2)(-3)(-4)$",
      "b) $(-36) \\div (-9)$",
      "c) $(-5) + (-8)$",
      "d) $(-12) - (-15)$",
      "<strong>Resultado:</strong> 1) $-13$, 2) $4$, 3) $-24$, 4) $3$"
    ],
    opciones: [
      "1a, 2b, 3c, 4d",
      "1c, 2b, 3a, 4d",
      "1d, 2c, 3b, 4a",
      "1b, 2a, 3d, 4c"
    ],
    correcta: "B",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 3,
    enunciado: "Las soluciones de la función cuadrática $y = 3x^2 + 3x - 6$ son:",
    afirmaciones: [],
    opciones: [
      "$x_1 = 1, x_2 = -2$",
      "$x_1 = -1, x_2 = 2$",
      "$x_1 = 3, x_2 = -6$",
      "$x_1 = 0, x_2 = 1$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 4,
    enunciado: "Al aproximar el número irracional $2\\pi$ a las décimas, se obtiene:",
    afirmaciones: [],
    opciones: [
      "$6.2$",
      "$6.3$",
      "$6.28$",
      "$6.4$"
    ],
    correcta: "B",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 5,
    enunciado: "Escoja la respuesta que corresponde a la siguiente expresión: La mitad de la suma de dos cuadrados.",
    afirmaciones: [],
    opciones: [
      "$\\frac{x^2 + y^2}{2}$",
      "$(\\frac{x+y}{2})^2$",
      "$\\frac{(x+y)^2}{2}$",
      "$x^2 + \\frac{y^2}{2}$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 6,
    enunciado: "Selecciona el valor de verdad correcto para la proposición: Si todo número entero es racional, entonces algunos números reales son irracionales.",
    afirmaciones: [],
    opciones: [
      "Verdadero (V)",
      "Falso (F)"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 7,
    enunciado: "El vértice de la parábola $y = 2x^2 - 8x + 6$ es el punto:",
    afirmaciones: [],
    opciones: [
      "$(2, -2)$",
      "$(-2, 2)$",
      "$(4, 6)$",
      "$(0, 6)$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 8,
    enunciado: "Calcular el área del polígono regular de la figura. Lado = $22\\text{ cm}$, apotema = $22.85\\text{ cm}$, pentágono.",
    afirmaciones: [],
    opciones: [
      "$1256.75\\text{ cm}^2$",
      "$2513.5\\text{ cm}^2$",
      "$502.7\\text{ cm}^2$",
      "$1100\\text{ cm}^2$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 9,
    enunciado: "El área de un rectángulo es $147\\text{ cm}^2$. Si un lado mide el triple que el otro, ¿cuáles son las medidas de los lados?",
    afirmaciones: [],
    opciones: [
      "$7\\text{ cm}$ y $21\\text{ cm}$",
      "$6\\text{ cm}$ y $18\\text{ cm}$",
      "$5\\text{ cm}$ y $15\\text{ cm}$",
      "$9\\text{ cm}$ y $27\\text{ cm}$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  },
  {
    id: 10,
    enunciado: "Analicen los siguientes datos y escojan los números que completan correctamente la tabla de frecuencias absolutas y acumuladas.",
    afirmaciones: [],
    opciones: [
      "$f_i = 5, F_i = 12$",
      "$f_i = 4, F_i = 15$",
      "$f_i = 6, F_i = 18$",
      "$f_i = 3, F_i = 10$"
    ],
    correcta: "A",
    retroalimentacion: "La respuesta correcta es B, porque la propiedad conmutativa."
  }
];

let preguntaActual = 0;
let respuestas = {};
// Guardamos el momento exacto en el que el estudiante inicia el cuestionario
const horaInicio = new Date();

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
    alert("El tiempo ha terminado.");
  }

  tiempo--;
}, 1000);


function preguntaSiguiente() {
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
      <a href="rp_mecanica_newtoniana.html" class="btn-finalizar-revision">Finalizar Revisión</a>
    </div>
  `;

  // Ocultamos la barra inferior de navegación
  const barraBotones = document.querySelector(".botones_preguntas");
  if (barraBotones) barraBotones.style.display = "none";

  // Detenemos el reloj y limpiamos el panel derecho
  finalizarInterfazLateral();

  renderizarLatex();
}

function confirmarCalificacion() {
  const confirmar = confirm("¿Está seguro de finalizar el intento?");
  if (confirmar) {
    calificarQuiz();
    bloquearQuiz();
  }
}

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

document.querySelectorAll(".quiz-num").forEach(boton => {
  boton.addEventListener("click", () => {
    irAPregunta(Number(boton.dataset.pregunta));
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