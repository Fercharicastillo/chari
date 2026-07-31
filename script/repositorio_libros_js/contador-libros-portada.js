document.querySelectorAll("[data-libros-categoria]").forEach((contador) => {
  const categoria = contador.dataset.librosCategoria;
  const cantidad = window.PhysikosLibros.filter((libro) =>
    libro.carpeta === categoria || libro.categoriaId === categoria
  ).length;

  if (cantidad <= 0) {
      return "En Construccion";
    }

  contador.textContent = `${cantidad} ${cantidad === 1 ? "documento disponible" : "documentos disponibles"}`;
});