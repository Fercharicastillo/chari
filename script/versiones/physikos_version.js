(function () {
  const versiones = [
    {
      numero: "0.2.0",
      fecha: "2026-08-24",
      titulo: "Nueva plataforma de simuladores interactivos",
      cambios: [
        "Incorporación del simulador de MRUV en pista neumática con sensores y Timer 4-4.",
        "Incorporación del laboratorio virtual de caída libre.",
        "Nueva arquitectura React compartida para el desarrollo de futuros simuladores.",
        "Integración de los simuladores React dentro de las páginas estáticas de Physikós.",
        "Incorporación de clases y guías de laboratorio asociadas a cada simulador.",
        "Mejoras responsive para escritorio, menú lateral y dispositivos móviles.",
        "El menú lateral inicia cerrado en las páginas de simuladores.",
        "Actualización del catálogo y las portadas de simuladores.",
      ],
    },
    {
      numero: "0.1.1",
      fecha: "2026-08-02",
      titulo: "Mejoras y correcciones en el sistema de evaluaciones",
      cambios: [
        "Función de disponibilidad de cards.",
        "Ajuste de colores del modo oscuro para el bloque main_s2_evaluaciones del sistema de evaluaciones.",
        "Ubicación del botón de finalizar intento a la derecha de 'Anterior' en dispositivos móviles.",
        "Ajuste del loader page para que ocupe toda la pantalla y no solo el espacio restante del menú principal.",
        "Corrección del botón (quiz-floating-nav-btn) para abrir el panel flotante de preguntas en dispositivos móviles.",
      ],
    },
    {
      numero: "0.0.9",
      fecha: "2026-08-01",
      titulo: "Creacion de controlador de versiones",
      cambios: [
        "Rediseño del bloque de introducción en la pagina index.",
        "Creacion de la logica para controlar las versiones de Physikos",
        "Incorporación de las versiones en el footer",
      ],
    },
    {
      numero: "0.0.8",
      fecha: "2026-08-01",
      titulo: "Actualización visual del inicio",
      cambios: [
        "Rediseño del encabezado principal del index.",
        "Nueva franja de resumen para secciones principales.",
        "Actualización de textos introductorios de Physikós.",
        "Renombrado de bloques visuales migrados desde autores en simuladores, documentos y clases.",
      ],
    },
    {
      numero: "0.0.7",
      fecha: "2026-07-31",
      titulo: "Vistas del repositorio de planes",
      cambios: [
        "Implementación de vista de cuadrícula y lista para planes de clase.",
        "Buscador por capítulos y clases.",
        "Acciones para video, evaluación, plan de clase y simulador.",
      ],
    },
    {
      numero: "0.0.6",
      fecha: "2026-07-30",
      titulo: "Repositorio de documentos",
      cambios: [
        "Rediseño visual de páginas del repositorio de documentos.",
        "Contadores por categoría en la portada del repositorio.",
        "Mejoras de iconos, tarjetas y modo oscuro.",
      ],
    },
  ];

  const versionActual = versiones[0];

  function crearTextoVersion(version) {
    return `${version.numero}`;
  }

  function renderizarVersionActual() {
    document
      .querySelectorAll("[data-physikos-version]")
      .forEach(function (elemento) {
        elemento.textContent = crearTextoVersion(versionActual);
      });
  }

  function renderizarHistorial() {
    const contenedor = document.querySelector(
      "[data-physikos-version-history]",
    );
    if (!contenedor) {
      return;
    }

    contenedor.innerHTML = "";

    versiones.forEach(function (version) {
      const articulo = document.createElement("article");
      articulo.className = "version-card";

      const titulo = document.createElement("h2");
      titulo.textContent = `Versión ${version.numero}`;

      const meta = document.createElement("p");
      meta.className = "version-card__meta";
      meta.textContent = `${version.fecha} | ${version.titulo}`;

      const lista = document.createElement("ul");
      version.cambios.forEach(function (cambio) {
        const item = document.createElement("li");
        item.textContent = cambio;
        lista.appendChild(item);
      });

      articulo.append(titulo, meta, lista);
      contenedor.appendChild(articulo);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderizarVersionActual();
    renderizarHistorial();
  });

  window.PhysikosVersiones = {
    actual: versionActual,
    historial: versiones,
  };
})();
