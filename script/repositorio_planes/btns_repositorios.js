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

// Funcion para añadir botones para ver videos
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

        pdfBtn.attr("title", recurso ? "PDF: " + recurso.nombre : "PDF no disponible");
        videoBtn.attr("title", recurso ? "Video: " + recurso.nombre : "Video no disponible");

        pdfBtn.on("click", function (event) {
            event.preventDefault();

            if (recurso && recurso.pdf) {
                setPdfSrcAndRedirect(
                    domaini + enterfolderi + namefolderi + "capitulo_1/" + recurso.pdf
                );
            }
        });

        // CODEX: modificado para abrir la plantilla universal con el banco configurado en recursosSubtemas
        const evaluacionId = recurso && recurso.evaluacion;
        TestBtn.attr("title", evaluacionId && recurso ? "Evaluacion: " + recurso.nombre : "Evaluacion no disponible");
        TestBtn.on("click", function (event) {
            event.preventDefault();

            if (!evaluacionId) {
                return;
            }

            window.location.href = "../evaluaciones/rp_formulario_3BGU.html?banco=" + encodeURIComponent(evaluacionId);
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

