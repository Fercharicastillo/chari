//Es Js es del menu depegable
let click_btn = document.getElementById('btn_menu');
const btnmenu = document.querySelector('.btn-menu');
const menu = document.querySelector('.menu');
let main = document.querySelector('.main');
const menuMovilMedia = window.matchMedia('(max-width: 430px)');

// CODEX: añadido para conservar el estado del menu movil entre navegaciones sin cerrar enlaces automaticamente
function aplicarEstadoMenu(usarClaseMenuDs, guardarEstadoMovil = true) {
  btnmenu.classList.toggle('selected-btn-menu', usarClaseMenuDs);
  menu.classList.toggle('menu_ds', usarClaseMenuDs);
  main.classList.toggle('main_ds', usarClaseMenuDs);

  if (guardarEstadoMovil && menuMovilMedia.matches) {
    sessionStorage.setItem('menuMovilAbierto', usarClaseMenuDs ? 'true' : 'false');
  }

  // CODEX: añadido para reutilizar el overlay global cuando el menu movil esta abierto
  if (window.PhysikosOverlay && menuMovilMedia.matches) {
    if (usarClaseMenuDs) {
      window.PhysikosOverlay.mostrar({
        target: '.main',
        onClick: () => aplicarEstadoMenu(false)
      });
    } else {
      window.PhysikosOverlay.ocultar();
    }
  }
}

// CODEX: añadido para restaurar el menu movil abierto despues de navegar desde una opcion del menu
function restaurarEstadoMenuMovil() {
  if (!menuMovilMedia.matches) {
    return;
  }

  const menuMovilAbierto = sessionStorage.getItem('menuMovilAbierto') === 'true';

  if (menuMovilAbierto) {
    aplicarEstadoMenu(true, false);
  }

  document.documentElement.classList.remove('menu-movil-inicial-abierto');
}

click_btn.addEventListener('click', e=>{
  aplicarEstadoMenu(!menu.classList.contains('menu_ds'));
});

restaurarEstadoMenuMovil();

// CODEX: modificado para plegar cualquier submenu del menu lateral sin alterar el boton principal
function inicializarSubmenusMenu() {
  const seccionesConSubmenu = [
    'menu-simuladores',
    'menu-graficadores',
    'menu-proyectos',
    'menu-repositorio-planes',
    'menu-repositorio-libros',
    'menu-hoja-vida'
  ];

  seccionesConSubmenu.forEach((claseSeccion) => {
    const encabezadoSubmenu = document.querySelector(`.content__content .${claseSeccion}`);

    if (!encabezadoSubmenu || encabezadoSubmenu.querySelector('.menu-submenu-toggle')) {
      return;
    }

    const subelementos = [];
    let siguienteElemento = encabezadoSubmenu.nextElementSibling;

    while (siguienteElemento && siguienteElemento.querySelector('a.toc-section')) {
      subelementos.push(siguienteElemento);
      siguienteElemento = siguienteElemento.nextElementSibling;
    }

    if (subelementos.length === 0) {
      return;
    }

    const enlaceEncabezado = encabezadoSubmenu.querySelector('a.toc-part');
    const nombreSubmenu = enlaceEncabezado ? enlaceEncabezado.textContent.trim() : 'submenu';
    const submenu = document.createElement('div');
    submenu.className = `menu-submenu menu-submenu-${claseSeccion.replace('menu-', '')}`;

    subelementos[0].parentNode.insertBefore(submenu, subelementos[0]);
    subelementos.forEach((subelemento) => submenu.appendChild(subelemento));

    // CODEX: añadido para que solo el submenu activo inicie abierto y los demas puedan abrirse manualmente
    const submenuActivo = encabezadoSubmenu.classList.contains('current') ||
      subelementos.some((subelemento) => subelemento.classList.contains('current'));
    const iniciarCerrado = !submenuActivo;
    const flechaVisible = encabezadoSubmenu.classList.contains('current');

    submenu.classList.toggle('menu-submenu-cerrado', iniciarCerrado);
    submenu.setAttribute('aria-hidden', iniciarCerrado ? 'true' : 'false');

    const botonToggle = document.createElement('button');
    botonToggle.className = 'menu-submenu-toggle';
    botonToggle.type = 'button';
    // CODEX: añadido para mostrar la flecha solo en el submenu activo y conservar limpio el menu lateral
    botonToggle.classList.toggle('is-visible', flechaVisible);
    botonToggle.setAttribute('aria-label', iniciarCerrado ? `Expandir ${nombreSubmenu}` : `Contraer ${nombreSubmenu}`);
    botonToggle.setAttribute('aria-expanded', iniciarCerrado ? 'false' : 'true');

    encabezadoSubmenu.classList.add('menu-submenu-header');
    encabezadoSubmenu.classList.toggle('menu-submenu-header-cerrado', iniciarCerrado);
    encabezadoSubmenu.appendChild(botonToggle);

    // CODEX: añadido para cerrar otros submenus y mantener una sola flecha visible
    function cerrarOtrosSubmenus() {
      document.querySelectorAll('.menu .content__content .menu-submenu').forEach((otroSubmenu) => {
        if (otroSubmenu === submenu) return;

        const otroEncabezado = otroSubmenu.previousElementSibling;
        const otroToggle = otroEncabezado ? otroEncabezado.querySelector('.menu-submenu-toggle') : null;

        otroSubmenu.classList.add('menu-submenu-cerrado');
        otroSubmenu.setAttribute('aria-hidden', 'true');

        if (otroEncabezado) {
          otroEncabezado.classList.add('menu-submenu-header-cerrado');
        }

        if (otroToggle) {
          otroToggle.classList.toggle('is-visible', otroEncabezado && otroEncabezado.classList.contains('current'));
          otroToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    botonToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (submenu.classList.contains('menu-submenu-cerrado')) {
        cerrarOtrosSubmenus();
      }

      const estaCerrado = submenu.classList.toggle('menu-submenu-cerrado');
      encabezadoSubmenu.classList.toggle('menu-submenu-header-cerrado', estaCerrado);
      botonToggle.classList.toggle('is-visible', flechaVisible);
      submenu.setAttribute('aria-hidden', estaCerrado ? 'true' : 'false');
      botonToggle.setAttribute('aria-expanded', estaCerrado ? 'false' : 'true');
      botonToggle.setAttribute('aria-label', estaCerrado ? `Expandir ${nombreSubmenu}` : `Contraer ${nombreSubmenu}`);
    });

    // CODEX: añadido para permitir abrir submenus cerrados desde el encabezado sin mostrar flechas extra
    encabezadoSubmenu.addEventListener('click', (event) => {
      if (event.target.closest('a') || event.target.closest('.menu-submenu-toggle')) return;
      if (!submenu.classList.contains('menu-submenu-cerrado')) return;

      cerrarOtrosSubmenus();
      submenu.classList.remove('menu-submenu-cerrado');
      encabezadoSubmenu.classList.remove('menu-submenu-header-cerrado');
      botonToggle.classList.toggle('is-visible', flechaVisible);
      submenu.setAttribute('aria-hidden', 'false');
      botonToggle.setAttribute('aria-expanded', 'true');
      botonToggle.setAttribute('aria-label', `Contraer ${nombreSubmenu}`);
    });
  });
}

inicializarSubmenusMenu();

// CREAR FECHA
const containerfecha = document.querySelector('.footer-right');
/*Obtener la fecha */
const Fecha = new Date();
const textoFecha = 
      String(Fecha.getDate()).padStart(2, "0") + "-" + 
      (String((Fecha.getMonth() + 1)).padStart(2, "0")) + "-" +
      Fecha.getFullYear();

function applydate(textoFecha) {
  const emdate = document.createElement('em'); 
  emdate.textContent = 'Ultima actualización: ' + textoFecha;
  containerfecha.appendChild(emdate); 
}

applydate(textoFecha);

//MENU BTN-DARKMODE

const click_dm = document.getElementById('click-DarkMode');
const btn_darkmode = document.querySelector('.darmode-btn-content');

const applyDarkMode = () => {
  const isDarkMode = click_dm.checked;
  btn_darkmode.classList.add('transition');
  setTimeout (() => {
    btn_darkmode.classList.toggle('btn-cambio-after-dM', isDarkMode);
    document.documentElement.setAttribute('cambio', isDarkMode ? 'darkMode' : null);
    sessionStorage.setItem('darkMode', isDarkMode);
    setTimeout(() => {
      btn_darkmode.classList.remove('transition');
    }, 10)
  }, 100);
};

click_dm.addEventListener('click', applyDarkMode);


// Aplicar el modo oscuro al cargar la página
const isDarkMode = sessionStorage.getItem('darkMode') === 'true';
click_dm.checked = isDarkMode;
applyDarkMode();


menu.addEventListener("mouseenter", () => {
  menu.classList.add("overflow-visible");
});

menu.addEventListener("mouseleave", () => {
  menu.classList.remove("overflow-visible");
});
