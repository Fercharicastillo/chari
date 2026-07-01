// CODEX: modificado para dejar este archivo como inicializador de interfaz del cuestionario
(function (window, document) {
  const quizConfirmModal = document.getElementById("quizConfirmModal");
  const quizConfirmCancel = document.querySelector(".quiz-confirm-cancel");
  const quizConfirmSubmit = document.querySelector(".quiz-confirm-submit");
  const quizMobileNavBtns = document.querySelectorAll(".quiz-mobile-nav-btn, .quiz-floating-nav-btn");
  const quizPanel = document.querySelector(".evaluaciones-temporizador");
  const quizPanelCloseBtn = document.querySelector(".quiz-panel-close");
  const quizMobileMedia = window.matchMedia("(max-width: 768px)");

  // CODEX: modificado para manejar solo el modal interno de finalizacion del intento
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

  function confirmarCalificacion() {
    abrirModalConfirmacionQuiz();
  }

  function finalizarIntentoConfirmado() {
    const feedback = window.PhysikosQuizFeedback;

    cerrarModalConfirmacionQuiz();

    if (window.PhysikosQuiz) {
      window.PhysikosQuiz.calificarQuiz();
    }

    if (feedback && typeof feedback.bloquearQuiz === "function") {
      feedback.bloquearQuiz();
    }
  }

  // CODEX: modificado para manejar solo el panel movil/lateral de navegacion del cuestionario
  function actualizarEstadoPanelQuiz(abierto) {
    if (!quizPanel) return;

    quizPanel.classList.toggle("is-open", abierto);
    document.body.classList.toggle("quiz-panel-open", abierto);

    if (window.PhysikosOverlay && quizMobileMedia.matches) {
      if (abierto) {
        window.PhysikosOverlay.mostrar({
          onClick: cerrarPanelQuizMovil
        });
      } else {
        window.PhysikosOverlay.ocultar();
      }
    }

    quizMobileNavBtns.forEach((boton) => {
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

  // CODEX: añadido para conectar eventos de modal, panel movil e inicializacion del quiz
  function inicializarInterfazQuiz() {
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

    quizMobileNavBtns.forEach((boton) => {
      boton.addEventListener("click", abrirPanelQuizMovil);
    });

    if (quizPanelCloseBtn) {
      quizPanelCloseBtn.addEventListener("click", cerrarPanelQuizMovil);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        cerrarModalConfirmacionQuiz();
        cerrarPanelQuizMovil();
      }
    });

    if (typeof quizMobileMedia.addEventListener === "function") {
      quizMobileMedia.addEventListener("change", sincronizarPanelQuizResponsive);
    } else if (typeof quizMobileMedia.addListener === "function") {
      quizMobileMedia.addListener(sincronizarPanelQuizResponsive);
    }

    if (window.PhysikosQuiz) {
      window.PhysikosQuiz.iniciar();
      window.PhysikosQuiz.conectarNavegacionPreguntas({
        alSeleccionar: () => {
          if (quizMobileMedia.matches) {
            cerrarPanelQuizMovil();
          }
        }
      });
    }

    sincronizarPanelQuizResponsive();
  }

  window.confirmarCalificacion = confirmarCalificacion;
  window.finalizarIntentoConfirmado = finalizarIntentoConfirmado;
  window.abrirPanelQuizMovil = abrirPanelQuizMovil;
  window.cerrarPanelQuizMovil = cerrarPanelQuizMovil;

  inicializarInterfazQuiz();
})(window, document);
