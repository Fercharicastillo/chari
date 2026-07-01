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
    submenu.setAttribute('aria-hidden', 'false');

    subelementos[0].parentNode.insertBefore(submenu, subelementos[0]);
    subelementos.forEach((subelemento) => submenu.appendChild(subelemento));

    const botonToggle = document.createElement('button');
    botonToggle.className = 'menu-submenu-toggle';
    botonToggle.type = 'button';
    botonToggle.setAttribute('aria-label', `Contraer ${nombreSubmenu}`);
    botonToggle.setAttribute('aria-expanded', 'true');

    encabezadoSubmenu.classList.add('menu-submenu-header');
    encabezadoSubmenu.appendChild(botonToggle);

    botonToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const estaCerrado = submenu.classList.toggle('menu-submenu-cerrado');
      encabezadoSubmenu.classList.toggle('menu-submenu-header-cerrado', estaCerrado);
      submenu.setAttribute('aria-hidden', estaCerrado ? 'true' : 'false');
      botonToggle.setAttribute('aria-expanded', estaCerrado ? 'false' : 'true');
      botonToggle.setAttribute('aria-label', estaCerrado ? `Expandir ${nombreSubmenu}` : `Contraer ${nombreSubmenu}`);
    });
  });
}

inicializarSubmenusMenu();

// CREAR FECHA
const containerfecha = document.querySelector('.footer-right');

function applydate() {
  const emdate = document.createElement('em'); 
  emdate.textContent = 'Ultima actualización: 2024-03-23';
  containerfecha.appendChild(emdate); 
}

applydate();

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
