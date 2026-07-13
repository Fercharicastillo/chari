const contenedor = document.getElementById('home-toc-container');
const contenedorCategorias = document.getElementById('books-category-tabs');
const contadorLibros = document.getElementById('books-counter');
const buscadorLibros = document.getElementById('books-search-input');
const selectorOrden = document.getElementById('books-sort-select');
const botonesVista = document.querySelectorAll('.books-repository__view-button');
const panelDetalles = document.getElementById('book-detail-panel');
const detalleImagen = document.getElementById('book-detail-image');
const detalleCategoria = document.getElementById('book-detail-category');
const detalleTitulo = document.getElementById('book-detail-title');
const detalleAutor = document.getElementById('book-detail-author');
const detalleCategoriaValor = document.getElementById('book-detail-category-value');
const detalleArchivo = document.getElementById('book-detail-file');
const botonAbrirDetalle = document.getElementById('book-detail-open');
const controlesCerrarDetalle = document.querySelectorAll('[data-book-detail-close]');
const repositorioLibros = document.querySelector('.books-repository');
const categoriaPagina = repositorioLibros ? repositorioLibros.dataset.booksCategory : '';
const todosLosLibros = Array.isArray(window.PhysikosLibros) ? window.PhysikosLibros : [];
const libros = categoriaPagina
    ? todosLosLibros.filter((libro) => libro.carpeta === categoriaPagina || libro.categoriaId === categoriaPagina)
    : todosLosLibros;
let categoriaActiva = 'todos';
let busquedaActiva = '';
let ordenActivo = 'titulo-asc';
let vistaActiva = 'grid';
let pdfDetalleActivo = '';
let ultimoFocoAntesDetalle = null;

function crearTarjetaLibro(libro) {
    const divCard = document.createElement('div');
    divCard.classList.add('home-toc-card', 'book-card');
    divCard.dataset.bookId = libro.id;
    divCard.dataset.bookCategory = libro.categoria;

    const pdfSrc = window.PhysikosRutasPdf
      ? window.PhysikosRutasPdf.construirPdfLibro(libro.carpeta, libro.archivoPdf)
      : "";

    const cover = document.createElement('div');
    cover.classList.add('book-card__cover');

    const imagen = document.createElement('img');
    imagen.classList.add('book-card__image');
    imagen.src = construirRutaPortada(libro);
    imagen.alt = libro.titulo;
    imagen.onerror = () => {
        imagen.src = '../../img/repositoriolibros/default.jpg';
    };

    const contenido = document.createElement('div');
    contenido.classList.add('book-card__body');

    const titulo = document.createElement('h2');
    titulo.classList.add('book-card__title');
    titulo.textContent = libro.titulo;

    const autor = document.createElement('p');
    autor.classList.add('book-card__author');
    autor.textContent = libro.autor;

    const meta = document.createElement('div');
    meta.classList.add('book-card__meta');

    const categoria = document.createElement('span');
    categoria.classList.add('book-card__category');
    categoria.textContent = libro.categoria;

    const acciones = document.createElement('div');
    acciones.classList.add('book-card__actions');

    const botonDetalles = document.createElement('button');
    botonDetalles.classList.add('book-card__details', 'book-card__icon-button', 'book-card__icon-button--details');
    botonDetalles.type = 'button';
    botonDetalles.innerHTML = '<span class="book-card__button-icon" aria-hidden="true"></span><span>Detalles</span>';
    botonDetalles.addEventListener('click', () => abrirPanelDetalles(libro, pdfSrc));

    const enlacePdf = document.createElement('a');
    enlacePdf.classList.add('book-card__action', 'book-card__icon-button', 'book-card__icon-button--pdf');
    enlacePdf.href = pdfSrc;
    enlacePdf.setAttribute('aria-label', `Abrir ${libro.titulo} de ${libro.autor}`);
    enlacePdf.innerHTML = '<span class="book-card__button-icon" aria-hidden="true"></span><span>Abrir PDF</span>';
    enlacePdf.addEventListener('click', function(event) {
        event.preventDefault();
        if (pdfSrc) {
            setPdfSrcAndRedirect(pdfSrc);
        }
    });

    cover.appendChild(imagen);
    meta.appendChild(categoria);
    contenido.appendChild(titulo);
    contenido.appendChild(autor);
    contenido.appendChild(meta);
    acciones.appendChild(botonDetalles);
    acciones.appendChild(enlacePdf);
    contenido.appendChild(acciones);

    divCard.appendChild(cover);
    divCard.appendChild(contenido);

    return divCard;
}

function construirRutaPortada(libro) {
    if (!libro || !libro.carpeta || !libro.portada) {
        return '../../img/repositoriolibros/default.jpg';
    }

    return `../../img/repositoriolibros/${libro.carpeta}/${libro.portada}`;
}

function obtenerCategorias() {
    return [...new Set(libros.map((libro) => libro.categoria))];
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerLibrosFiltrados() {
    const busquedaNormalizada = normalizarTexto(busquedaActiva);
    let resultado = categoriaActiva === 'todos'
        ? [...libros]
        : libros.filter((libro) => libro.categoria === categoriaActiva);

    if (busquedaNormalizada) {
        resultado = resultado.filter((libro) => {
            const textoLibro = normalizarTexto([
                libro.titulo,
                libro.autor,
                libro.categoria,
                libro.archivoPdf
            ].join(' '));

            return textoLibro.includes(busquedaNormalizada);
        });
    }

    return ordenarLibros(resultado);
}

function ordenarLibros(listaLibros) {
    const [campo, direccion] = ordenActivo.split('-');
    const factor = direccion === 'desc' ? -1 : 1;
    const obtenerValor = (libro) => campo === 'autor' ? libro.autor : libro.titulo;

    return [...listaLibros].sort((libroA, libroB) => (
        obtenerValor(libroA).localeCompare(obtenerValor(libroB), 'es', { sensitivity: 'base' }) * factor
    ));
}

function actualizarContador(cantidad) {
    if (!contadorLibros) {
        return;
    }

    const etiqueta = cantidad === 1 ? 'libro disponible' : 'libros disponibles';
    contadorLibros.textContent = `${cantidad} ${etiqueta}`;
}

function renderizarLibros() {
    if (!contenedor) {
        return;
    }

    const librosFiltrados = obtenerLibrosFiltrados();
    contenedor.innerHTML = '';

    contenedor.classList.toggle('is-list-view', vistaActiva === 'list');

    if (librosFiltrados.length === 0) {
        const mensajeVacio = document.createElement('p');
        mensajeVacio.classList.add('books-repository__empty');
        mensajeVacio.textContent = 'No se encontraron libros con esos criterios.';
        contenedor.appendChild(mensajeVacio);
        actualizarContador(0);
        return;
    }

    librosFiltrados.forEach((libro) => {
        contenedor.appendChild(crearTarjetaLibro(libro));
    });
    actualizarContador(librosFiltrados.length);
}

function crearBotonCategoria(nombreCategoria, cantidad, activo) {
    const boton = document.createElement('button');
    boton.classList.add('books-repository__category-filter');
    boton.type = 'button';
    boton.dataset.category = nombreCategoria;
    boton.setAttribute('aria-pressed', activo ? 'true' : 'false');

    if (activo) {
        boton.classList.add('is-active');
    }

    const etiqueta = document.createElement('span');
    etiqueta.classList.add('books-repository__category-name');
    etiqueta.textContent = nombreCategoria === 'todos' ? 'Todos' : nombreCategoria;

    const total = document.createElement('span');
    total.classList.add('books-repository__category-count');
    total.textContent = String(cantidad) + " libros";

    boton.appendChild(etiqueta);
    boton.appendChild(total);
    boton.addEventListener('click', () => {
        categoriaActiva = nombreCategoria;
        renderizarCategorias();
        renderizarLibros();
    });

    return boton;
}

function renderizarCategorias() {
    if (!contenedorCategorias) {
        return;
    }

    const categorias = obtenerCategorias();
    contenedorCategorias.innerHTML = '';
    contenedorCategorias.appendChild(
        crearBotonCategoria('todos', libros.length, categoriaActiva === 'todos')
    );

    categorias.forEach((categoria) => {
        const cantidad = libros.filter((libro) => libro.categoria === categoria).length;
        contenedorCategorias.appendChild(
            crearBotonCategoria(categoria, cantidad, categoriaActiva === categoria)
        );
    });
}

function abrirPanelDetalles(libro, pdfSrc) {
    if (!panelDetalles) {
        return;
    }

    ultimoFocoAntesDetalle = document.activeElement;
    pdfDetalleActivo = pdfSrc;

    if (detalleImagen) {
        detalleImagen.src = construirRutaPortada(libro);
        detalleImagen.alt = libro.titulo;
        detalleImagen.onerror = () => {
            detalleImagen.src = '../../img/repositoriolibros/default.jpg';
        };
    }

    if (detalleCategoria) {
        detalleCategoria.textContent = libro.categoria;
    }

    if (detalleTitulo) {
        detalleTitulo.textContent = libro.titulo;
    }

    if (detalleAutor) {
        detalleAutor.textContent = libro.autor;
    }

    if (detalleCategoriaValor) {
        detalleCategoriaValor.textContent = libro.categoria;
    }

    if (detalleArchivo) {
        detalleArchivo.textContent = libro.archivoPdf;
    }

    panelDetalles.hidden = false;
    document.body.classList.add('books-detail-open');

    const botonCerrar = panelDetalles.querySelector('.books-repository__detail-close');
    if (botonCerrar) {
        botonCerrar.focus();
    }
}

function cerrarPanelDetalles() {
    if (!panelDetalles || panelDetalles.hidden) {
        return;
    }

    panelDetalles.hidden = true;
    document.body.classList.remove('books-detail-open');
    pdfDetalleActivo = '';

    if (ultimoFocoAntesDetalle && typeof ultimoFocoAntesDetalle.focus === 'function') {
        ultimoFocoAntesDetalle.focus();
    }
}

renderizarCategorias();
renderizarLibros();

if (buscadorLibros) {
    buscadorLibros.addEventListener('input', () => {
        busquedaActiva = buscadorLibros.value.trim();
        renderizarLibros();
    });
}

if (selectorOrden) {
    selectorOrden.addEventListener('change', () => {
        ordenActivo = selectorOrden.value;
        renderizarLibros();
    });
}

botonesVista.forEach((boton) => {
    boton.addEventListener('click', () => {
        vistaActiva = boton.dataset.view || 'grid';

        botonesVista.forEach((botonVista) => {
            const activo = botonVista === boton;
            botonVista.classList.toggle('is-active', activo);
            botonVista.setAttribute('aria-pressed', activo ? 'true' : 'false');
        });

        renderizarLibros();
    });
});

controlesCerrarDetalle.forEach((control) => {
    control.addEventListener('click', cerrarPanelDetalles);
});

if (botonAbrirDetalle) {
    botonAbrirDetalle.addEventListener('click', () => {
        if (pdfDetalleActivo) {
            setPdfSrcAndRedirect(pdfDetalleActivo);
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        cerrarPanelDetalles();
        return;
    }

    if (event.key !== 'Tab' || !panelDetalles || panelDetalles.hidden) {
        return;
    }

    const elementosEnfocables = panelDetalles.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!elementosEnfocables.length) {
        return;
    }

    const primero = elementosEnfocables[0];
    const ultimo = elementosEnfocables[elementosEnfocables.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
    }
});

function setPdfSrcAndRedirect(pdfSrc) {
    // Guardar el valor de data-pdf
    sessionStorage.setItem('pdfSrc', pdfSrc);
    // Redirigir a la plantilla
    window.location.href = "templatepdfs_libros.html";
}

// Estructura para extraer los pdfs '?file=pdfs/pdfs_repositorio_libros/algebra_lineal/'
