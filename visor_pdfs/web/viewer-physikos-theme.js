// CODEX: añadido para aplicar al visor PDF el estado dark mode guardado por Physikós
(function () {
  try {
    const darkModeActivo = sessionStorage.getItem("darkMode") === "true";

    if (darkModeActivo) {
      document.documentElement.setAttribute("cambio", "darkMode");
    } else {
      document.documentElement.removeAttribute("cambio");
    }
  } catch (error) {
    console.warn("No se pudo sincronizar el dark mode de Physikós en el visor PDF.", error);
  }
})();
