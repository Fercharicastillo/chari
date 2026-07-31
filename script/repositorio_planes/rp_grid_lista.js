(function () {
  const gridSection = document.querySelector(".main_s2_sim");
  const searchInput = document.getElementById("lesson-plans-search-input");
  const counter = document.getElementById("lesson-plans-counter");
  const gridButton = document.getElementById("lesson-plans-view-grid");
  const listButton = document.getElementById("lesson-plans-view-list");
  const sequenceButton = document.querySelector(".lesson-plans-repository__sequence");

  let activeView = "grid";
  let listSection = null;

  function getChapters() {
    return Array.isArray(window.recursosCapitulos) ? window.recursosCapitulos : [];
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getResourceDate(resource, chapter) {
    return (
      resource.modificacion ||
      resource.actualizado ||
      resource.fecha ||
      chapter.modificacion ||
      chapter.actualizado ||
      chapter.fecha ||
      "Sin fecha"
    );
  }

  function setButtonState(view) {
    [gridButton, listButton].forEach((button) => {
      if (!button) return;

      const isActive = button.dataset.view === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function createActionButton(label, className, callback, enabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lesson-plans-list__action ${className}`;
    button.textContent = label;
    button.disabled = !enabled;
    button.title = enabled ? label : `${label} no disponible`;

    if (enabled) {
      button.addEventListener("click", callback);
    }

    return button;
  }

  function openEvaluation(evaluationId) {
    if (!evaluationId || !window.PhysikosRutasEvaluaciones) return;
    window.location.href = window.PhysikosRutasEvaluaciones.construirUrlPlantilla(evaluationId);
  }

  function openPdf(chapter, pdfFile) {
    if (!pdfFile || typeof window.construirRutaPdfPlanes !== "function") return;
    window.setPdfSrcAndRedirect(window.construirRutaPdfPlanes(chapter.carpeta, pdfFile));
  }

  function openExternalUrl(url) {
    if (!url) return;
    window.open(url, "_blank");
  }

  function createActions(chapter, resource) {
    const actions = document.createElement("div");
    actions.className = "lesson-plans-list__cell lesson-plans-list__cell--actions";

    actions.append(
      createActionButton("Video", "lesson-plans-list__action--video", () => {
        openExternalUrl(resource.video || chapter.videoPlaylist);
      }, Boolean(resource.video || chapter.videoPlaylist)),
      createActionButton("Evaluación", "lesson-plans-list__action--evaluation", () => {
        openEvaluation(resource.evaluacion);
      }, Boolean(resource.evaluacion)),
      createActionButton("Plan", "lesson-plans-list__action--pdf", () => {
        openPdf(chapter, resource.pdf || chapter.pdfGeneral);
      }, Boolean(resource.pdf || chapter.pdfGeneral)),
      createActionButton("Simulador", "lesson-plans-list__action--simulator", () => {
        window.location.href = resource.simulador;
      }, Boolean(resource.simulador))
    );

    return actions;
  }

  function createListRow(chapter, resource) {
    const row = document.createElement("article");
    row.className = "lesson-plans-list__row";
    row.dataset.searchText = normalizeText([
      chapter.nombre,
      chapter.capitulonumber,
      resource.nombre,
      resource.evaluacion,
      getResourceDate(resource, chapter)
    ].join(" "));
    
    const chapterCell = document.createElement("div");
    chapterCell.className = "lesson-plans-list__cell lesson-plans-list__cell--chapter";
    chapterCell.dataset.label = "Capítulo";
    chapterCell.textContent = chapter.nombre || "Capítulo no disponible";

    const chapternumber = document.createElement("div");
    chapternumber.className = "lesson-plans-list__cell lesson-plans-list__cell--chapternumber";
    chapternumber.dataset.label = "Capítulo";
    chapternumber.textContent = `Capítulo ${chapter.capitulonumber}` || "Capítulo sin numeración";

    chapterCell.appendChild(chapternumber);

    const classCell = document.createElement("div");
    classCell.className = "lesson-plans-list__cell lesson-plans-list__cell--class";
    classCell.dataset.label = "Clase";
    classCell.textContent = resource.nombre || "Clase no disponible";

    const updatedCell = document.createElement("div");
    updatedCell.className = "lesson-plans-list__cell lesson-plans-list__cell--updated";
    updatedCell.dataset.label = "Modificación";
    updatedCell.textContent = getResourceDate(resource, chapter);

    row.append(chapterCell, classCell, updatedCell, createActions(chapter, resource));
    return row;
  }

  function getRowsData() {
    return getChapters().flatMap((chapter) => {
      if (Array.isArray(chapter.subtemas) && chapter.subtemas.length > 0) {
        return chapter.subtemas.map((resource) => ({ chapter, resource }));
      }

      return [{
        chapter,
        resource: {
          nombre: chapter.pdfGeneral ? "PDF general del capítulo" : "En desarrollo",
          pdf: chapter.pdfGeneral || "",
          video: chapter.videoPlaylist || "",
          modificacion: chapter.modificacion || chapter.actualizado || chapter.fecha || ""
        }
      }];
    });
  }

  function createListSection() {
    const section = document.createElement("section");
    section.className = "lesson-plans-list";
    section.id = "lesson-plans-list";
    section.hidden = true;

    const header = document.createElement("div");
    header.className = "lesson-plans-list__header";
    ["Capítulo", "Clase", "Modificación", "Acciones"].forEach((text) => {
      const cell = document.createElement("span");
      cell.className = "lesson-plans-list__header-cell";
      cell.textContent = text;
      header.appendChild(cell);
    });

    const body = document.createElement("div");
    body.className = "lesson-plans-list__body";

    getRowsData().forEach(({ chapter, resource }) => {
      body.appendChild(createListRow(chapter, resource));
    });

    section.append(header, body);
    return section;
  }

  function ensureListSection() {
    if (listSection) return listSection;
    if (!gridSection) return null;

    listSection = createListSection();
    gridSection.insertAdjacentElement("afterend", listSection);
    return listSection;
  }

  function updateCounter() {
    if (!counter) return;

    const chapters = getChapters().length;
    const rows = getRowsData().length;
    counter.textContent = `${chapters} capítulos | ${rows} clases`;
  }

  function filterGrid(query) {
    if (!gridSection) return;

    const chapters = getChapters();
    const headings = Array.from(gridSection.querySelectorAll("h2[id^='capitulo-']"));

    headings.forEach((heading, index) => {
      const chapter = chapters[index] || {};
      const formulas = gridSection.querySelector(`.${heading.id}`);
      const subthemesText = Array.isArray(chapter.subtemas)
        ? chapter.subtemas.map((resource) => resource.nombre).join(" ")
        : "";
      const matches = !query || normalizeText(`${heading.textContent} ${chapter.nombre} ${subthemesText}`).includes(query);

      heading.hidden = !matches;
      if (formulas) {
        formulas.hidden = !matches;
      }
    });
  }

  function filterList(query) {
    const section = ensureListSection();
    if (!section) return;

    section.querySelectorAll(".lesson-plans-list__row").forEach((row) => {
      row.hidden = Boolean(query) && !row.dataset.searchText.includes(query);
    });
  }

  function applySearch() {
    const query = normalizeText(searchInput ? searchInput.value : "");
    filterGrid(query);
    filterList(query);
  }

  function setView(view) {
    activeView = view;
    const section = ensureListSection();

    if (gridSection) {
      gridSection.hidden = view === "list";
    }

    if (section) {
      section.hidden = view !== "list";
    }

    setButtonState(view);
    applySearch();
  }

  function expandAll() {
    if (!gridSection || typeof window.$ !== "function") return;

    $(".formulas").show();
    $(".toggle-formulas-btn").removeClass("toggle-formulas-btn-close").html('');
    $(".lesson-plans-repository__sequence").text("Contraer todo").addClass("is-expanded");
  }

  function contractAll() {
    if (!gridSection || typeof window.$ !== "function") return;

    $(".formulas").hide();
    $(".toggle-formulas-btn").addClass("toggle-formulas-btn-close").html('');
    $(".lesson-plans-repository__sequence").text("Expandir todo").removeClass("is-expanded");
  }

  function toggleAll() {
    if (!sequenceButton) return;
    // Verificamos si el texto actual es "Expandir todo"
    const isExpanded = sequenceButton.textContent.trim() === "Contraer todo";

    if (isExpanded) {
        contractAll();
    } else {
        expandAll();
    }
  }

  function bindEvents() {
    if (gridButton) {
      gridButton.addEventListener("click", () => setView("grid"));
    }

    if (listButton) {
      listButton.addEventListener("click", () => setView("list"));
    }

    if (searchInput) {
      searchInput.addEventListener("input", applySearch);
    }

    if (sequenceButton) {
      sequenceButton.setAttribute("role", "button");
      sequenceButton.setAttribute("tabindex", "0");
      sequenceButton.addEventListener("click", toggleAll);
    }

    sequenceButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Evita el scroll predeterminado al presionar Espacio
      toggleAll();
    }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureListSection();
    updateCounter();
    bindEvents();
    setView(activeView);
  });
})();
