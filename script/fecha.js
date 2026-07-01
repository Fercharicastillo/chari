// CODEX: añadido para aislar la fecha de ultima actualizacion del footer
(function (document) {
  const contenedorFecha = document.querySelector(".footer-right");

  if (!contenedorFecha) {
    return;
  }

  function obtenerTextoFecha(fecha) {
    return String(fecha.getDate()).padStart(2, "0") + "-" +
      String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
      fecha.getFullYear();
  }

  function applydate(textoFecha) {
    const emdate = document.createElement("em");
    emdate.textContent = "Ultima actualización: " + textoFecha;
    contenedorFecha.appendChild(emdate);
  }

  applydate(obtenerTextoFecha(new Date()));

  window.applydate = applydate;
})(document);
