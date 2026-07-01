// CODEX: añadido para centralizar utilidades visuales y de retroalimentacion del cuestionario
(function (window, document) {
  function renderizarLatex() {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }

  function mostrarMensajeTiempoTerminado() {
    const resultadoFinal = document.getElementById("resultadoQuizFinal");
    if (resultadoFinal) {
      resultadoFinal.innerHTML = '<p class="quiz-time-ended">El tiempo ha terminado.</p>';
    }
  }

  function bloquearQuiz() {
    document.querySelectorAll("#quizForm input").forEach((input) => {
      input.disabled = true;
    });
  }

  window.PhysikosQuizFeedback = {
    renderizarLatex,
    mostrarMensajeTiempoTerminado,
    bloquearQuiz
  };

  window.renderizarLatex = renderizarLatex;
  window.mostrarMensajeTiempoTerminado = mostrarMensajeTiempoTerminado;
  window.bloquearQuiz = bloquearQuiz;
})(window, document);
