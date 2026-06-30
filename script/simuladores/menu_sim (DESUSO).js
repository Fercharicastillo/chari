
let click_btn_sim = document.getElementById('btn_menu_sim');
const btnmenu = document.querySelector('.btn-menu-sim');
const menu_sim = document.querySelector('.menu');
let main_sim = document.querySelector('.main');

click_btn_sim.addEventListener('click', e=>{
	main_sim.classList.toggle('main_ds');
  menu_sim.classList.toggle('menu_ds');
  btnmenu.classList.toggle('selected-btn-menu')
});

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
  btn_darkmode.classList.toggle('btn-cambio-after-dM', isDarkMode);
  document.documentElement.setAttribute('cambio', isDarkMode ? 'darkMode' : null);
  sessionStorage.setItem('darkMode', isDarkMode);
};

click_dm.addEventListener('click', applyDarkMode);

// Aplicar el modo oscuro al cargar la página
const isDarkMode = sessionStorage.getItem('darkMode') === 'true';
click_dm.checked = isDarkMode;
applyDarkMode();


menu_sim.addEventListener("mouseenter", () => {
  menu_sim.classList.add("overflow-visible");
});

menu_sim.addEventListener("mouseleave", () => {
  menu_sim.classList.remove("overflow-visible");
});
