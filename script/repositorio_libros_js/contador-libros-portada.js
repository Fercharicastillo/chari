document.querySelectorAll("[data-libros-categoria]").forEach((contador) => {
  const categoria = contador.dataset.librosCategoria;
  const cantidad = window.PhysikosLibros.filter((libro) =>
    libro.carpeta === categoria || libro.categoriaId === categoria
  ).length;

  const card = contador.closest(".home-toc-card");

  if (cantidad <= 0) {
      contador.textContent = "En Construcción";
    
      if (!card) return;

      card.classList.add("is-unavailable");
    
      if (!card.querySelector(".home-toc-card__availability")) {
        const availabilityCard = document.createElement("span");
        availabilityCard.classList.add("home-toc-card__availability");
        availabilityCard.textContent = "No disponible";
        card.appendChild(availabilityCard);
      }

      return;
    }

  contador.textContent = `${cantidad} ${cantidad === 1 ? "documento disponible" : "documentos disponibles"}`;
});