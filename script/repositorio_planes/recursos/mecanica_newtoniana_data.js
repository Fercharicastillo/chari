/*
|--------------------------------------------------------------------------
| Recursos de Mecanica Newtoniana
|--------------------------------------------------------------------------
| Cada objeto representa un capitulo del repositorio con sus subtemas.
| btns_repositorios.js unicamente leera esta informacion.
|--------------------------------------------------------------------------
*/

// CODEX: modificado para organizar los recursos por capitulos y permitir registro compartido de contadores
var recursosCapitulos = [
    {
        nombre: "Cinematica en 1 y 3 dimensiones",
        capitulonumber: "1",
        carpeta: "capitulo_1",
        pdfGeneral: "Capitulo_1_Cinematica_en_y_3_dimensiones.pdf",
        videoPlaylist: "https://www.youtube.com/watch?v=75xi6aasdw4&list=PLeySRPnY35dF7yGgUKWV2L-03TK1TlBNY",
        subtemas: [
            {
                nombre: "Movimiento Rectilineo Uniforme",
                evaluacion: "cinematica_mru",
                pdf: "1.1_movimiento_rectilineo_uniforme.pdf",
                video: "https://youtu.be/ylErHxQjodw?si=wTFq1rUxeyG_qtLq",
                simulador: "../simuladores/sim_mru.html"
            },
            {
                nombre: "Movimiento Rectilineo Uniformemente Variado",
                evaluacion: "cinematica_mruv",
                pdf: "1.2_movimiento_rectilineo_uniforme_variado.pdf",
                video: "https://www.youtube.com/watch?v=_HVgknQ1CXQ",
                simulador: ""
            },
            {
                nombre: "Movimiento de Proyectiles",
                evaluacion: "cinematica_movimiento_parabolico",
                pdf: "1.3_movimiento_de_proyectiles.pdf",
                video: "https://www.youtube.com/watch?v=vFMHr1Jg8IA",
                simulador: ""
            }
        ]
    },
    {
        nombre: "Dinamica Traslacional y Rotacional",
        capitulonumber: "2",
        carpeta: "capitulo_2",
        pdfGeneral: "Capitulo_2_Dinamica_Traslacional_y_Rotacional.pdf",
        videoPlaylist: "https://www.youtube.com/watch?v=0WNWab2b5jU&list=PLRenu6lMxFiLyoy7VGtQ1oZxjO-9Z666g",
        subtemas: []
    },
    {
        nombre: "Estatica",
        capitulonumber: "3",
        carpeta: "capitulo_3",
        pdfGeneral: "Capitulo_3_Estatica.pdf",
        videoPlaylist: "",
        subtemas: []
    },
    {
        nombre: "Trabajo y Energia",
        capitulonumber: "4",
        carpeta: "capitulo_4",
        pdfGeneral: "Capitulo_4_Trabajo_y_Energia.pdf",
        videoPlaylist: "",
        subtemas: []
    },
    {
        nombre: "Gravitacion",
        capitulonumber: "5",
        carpeta: "capitulo_5",
        pdfGeneral: "Capitulo_5_Gravitacion.pdf",
        videoPlaylist: "",
        subtemas: []
    },
    {
        nombre: "Movimiento Oscilatorio",
        capitulonumber: "6",
        carpeta: "capitulo_6",
        pdfGeneral: "Capitulo_6_Movimiento_Oscilatorio.pdf",
        videoPlaylist: "",
        subtemas: []
    },
    {
        nombre: "Fluidos",
        capitulonumber: "7",
        carpeta: "capitulo_7",
        pdfGeneral: "Capitulo_7_Fluidos.pdf",
        videoPlaylist: "",
        subtemas: []
    }
];

const recursos = recursosCapitulos.flatMap((capitulo) =>
  capitulo.subtemas.map((recurso) => ({
    ...recurso,
    capituloNombre: capitulo.nombre,
    pdfGeneral: capitulo.pdfGeneral,
    videoPlaylist: capitulo.videoPlaylist
  }))
);
// CODEX: añadido para registrar este repositorio y permitir contadores automaticos en repositorio_planes.html
window.PhysikosRecursosPlanes = window.PhysikosRecursosPlanes || {};
window.PhysikosRecursosPlanes["mecanica-newtoniana"] = recursosCapitulos;

