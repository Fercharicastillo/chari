// CODEX: añadido para restaurar el estado inicial del menu movil antes del primer render
(function () {
  var esMenuMovil = window.matchMedia && window.matchMedia('(max-width: 430px)').matches;
  var menuMovilAbierto = sessionStorage.getItem('menuMovilAbierto') === 'true';

  if (esMenuMovil && menuMovilAbierto) {
    document.documentElement.classList.add('menu-movil-inicial-abierto');
  }
})();
