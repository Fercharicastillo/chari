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
    correcta: "B"
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
    correcta: "B"
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
    correcta: "A"
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
    correcta: "B"
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
    correcta: "A"
  },
  {
    id: 6,
    enunciado: "Selecciona el valor de verdad correcto para la proposición: Si todo número entero es racional, entonces algunos números reales son irracionales.",
    afirmaciones: [],
    opciones: [
      "Verdadero (V)",
      "Falso (F)"
    ],
    correcta: "A"
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
    correcta: "A"
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
    correcta: "A"
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
    correcta: "A"
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
    correcta: "A"
  }
];

let preguntaActual = 0;
let respuestas = {};

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
}

let tiempo = 20 * 60;
const timer = document.getElementById("timer");

const intervalo = setInterval(() => {
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

  preguntas.forEach(p => {
    if (respuestas[p.id] === p.correcta) {
      puntaje++;
    }
  });

  document.getElementById("resultadoQuiz").innerHTML =
    `Puntaje: ${puntaje}/${preguntas.length}`;
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

document.querySelectorAll(".quiz-num").forEach(boton => {
  boton.addEventListener("click", () => {
    irAPregunta(Number(boton.dataset.pregunta));
  });
});

actualizarContador();
mostrarPregunta();