// CODEX: modificado para abrir curriculums PDF de autores con el visor PDF.js de Physikos
(function (window, document) {
    const RUTA_TEMPLATE_AUTORES = "templatepdfs_autores.html";
    const RUTA_BASE_AUTORES_PDF = "pdfs_autores/";

    function obtenerDatosAutoresPdf() {
        if (!Array.isArray(window.PhysikosAutoresPdf)) {
            console.error("No se encontro PhysikosAutoresPdf. Verifica que datosautores.js cargue antes de autorespdf.js.");
            return [];
        }

        return window.PhysikosAutoresPdf;
    }

    function obtenerAutorPorId(autorId) {
        return obtenerDatosAutoresPdf().find(function (autor) {
            return autor.id === autorId;
        });
    }

    function construirRutaCurriculumAutor(archivo) {
        if (!archivo) return "";

        if (!window.PhysikosRutasPdf || typeof window.PhysikosRutasPdf.construirUrlViewerPdf !== "function") {
            console.error("No se encontro PhysikosRutasPdf. Verifica que rutas_pdf.js cargue antes de autorespdf.js.");
            return "";
        }

        return window.PhysikosRutasPdf.construirUrlViewerPdf(RUTA_BASE_AUTORES_PDF + archivo);
    }

    function abrirCurriculumAutor(event) {
        event.preventDefault();

        const boton = event.currentTarget;
        const autorId = boton.dataset.autorPdf;
        const autor = obtenerAutorPorId(autorId);

        if (!autor) {
            console.error("No se encontro un curriculum PDF registrado para el autor:", autorId);
            return;
        }

        const pdfSrc = construirRutaCurriculumAutor(autor.archivo);

        if (!pdfSrc) {
            console.error("No se pudo construir la ruta del curriculum PDF para:", autor.nombre);
            return;
        }

        sessionStorage.setItem("pdfSrc", pdfSrc);
        sessionStorage.setItem("pdfTitulo", `Currículum de ${autor.nombre}`);
        sessionStorage.setItem("pdfTipo", "Currículum");
        sessionStorage.setItem("autorPdfActivo", autor.id);
        window.location.href = boton.getAttribute("href") || RUTA_TEMPLATE_AUTORES;
    }

    function inicializarBotonesCurriculumAutores() {
        document.querySelectorAll("[data-autor-pdf]").forEach(function (boton) {
            boton.addEventListener("click", abrirCurriculumAutor);
        });
    }

    document.addEventListener("DOMContentLoaded", inicializarBotonesCurriculumAutores);
})(window, document);
