// https://github.com/Khan/KaTeX
var closeSymbol = ''; // simbolo de cerrar carpeta
var openSymbol = ''; // simbolo de abrir carpeta
var gotoTopSymbol = ''; // simbolo de pdf
var toggleFormulasCssClass = 'toggle-formulas-btn'; // clase para botono de alternancia
var titleRightBtnsCssClass = 'title-right-btns'; // clase de botones a la derecha youtube y pdf

// CODEX: modificado para que el ocultamiento inicial de formulas dependa de CSS y no de JavaScript
var formulasElems = $('.formulas');

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
  )
  .append(
      $('<a>')
        .addClass('view-test-btn')
  )
  .append(
      $('<a>')
        .addClass('subtema-expand-btn')
  );  

var toggleFormulasBtnTmpl = $('<span>') // Se crea un elemento span
  // CODEX: modificado para que el boton nazca con el estado cerrado
  .html(closeSymbol)
  .addClass(toggleFormulasCssClass); // Se le añade la clase toggle-formulas-btn

/*Se construye el nombre de los pdfs Deberia estar en un Js separado*/
const origen = document.body.dataset.origen;
const domaini = "https://fercharicastillo.github.io/chari/";
const enterfolderi = "visor_pdfs/web/viewer.html?file=pdfs/";
// CODEX: modificado para mantener en este archivo solo la ruta base usada por la logica de botones
const rutaBasePlanes = "pdfs_repositorio_planes_de_clase/mecanica_newtoniana/";
  
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

// CODEX: anadido para construir rutas de PDF desde la carpeta declarada en recursosCapitulos
function construirRutaPdfPlanes(carpeta, archivo) {
  if (!carpeta || !archivo) return "";
  return domaini + enterfolderi + rutaBasePlanes + carpeta + "/" + archivo;
}

// CODEX: modificado para crear botones generales del capitulo desde recursosCapitulos
function addGotoTopBtn(index, h2Elem) {
  const capitulo = typeof recursosCapitulos !== "undefined" ? recursosCapitulos[index] : null;
  var gotoTopBtnContainer = gotoTopBtnTmpl.clone();
  var gotoTopBtnClone = gotoTopBtnContainer.find('.goto-top-btn');
  var youtubeBtnClone = gotoTopBtnContainer.find('.view-video-btn');

  if (capitulo && capitulo.pdfGeneral) {
    var pdfSrc = construirRutaPdfPlanes(capitulo.carpeta, capitulo.pdfGeneral);
    gotoTopBtnClone.attr('data-pdf', pdfSrc);
    gotoTopBtnClone.attr('title', 'PDF general: ' + capitulo.nombre);
    $(gotoTopBtnClone).on('click', function(event) {
      event.preventDefault();
      var pdfSrc = $(this).attr('data-pdf');
      if (pdfSrc) {
        setPdfSrcAndRedirect(pdfSrc, origen);
      }
    });
  }

  if (capitulo && capitulo.videoPlaylist) {
    youtubeBtnClone.attr('title', 'Playlist: ' + capitulo.nombre);
    youtubeBtnClone.on('click', function(event) {
      event.preventDefault();
      window.open(capitulo.videoPlaylist, '_blank');
    });
  }

  $(h2Elem).prepend(gotoTopBtnContainer);
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
// CODEX: anadido para validar que la fuente oficial de datos este disponible
function obtenerCapitulosRepositorio() {
  if (typeof recursosCapitulos !== "undefined" && Array.isArray(recursosCapitulos)) {
    return recursosCapitulos;
  }

  console.error("No se encontro recursosCapitulos. Verifica que el archivo de datos del repositorio este cargado antes de btns_repositorios.js.");
  return [];
}

// CODEX: modificado para crear botones de subtema usando la estructura jerarquica de capitulos
function pruebaSubtemas() {

    const capitulos = obtenerCapitulosRepositorio();

    $('h2').each(function(capituloIndex) {

        const capitulo = capitulos[capituloIndex];
        if (!capitulo) return;

        const formulasElem = $('.' + this.id);

        formulasElem.find('.grupo-formulas').each(function(subtemaIndex) {

            const recurso = capitulo.subtemas[subtemaIndex];

            var botones = subtemaBtnTmpl.clone();

            botones
              .removeClass(titleRightBtnsCssClass)
              .addClass("subtema-actions");

            var TestBtn = botones.find(".view-test-btn");
            var verBtn = botones.find(".subtema-view-btn");
            var expandBtn = botones.find(".subtema-expand-btn");

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
            const pdfId = recurso && recurso.pdf;
            expandBtn.attr("title", pdfId && recurso ? "Plan de Clase: " + recurso.nombre : "Plan de Clase no disponible");
            expandBtn.on("click", function(event) {
              event.preventDefault();

              if (!pdfId) {
                  return;
                }
                setPdfSrcAndRedirect(
                  construirRutaPdfPlanes(capitulo.carpeta, pdfId)
                );
            });

            $(this).append(botones);

        });

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

