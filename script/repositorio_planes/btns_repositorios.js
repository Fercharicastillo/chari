// https://github.com/Khan/KaTeX
var closeSymbol = ''; // simbolo de cerrar carpeta
var openSymbol = ''; // simbolo de abrir carpeta
var gotoTopSymbol = ''; // simbolo de pdf
var toggleFormulasCssClass = 'toggle-formulas-btn'; // clase para botono de alternancia
var titleRightBtnsCssClass = 'title-right-btns'; // clase de botones a la derecha youtube y pdf

var formulasElems = $('.formulas').hide(); // oculta inicialmente el contenido de todos los elementos con clase formulas

var gotoTopBtn = $('<a>') /*crea una etiqueta a, con ciertos atributos, para el boton de Menu hacia arriba */
  .attr('href', '#top')
  .html(gotoTopSymbol)
  .addClass('goto-top-btn');

var youtubeBtn = $('<a>') /*crea una etiqueta a, con ciertos atributos, para el boton de Menu hacia arriba */
  .html('')
  .attr('href', '#')
  .addClass('view-video-btn');

var gotoTopBtnTmpl = $('<div>') /* Se crea un elemento div*/
  .addClass(titleRightBtnsCssClass) /*Se agrega la clase title-right-btns*/
  .append(gotoTopBtn)
  .append(youtubeBtn); // Se añade dentro del div el elemento gotoToBtn creado anteriormente

//Estructura de los tres botones de cada cada capitulo
var subtemaBtnTmpl = $('<div>')
  .addClass('subtema-actions')
  .append(
      $('<a>')
        .addClass('subtema-view-btn')
        .html('👁 Ver')
  )
  .append(
      $('<a>')
        .addClass('view-test-btn')
        .html('☰')
  )
  .append(
      $('<a>')
        .addClass('subtema-expand-btn')
        .html('⛶')
  );  

var toggleFormulasBtnTmpl = $('<span>') // Se crea un elemento span
  .html(openSymbol) // Tendra como contenido el simbolo Carpeta abierta
  .addClass(toggleFormulasCssClass); // Se le añade la clase toggle-formulas-btn

/*Se construye el nombre de los pdfs Deberia estar en un Js separado*/
const origen = document.body.dataset.origen;
const nombresArchivosformulas = [
  "Capitulo_1_Cinematica_en_y_3_dimensiones.pdf",
  "Capitulo_2_Dinamica_Traslacional_y_Rotacional.pdf",
  "Capitulo_3_Estatica.pdf",
  "Capitulo_4_Trabajo_y_Energia.pdf",
  "Capitulo_5_Gravitacion.pdf",
  "Capitulo_6_Movimiento_Oscilatorio.pdf",
  "Capitulo_7_Fluidos.pdf"
];
const nameCHAPTER= [
  {
    NombreCapitulo: "Cinematica_en_y_3_dimensiones",
    PdfCapitulo: "Capitulo_1_Cinematica_en_y_3_dimensiones.pdf",
    VideoYTubePlaylist: "https://www.youtube.com/watch?v=75xi6aasdw4&list=PLeySRPnY35dF7yGgUKWV2L-03TK1TlBNY"
  },

  {
    NombreCapitulo: "Dinamica_Traslacional_y_Rotacional",
    PdfCapitulo: "Dinamica_Traslacional_y_Rotacional.pdf",
    VideoYTubePlaylist: "https://www.youtube.com/watch?v=0WNWab2b5jU&list=PLRenu6lMxFiLyoy7VGtQ1oZxjO-9Z666g"
  },

  {
    NombreCapitulo: "Estatica",
    PdfCapitulo: "Capitulo_3_Estatica.pdf",
    VideoYTubePlaylist: " "
  },

  {
    NombreCapitulo: "Trabajo_y_Energia",
    PdfCapitulo: "Capitulo_4_Trabajo_y_Energia.pdf",
    VideoYTubePlaylist: " "
  },

  {
    NombreCapitulo: "Gravitacion",
    PdfCapitulo: "Capitulo_5_Gravitacion.pdf",
    VideoYTubePlaylist: " "
  },

  {
    NombreCapitulo: "Movimiento_Oscilatorio",
    PdfCapitulo: "Capitulo_6_Movimiento_Oscilatorio.pdf",
    VideoYTubePlaylist: " "
  },

  {
    NombreCapitulo: "Fluidos",
    PdfCapitulo: "Capitulo_7_Fluidos.pdf",
    VideoYTubePlaylist: " "
  }
];
const domaini = "https://fercharicastillo.github.io/chari/";
const enterfolderi = "visor_pdfs/web/viewer.html?file=pdfs/";
const namefolderi = "pdfs_repositorio_formulas/mecanica_newtoniana/";
  
$(document).ready(bootstrap); // Ejecuta la funcion boostrap una vez cargada la pagina y no antes

function scrollToSection(sectionId) {
  var headerHeight = $('.header').outerHeight(); // Obtén la altura del encabezado fijo
  var sectionOffset = $(sectionId).offset().top - headerHeight; // Calcula el desplazamiento compensando la altura del encabezado
  $('html, body').animate({ scrollTop: sectionOffset }, 'fast'); // Desplaza la página suavemente al desplazamiento calculado
}

$('.header a[href^="#"]').on('click', function(event) {
  event.preventDefault(); // Evita el comportamiento predeterminado del enlace
  var target = $(this).attr('href'); // Obtiene el valor del atributo href del enlace
  scrollToSection(target); // Llama a la función para desplazar la página a la sección correspondiente
});

function addGotoTopBtn(index, h2Elem) {
  var pdfSrc = domaini + enterfolderi + namefolderi + nombresArchivosformulas[index]; // Generar la ruta del PDF correspondiente
  var gotoTopBtnContainer = gotoTopBtnTmpl.clone(); // Clonar el contenedor que contiene ambos botones
  var gotoTopBtnClone = gotoTopBtnContainer.find('.goto-top-btn'); // Seleccionar el botón "Ir arriba" dentro del contenedor clonado
  gotoTopBtnClone.attr('data-pdf', pdfSrc); // Asignar la ruta del PDF como atributo de datos al botón "Ir arriba"
  $(gotoTopBtnClone).on('click', function(event) {
    event.preventDefault();
    var pdfSrc = $(this).attr('data-pdf');
    if (pdfSrc) {
      setPdfSrcAndRedirect(pdfSrc, origen);
    }
  });
  $(h2Elem).prepend(gotoTopBtnContainer); // Añadir el contenedor clonado al encabezado
}

/*Clona el boton de alternancia y añade la accion de mostrar contenido toggleFolding al dar click*/
function addToggleBtn(index, h2Elem) {
   return toggleFormulasBtnTmpl
    .clone()
    .click(toggleFolding)
    .prependTo(h2Elem)[0];
}

/*Boton de alternacia: Carpeta abierta o cerrada*/
function toggleFolding(ev) {
  var formulasElem = $('.' + ev.currentTarget.parentElement.id);
  var isHiding = formulasElem.is(':visible');
  formulasElem.slideToggle();
  $(ev.currentTarget).html(isHiding ? openSymbol : closeSymbol);
  $(ev.currentTarget).toggleClass('toggle-formulas-btn-close', !isHiding);

}

/*Mostrar o ocultar formulas, si se da click en el titulo*/
function unfoldTarget(ev) {
  var formulasId = getIdFromHref(ev.currentTarget);
  var formulasElem = $('.' + formulasId);
  if (!formulasElem.is(':visible')) {
    formulasElem.show();
    $('#' + formulasId + ' .' + toggleFormulasCssClass).html(closeSymbol); 
    setTimeout(function() {
      scrollToSection('#' + formulasId); // Ajusta el desplazamiento después de mostrar la sección
    }, 100);
  } else {
    setTimeout(function() {
      scrollToSection('#' + formulasId); // Ajusta el desplazamiento después de mostrar la sección
    }, 100);
  }
}

// Funcion para añadir botones para ver videos, pdfs, y evaluaciones.Y se encarga de capturar 
// el evento que muestra el simulador correspondiente
function pruebaSubtemas() {

    $(".grupo-formulas").each(function(index) {

        const recurso = recursosSubtemas[index];

        var botones = subtemaBtnTmpl.clone();

        botones
          .removeClass(titleRightBtnsCssClass)
          .addClass("subtema-actions");

        var pdfBtn = botones.find(".goto-top-btn");
        var videoBtn = botones.find(".view-video-btn");
        var TestBtn = botones.find(".view-test-btn"); //Crear boton destinado para los cuestionarios
        var verBtn = botones.find(".subtema-view-btn");
        var expandBtn = botones.find(".subtema-expand-btn");

        videoBtn.attr("title", recurso ? "Video: " + recurso.nombre : "Video no disponible"); 
        /*Video General 
         ... Aqui debe estar el codigo para conectar con la Playlist de Youtub
        ...
        del Capitulo */
        
        /*Pdf General del Capitulo */
        pdfBtn.attr("title", recurso ? "PDF: " + recurso.nombre : "PDF no disponible"); /*Pdf General del Capitulo */
        pdfBtn.on("click", function (event) {
            event.preventDefault();

            if (recurso && recurso.pdf) {
                setPdfSrcAndRedirect(
                    domaini + enterfolderi + namefolderi + "capitulo_1/" + recurso.pdf
                );
            }
        });

        /*Evaluacion de cada SubCapitulo */
        const evaluacionId = recurso && recurso.evaluacion;
        TestBtn.attr("title", evaluacionId && recurso ? "Evaluacion: " + recurso.nombre : "Evaluacion no disponible");
        TestBtn.on("click", function (event) {
            event.preventDefault();

            if (!evaluacionId) {
                return;
            }

            window.location.href = "../evaluaciones/rp_formulario_3BGU.html?banco=" + encodeURIComponent(evaluacionId);
        });

         /*Video de cada SubCapitulo */
        const videoId = recurso && recurso.video;
        verBtn.attr("title", videoId && recurso ? "Video: " + recurso.nombre : "Video no disponible");
        verBtn.on("click", function (event) {
            event.preventDefault();

            if (!videoId) {
              return;
            }
            window.open(videoId, "_blank");
        });

        /*Plan de clase de cada Subcapitulo*/
        const nameSUBpdf = "pdfs_repositorio_planes_de_clase/mecanica_newtoniana/";
        const pdfId = recurso && recurso.pdf;
        expandBtn.attr("title", pdfId && recurso ? "Plan de Clase: " + recurso.nombre : "Plan de Clase no disponible");
        expandBtn.on("click", function(event) {
          event.preventDefault();

          if (!pdfId) {
              return;
            }
            setPdfSrcAndRedirect(
              domaini + enterfolderi + nameSUBpdf + "capitulo_1/" + pdfId
            );
        });

        $(this).append(botones);

    });

}

/*Funcionamiento del BTN de PDF */
function bootstrap() {
  toggleFormulasBtnElems = $('h2')
    .each(addGotoTopBtn)
    .map(addToggleBtn);

    pruebaSubtemas();

  $('.formulas-title').mousedown(unfoldTarget);
  handleInitialSection();
}

function handleInitialSection() {
  var hash = location.hash;
  location.hash = '';
  location.hash = hash;

  if (hash && hash != 'top') {
    $(hash.replace('#', '.')).slideToggle();
    $(hash + ' .' + toggleFormulasCssClass).html(closeSymbol);
    setTimeout(function() {
      scrollToSection(hash); // Ajusta el desplazamiento después de mostrar la sección
    }, 100);
  }
}

/*Funcion para extraer el ID de un atributo href, despues de el simbolo #*/
function getIdFromHref(elem) {
  return elem.href.match(/#(.*)/)[1];
}

//Funcion capturar el origen desde donde se clickea el mostrar pdf
function setPdfSrcAndRedirect(pdfSrc) {
    sessionStorage.setItem('pdfSrc', pdfSrc);
    sessionStorage.setItem('origen', origen);
    window.location.href = "templatepdfs_planes.html";
}

