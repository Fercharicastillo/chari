// CODEX: añadido para centralizar los datos comunes del menu lateral de Physikos
window.PhysikosMenuItems = [
  {
    id: "introduccion",
    texto: "Introducción",
    clase: "menu-introduccion",
    href: "index.html"
  },
  {
    id: "simuladores",
    texto: "Simuladores",
    clase: "menu-simuladores",
    href: "contenido/simuladores/simuladores.html",
    // CODEX: añadido para permitir submenus reutilizables en paginas que lo soliciten
    subitems: [
      {
        id: "pendulo-simple",
        texto: "Péndulo Simple",
        href: "contenido/simuladores/pendulo_simple.html"
      },
      {
        id: "sim-mru",
        texto: "MRU",
        href: "contenido/simuladores/sim_mru.html"
      }
    ]
  },
  {
    id: "graficadores",
    texto: "Graficadores",
    clase: "menu-graficadores",
    href: "contenido/graficadores/graficadores.html",
    // CODEX: añadido para reutilizar los subitems externos de Graficadores
    subitems: [
      {
        id: "funcion-creciente",
        texto: "Función Creciente",
        href: "https://graficarferchari.shinyapps.io/graficador_app/"
      },
      {
        id: "funcion-decreciente",
        texto: "Función Decreciente",
        href: "https://graficarferchari.shinyapps.io/graficador_app1/"
      },
      {
        id: "funcion-lineal",
        texto: "Función Lineal",
        href: "https://graficarferchari.shinyapps.io/graficador_app2/"
      }
    ]
  },
  {
    id: "proyectos",
    texto: "Proyectos",
    clase: "menu-proyectos",
    href: "contenido/proyectos/proyectos.html",
    // CODEX: añadido para reutilizar los subitems de Proyectos en todas sus paginas
    subitems: [
      {
        id: "tesis",
        texto: "Tesis",
        href: "contenido/proyectos/tesis.html"
      },
      {
        id: "sistemas-caoticos",
        texto: "Sistemas Caóticos",
        href: "contenido/proyectos/sitemas_caoticos.html"
      },
      {
        id: "series-balmer",
        texto: "Series de Balmer",
        href: "contenido/proyectos/series_de_balmer.html"
      },
      {
        id: "examenes-aleatorios",
        texto: "Examenes Aleatorios",
        href: "contenido/proyectos/examenes_aleatorios.html"
      },
      {
        id: "redaccion-libros",
        texto: "Redacción de Libros",
        href: "contenido/proyectos/algebra_superior.html"
      },
      {
        id: "software-libro",
        texto: "Software de Graficación (Libro)",
        href: "contenido/proyectos/software_libro.html"
      },
      {
        id: "software-articulo",
        texto: "Software de Graficación (Artículo)",
        href: "contenido/proyectos/software_articulo.html"
      }
    ]
  },
  {
    id: "repositorio-planes",
    texto: "Repositorio de Planes de Clase",
    clase: "menu-repositorio-planes",
    href: "contenido/repositorio_planes/repositorio_planes.html",
    // CODEX: añadido para reutilizar los subitems de Repositorio de Planes de Clase
    subitems: [
      {
        id: "mecanica-newtoniana",
        texto: "Mecánica Newtoniana",
        href: "contenido/repositorio_planes/rp_mecanica_newtoniana.html"
      },
      {
        id: "calculo-diferencial",
        texto: "Cálculo Diferencial",
        href: "contenido/repositorio_planes/rp_mecanica_cálculo diferencial.html"
      }
    ]
  },
  {
    id: "repositorio-libros",
    texto: "Repositorio de Libros",
    clase: "menu-repositorio-libros",
    href: "contenido/repositorio_libros/repositorio_libros.html",
    // CODEX: añadido para reutilizar las categorias del Repositorio de Libros en sus paginas
    subitems: [
      {
        id: "algebra-lineal",
        texto: "Álgebra Lineal",
        href: "contenido/repositorio_libros/rl_algebralineal.html"
      },
      {
        id: "analisis-complejo",
        texto: "Análisis Complejo",
        href: "#"
      },
      {
        id: "analisis-funcional",
        texto: "Análisis Funcional",
        href: "#"
      },
      {
        id: "calculo-una-variable",
        texto: "Cálculo en 1 variable",
        href: "#"
      },
      {
        id: "calculo-vectorial",
        texto: "Cálculo vectorial",
        href: "#"
      },
      {
        id: "edo",
        texto: "EDO",
        href: "#"
      },
      {
        id: "edp",
        texto: "EDP",
        href: "#"
      },
      {
        id: "electrodinamica-clasica",
        texto: "Electrodinámica Clásica",
        href: "#"
      },
      {
        id: "estadistica-probabilidad",
        texto: "Estadística y Probabilidad",
        href: "#"
      },
      {
        id: "estado-solido",
        texto: "Estado Sólido",
        href: "#"
      },
      {
        id: "fisica-atomica",
        texto: "Física Atómica",
        href: "#"
      },
      {
        id: "fisica-molecular",
        texto: "Física Molecular",
        href: "#"
      },
      {
        id: "fisica-nuclear",
        texto: "Física Nuclear",
        href: "#"
      },
      {
        id: "fisica-termica",
        texto: "Física Térmica",
        href: "#"
      },
      {
        id: "instrumentacion-arduino",
        texto: "Instrumentación con Arduino",
        href: "#"
      },
      {
        id: "mecanica-clasica",
        texto: "Mecánica Clásica",
        href: "#"
      },
      {
        id: "mecanica-cuantica",
        texto: "Mecánica Cuántica",
        href: "#"
      },
      {
        id: "mecanica-estadistica",
        texto: "Mecánica Estadística",
        href: "#"
      },
      {
        id: "mecanica-newtoniana-libros",
        texto: "Mecánica Newtoniana",
        href: "#"
      },
      {
        id: "metodos-fisica",
        texto: "Métodos para la Física",
        href: "#"
      },
      {
        id: "optica",
        texto: "Óptica",
        href: "#"
      },
      {
        id: "oscilaciones-ondas",
        texto: "Oscilaciones y Ondas",
        href: "#"
      },
      {
        id: "quimica-general",
        texto: "Química General",
        href: "#"
      },
      {
        id: "radiaciones-ionizantes",
        texto: "Radiaciones Ionizantes",
        href: "#"
      },
      {
        id: "relatividad-fisica-cuantica",
        texto: "Relatividad y Física Cuántica",
        href: "#"
      },
      {
        id: "sistemas-complejos",
        texto: "Sistemas Complejos",
        href: "#"
      },
      {
        id: "astrofisica-galactica",
        texto: "Astrofísica Galáctica",
        href: "#"
      }
    ]
  },
  {
    id: "hoja-vida",
    texto: "Hoja de vida",
    clase: "menu-hoja-vida",
    href: "contenido/autores/autores.html",
    // CODEX: añadido para reutilizar los subitems de Hoja de vida en sus paginas
    subitems: [
      {
        id: "chari-fernando",
        texto: "Chari Castillo Fernando",
        href: "contenido/autores/Autor_1.html"
      },
      {
        id: "chari-erick",
        texto: "Chari Castillo Erick",
        href: "#"
      }
    ]
  }
];
