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
    id: "proyectos",
    texto: "Aplicaciones",
    clase: "menu-proyectos",
    href: "contenido/proyectos/proyectos.html",
    // CODEX: modificado para reunir las aplicaciones actuales y futuras de Physikos
    subitems: [
      {
        id: "examenes-aleatorios",
        texto: "Generador de Exámenes",
        href: "https://fercharicastillo.github.io/generador-examenes-physikos/"
      },
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
    // CODEX: restaurado para mantener los documentos breves separados de los libros editoriales
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
