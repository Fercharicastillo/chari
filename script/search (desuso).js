//Llamar Funciones
document.getElementById('btn_search').addEventListener('click', mostrar_search);
document.getElementById('main-despleglabe').addEventListener('click', ocultar_search);
document.getElementById('header').addEventListener('click', ocultar_search);

//Declarando varibales
let content_ul_search = document.querySelector('.side__ul__content');
let input_search = document.getElementById('input_search');

//Funcion para Mostras el de Search
function mostrar_search (){
	content_ul_search.style.top = "36px";
	input_search.focus()
	if(input_search.value === ""){
		content_ul_search.style.display = "none"
	}
}

//Funcion para Ocultar el de Search
function ocultar_search (){
	content_ul_search.style.top = "-650px";
	input_search.value = "";
	content_ul_search.style.display = "none";
}




//Funcion de codigo al presionar una tecla
function presionarTecla(){
	let teclaEsc = event.keyCode;
	if (teclaEsc == 27) {
		content_ul_search.style.top = "-650px";
		input_search.value = "";
		input_search.blur();
		content_ul_search.style.display = "none";
	}
}

window.onkeydown = presionarTecla;





//Creando Filtro de busqueda
document.getElementById('input_search').addEventListener('keyup', buscador_interno); 


function buscador_interno (){
	filter = input_search.value.toUpperCase();
	li = content_ul_search.getElementsByTagName('li')

	//Recorriendo elementos a filtrar mediante los li
	for (let i = 0; i < li.length; i++){
		a = li[i].getElementsByTagName("a")[0];
		textValue = a.textContent || a.innerText;
		if(textValue.toUpperCase().indexOf(filter) > -1){
			li[i].style.display = "";
			content_ul_search.style.display = "block";
			if(input_search.value === ""){
				content_ul_search.style.display = "none"
			}
		}else {
			li[i].style.display = "none";
		}	
	}

}












