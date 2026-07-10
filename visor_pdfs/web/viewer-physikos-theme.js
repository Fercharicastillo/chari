// CODEX: modificado para sincronizar en vivo el dark mode de Physikos dentro del visor PDF
(function () {
  let ultimoEstadoDarkMode = null;

  function leerDarkModePhysikos() {
    try {
      return sessionStorage.getItem("darkMode") === "true";
    } catch (error) {
      console.warn("No se pudo leer el dark mode de Physikos en el visor PDF.", error);
      return false;
    }
  }

  function aplicarDarkModePhysikos() {
    const darkModeActivo = leerDarkModePhysikos();

    if (darkModeActivo === ultimoEstadoDarkMode) {
      return;
    }

    ultimoEstadoDarkMode = darkModeActivo;

    if (darkModeActivo) {
      document.documentElement.setAttribute("cambio", "darkMode");
    } else {
      document.documentElement.removeAttribute("cambio");
    }
  }

  aplicarDarkModePhysikos();

  window.addEventListener("storage", aplicarDarkModePhysikos);
  window.addEventListener("focus", aplicarDarkModePhysikos);
  window.addEventListener("pageshow", aplicarDarkModePhysikos);
  document.addEventListener("visibilitychange", aplicarDarkModePhysikos);
  window.setInterval(aplicarDarkModePhysikos, 500);
})();
