const indexSummaryData = {
  simuladores: {
    total: 12,
    singular: "simulador",
    plural: "simuladores"
  },
  clases: {
    total: 7,
    singular: "área temática",
    plural: "áreas temáticas"
  },
  documentos: {
    total: 27,
    singular: "documento",
    plural: "documentos"
  },
  autores: {
    total: 5,
    singular: "autor",
    plural: "autores"
  }
};

function crearTextoContador(total, singular, plural) {
  const etiqueta = total === 1 ? singular : plural;
  return `${total} ${etiqueta}`;
}

function actualizarResumenIndex () {
    const items = document.querySelectorAll("[data-summary-key]");

    items.forEach((item) => {
        const key = item.dataset.summaryKey;
        const datos = indexSummaryData[key];
        const contador = item.querySelector("[data-summary-count]");
        
        if (!datos || !contador) {
            return;
        }

        contador.textContent = crearTextoContador (
            datos.total,
            datos.singular,
            datos.plural
        );
    });
}

document.addEventListener("DOMContentLoaded", actualizarResumenIndex);