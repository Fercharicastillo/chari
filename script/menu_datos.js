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
    texto: "Repositorio de Clases",
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
    texto: "Repositorio de Documentos",
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
        id: "electromagnetismo",
        texto: "Electromagnetismo",
        href: "contenido/repositorio_libros/rl_electromagnetismo.html"
      },
      {
        id: "fisica-moderna",
        texto: "Física Moderna",
        href: "contenido/repositorio_libros/rl_fisicamoderna.html"
      },
      {
        id: "matematicas-discretas",
        texto: "Matemáticas Discretas",
        href: "contenido/repositorio_libros/rl_matematicasdiscretas.html"
      },
      {
        id: "termodinamica",
        texto: "Termodinámica",
        href: "contenido/repositorio_libros/rl_termodinamica.html"
      }
    ]
  },
  {
    id: "hoja-vida",
    texto: "Autores",
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
