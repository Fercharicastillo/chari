(function (window) {
  const categoriasLibros = [
    {
      id: "algebra-lineal",
      nombre: "Álgebra Lineal",
      carpeta: "algebra_lineal",
      datos: [
        {
          id: "Clase_3_Vectores_y_Matrices",
          titulo: "Vectores y Matrices",
          autor: "Chari Fernando",
          archivoPdf: "Clase_3_Vectores_y_Matrices.pdf",
          portada: "Clase_3_Vectores_y_Matrices.jpg"
        },
        {
          id: "Clase_4_Matrices_y_Sistemas_de_Ecuaciones",
          titulo: "Matrices y Sistemas de Ecuaciones",
          autor: "Chari Fernando",
          archivoPdf: "Clase_4_Matrices_y_Sistemas_de_Ecuaciones.pdf",
          portada: "Clase_4_Matrices_y_Sistemas_de_Ecuaciones.jpg"
        },
        {
          id: "Clase_6_Matriz_Inversa_Matrices_Elementales",
          titulo: "Matriz Inversa y Matrices Elementales",
          autor: "Chari Fernando",
          archivoPdf: "Clase_6_Matriz_Inversa_Matrices_Elementales.pdf",
          portada: "Clase_6_Matriz_Inversa_Matrices_Elementales.jpg"
        }
      ]
    },
    {
      id: "electromagnetismo",
      nombre: "Electromagnetismo",
      carpeta: "electromagnetismo",
      datos: [
        {
          id: "Clase_1_Magnetismo",
          titulo: "Magnetismo",
          autor: "Chari Fernando",
          archivoPdf: "Clase_1_Magnetismo.pdf",
          portada: "Clase_1_Magnetismo.jpg"
        }
      ]
    },
    {
      id: "fisica-moderna",
      nombre: "Física Moderna",
      carpeta: "fisica_moderna",
      datos: [
        {
          id: "Clase_1_Origen_del_Universo",
          titulo: "Origen del Universo",
          autor: "Chari Fernando",
          archivoPdf: "Clase_1_Origen_del_Universo.pdf",
          portada: "Clase_1_Origen_del_Universo.jpg"
        },
        {
          id: "Clase_2_Estrellas",
          titulo: "Las Estrellas",
          autor: "Chari Fernando",
          archivoPdf: "Clase_2_Estrellas.pdf",
          portada: "Clase_2_Estrellas.jpg"
        },
        {
          id: "Clase_3_Exoplanetas",
          titulo: "Los Exoplanetas",
          autor: "Chari Fernando",
          archivoPdf: "Clase_3_Exoplanetas.pdf",
          portada: "Clase_3_Exoplanetas.jpg"
        },
        {
          id: "Clase_4_Leyes_de_Kepler",
          titulo: "Las Leyes de Kepler",
          autor: "Chari Fernando",
          archivoPdf: "Clase_4_Leyes_de_Kepler.pdf",
          portada: "Clase_4_Leyes_de_Kepler.jpg"
        },
        {
          id: "Clase_5_Dilatacion_del_tiempo",
          titulo: "Relatividad: Dilatación Temporal",
          autor: "Chari Fernando",
          archivoPdf: "Clase_5_Dilatacion_del_tiempo.pdf",
          portada: "Clase_5_Dilatacion_del_tiempo.jpg"
        },
        {
          id: "Clase_6_Efecto_Fotoelectrico",
          titulo: "Efecto Fotoeléctrico",
          autor: "Chari Fernando",
          archivoPdf: "Clase_6_Efecto_Fotoelectrico.pdf",
          portada: "Clase_6_Efecto_Fotoelectrico.jpg"
        }
      ]
    },
    {
      id: "matematicas-discretas",
      nombre: "Matemáticas Discretas",
      carpeta: "matematicas_discretas",
      datos: [
        {
          id: "Clase_1_Algoritmo_de_Euclides",
          titulo: "Algoritmo de Euclides",
          autor: "Chari Fernando",
          archivoPdf: "Clase_1_Algoritmo_de_Euclides.pdf",
          portada: "Clase_1_Algoritmo_de_Euclides.jpg"
        }
      ]
    },
    {
      id: "termodinamica",
      nombre: "Termodinámica",
      carpeta: "termodinamica",
      datos: [
        {
          id: "Clase_1_Estructura_Atomica_Carga_Electrica",
          titulo: "Estructura Atómica de la Carga Eléctrica",
          autor: "Chari Fernando",
          archivoPdf: "Clase_1_Estructura_Atomica_Carga_Electrica.pdf",
          portada: "Clase_1_Estructura_Atomica_Carga_Electrica.jpg",
          tipo: "Plan de clase",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_2_Electrizacion_de_la_Materia",
          titulo: "Electrización de la Materia",
          autor: "Chari Fernando",
          archivoPdf: "Clase_2_Electrizacion_de_la_Materia.pdf",
          portada: "Clase_2_Electrizacion_de_la_Materia.jpg",
          tipo: "Ejercicios",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_3_Fuerza_Electrica",
          titulo: "Fuerza Eléctrica",
          autor: "Chari Fernando",
          archivoPdf: "Clase_3_Fuerza_Electrica.pdf",
          portada: "Clase_3_Fuerza_Electrica.jpg",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_4_Campo_Electrico",
          titulo: "Campo Eléctrico",
          autor: "Chari Fernando",
          archivoPdf: "Clase_4_Campo_Electrico.pdf",
          portada: "Clase_4_Campo_Electrico.jpg",
          tipo: "Apuntes",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_5_Potencial_de_cargas_puntuales",
          titulo: "Potencial de Cargas Puntuales",
          autor: "Chari Fernando",
          archivoPdf: "Clase_5_Potencial_de_cargas_puntuales.pdf",
          portada: "Clase_5_Potencial_de_cargas_puntuales.jpg",
          tipo: "Ejercicios",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_6_Energia_Potencial_Electroestatica",
          titulo: "Energía de Potencial de Cargas Puntuales",
          autor: "Chari Fernando",
          archivoPdf: "Clase_6_Energia_Potencial_Electroestatica.pdf",
          portada: "Clase_6_Energia_Potencial_Electroestatica.jpg",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_7_Diferencial_Potencial_Electrico",
          titulo: "Diferencial de Potencial Eléctrico",
          autor: "Chari Fernando",
          archivoPdf: "Clase_7_Diferencial_Potencial_Electrico.pdf",
          portada: "Clase_7_Diferencial_Potencial_Electrico.jpg",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_8_Voltaje_en_campos_Uniformes",
          titulo: "Voltaje en Campos Uniformes",
          autor: "Chari Fernando",
          archivoPdf: "Clase_8_Voltaje_en_campos_Uniformes.pdf",
          portada: "Clase_8_Voltaje_en_campos_Uniformes.jpg",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_9_Carga_de_un_conductor",
          titulo: "Carga de un Conductor",
          autor: "Chari Fernando",
          archivoPdf: "Clase_9_Carga_de_un_conductor.pdf",
          portada: "Clase_9_Carga_de_un_conductor.jpg",
          actualizado: "10-07-2026"
        },
        {
          id: "Clase_10_Capacitor_o_condensador_electrico",
          titulo: "Capacitor o Condensador Eléctrico",
          autor: "Chari Fernando",
          archivoPdf: "Clase_10_Capacitor_o_condensador_electrico.pdf",
          portada: "Clase_10_Capacitor_o_condensador_electrico.jpg",
          actualizado: "10-07-2026"
        }
      ]
    }
  ];

  const libros = categoriasLibros.flatMap((categoria) => (
    categoria.datos.map((libro) => ({
      ...libro,
      categoria: categoria.nombre,
      categoriaId: categoria.id,
      carpeta: categoria.carpeta
    }))
  ));

  window.PhysikosLibrosCategorias = categoriasLibros;
  window.PhysikosLibros = libros;
})(window);
