// CODEX: añadido para aislar el comportamiento de DarkMode del menu principal
(function (document) {
  const clickDarkMode = document.getElementById("click-DarkMode");
  const btnDarkMode = document.querySelector(".darmode-btn-content");

  if (!clickDarkMode || !btnDarkMode) {
    return;
  }

  function applyDarkMode() {
    const isDarkMode = clickDarkMode.checked;

    btnDarkMode.classList.add("transition");

    setTimeout(() => {
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
    }, 100);
  }

  clickDarkMode.addEventListener("click", applyDarkMode);

  clickDarkMode.checked = sessionStorage.getItem("darkMode") === "true";
  applyDarkMode();

  window.applyDarkMode = applyDarkMode;
})(document);
