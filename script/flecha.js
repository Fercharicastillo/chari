addEventListener('DOMContentLoaded', () => {
    const botonesFlotantes = [];

    const obtenerPixelesInicio = () => document.documentElement.scrollTop || document.body.scrollTop;

    const irArriba = () => {
        const inicio = obtenerPixelesInicio();
        const duracion = 1000; // Duración en milisegundos (2 segundos)
        const incremento = inicio / (duracion / 20); // Incremento por fotograma

        const animacion = () => {
            const posicion = obtenerPixelesInicio();
            if (posicion > 0) {
                scrollTo(0, posicion - incremento);
                requestAnimationFrame(animacion);
            }
        };

        animacion();
    };

    // CODEX: modificado para registrar botones flotantes que aparecen con el mismo scroll
    const registrarBotonFlotante = (boton, accionClick) => {
        if (!boton) return;

        botonesFlotantes.push(boton);

        if (typeof accionClick === 'function') {
            boton.addEventListener('click', accionClick);
        }
    };

    const indicadorScroll = () => {
        const debeMostrarse = obtenerPixelesInicio() > 200;

        botonesFlotantes.forEach(boton => {
            boton.classList.toggle('mostrar', debeMostrarse);
        });
    };

    registrarBotonFlotante(document.querySelector('#btn-top'), irArriba);

    document.querySelectorAll('[data-floating-scroll]').forEach(boton => {
        registrarBotonFlotante(boton);
    });

    window.addEventListener('scroll', indicadorScroll);
    indicadorScroll();
});