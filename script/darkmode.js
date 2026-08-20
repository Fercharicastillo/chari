// CODEX: añadido para aislar el comportamiento de DarkMode del menu principal
(function (document) {
  const clickDarkMode = document.getElementById("click-DarkMode");
  const btnDarkMode = document.querySelector(".darmode-btn-content");

  if (!clickDarkMode || !btnDarkMode) {
    return;
  }

  // CODEX: añadido para construir el interruptor DarkMode con cajas reales y evitar desalineaciones por pseudoelementos
  function prepararEstructuraDarkMode() {
    const sunIcon = btnDarkMode.querySelector(".btn-sun");
    const moonIcon = btnDarkMode.querySelector(".btn-moon");
    const etiquetaVacia = btnDarkMode.querySelector('label[for="click-DarkMode"]');

    if (etiquetaVacia) {
      etiquetaVacia.remove();
    }

    if (!btnDarkMode.querySelector(".darkmode-track")) {
      const track = document.createElement("span");
      const thumb = document.createElement("span");

      track.className = "darkmode-track";
      track.setAttribute("aria-hidden", "true");

      thumb.className = "darkmode-thumb";

      track.appendChild(thumb);
      btnDarkMode.insertBefore(track, moonIcon || null);
    }

    if (sunIcon) {
      sunIcon.setAttribute("aria-hidden", "true");
    }

    if (moonIcon) {
      moonIcon.setAttribute("aria-hidden", "true");
    }
  }

  // CODEX: modificado para sincronizar el estado visual del interruptor DarkMode sin retrasos artificiales
  function applyDarkMode() {
    const isDarkMode = clickDarkMode.checked;

    btnDarkMode.classList.add("transition");

    btnDarkMode.classList.toggle("btn-cambio-after-dM", isDarkMode);

    if (isDarkMode) {
      document.documentElement.setAttribute("cambio", "darkMode");
    } else {
      document.documentElement.removeAttribute("cambio");
    }

    sessionStorage.setItem("darkMode", isDarkMode);

    setTimeout(() => {
      btnDarkMode.classList.remove("transition");
    }, 10);
  }

  prepararEstructuraDarkMode();

  clickDarkMode.addEventListener("change", applyDarkMode);

  clickDarkMode.checked = sessionStorage.getItem("darkMode") === "true";
  applyDarkMode();

  window.applyDarkMode = applyDarkMode;
})(document);
