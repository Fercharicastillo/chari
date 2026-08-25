export type RectanguloEscena = {
  left: number;
  top: number;
  width: number;
  zIndex: number;
};

export const LIENZO_LABORATORIO = {
  width: 2339.19,
  height: 986.38,
} as const;

/** Referencias medidas directamente en los viewBox de los SVG. */
export const REFERENCIAS_INSTRUMENTOS = {
  regla: {
    anchoViewBox: 223.03,
    yCienCentimetros: 67,
    yCeroCentimetros: 1796.18,
    altoViewBox: 2050.52,
    ejeSenaladoresX: 125,
  },
  soporte: {
    anchoViewBox: 473.32,
    ejeRielX: 245,
  },
  disparador: {
    anchoViewBox: 451.26,
    ejeRielX: 101,
    centroEsfera: { x: 244.35, y: 62.95 },
  },
  esfera: {
    diametroViewBox: 37.35,
    radioViewBox: 16.68,
  },
  platillo: {
    anchoViewBox: 350.75,
    ejeRielX: 82.86,
    contacto: { x: 210.46, y: 31.17 },
  },
  senaladorSuperior: {
    anchoViewBox: 276.58,
    ejeReglaX: 239,
    puntaY: 96.54,
  },
  senaladorInferior: {
    anchoViewBox: 274.01,
    ejeReglaX: 239,
    puntaY: 8.35,
  },
} as const;

const regla: RectanguloEscena = {
  left: 1430,
  top: 55,
  width: 98,
  zIndex: 1,
};

const soporte: RectanguloEscena = {
  left: 1068,
  top: 45,
  width: 190,
  zIndex: 2,
};

export const ALTURA_MONTAJE_INICIAL = 0.2;
export const ALTURA_MONTAJE_MINIMA = 0.2;
export const ALTURA_MONTAJE_MAXIMA = 0.5;

const ejeRielSoporte =
  soporte.left +
  (REFERENCIAS_INSTRUMENTOS.soporte.ejeRielX /
    REFERENCIAS_INSTRUMENTOS.soporte.anchoViewBox) *
    soporte.width;
const centroEsferaYInicial = 346;
const anchoDisparador = 240;
const escalaDisparador =
  anchoDisparador / REFERENCIAS_INSTRUMENTOS.disparador.anchoViewBox;
const disparador: RectanguloEscena = {
  left:
    ejeRielSoporte -
    REFERENCIAS_INSTRUMENTOS.disparador.ejeRielX * escalaDisparador,
  top:
    centroEsferaYInicial -
    REFERENCIAS_INSTRUMENTOS.disparador.centroEsfera.y * escalaDisparador,
  width: anchoDisparador,
  zIndex: 5,
};
const diametroEsfera =
  REFERENCIAS_INSTRUMENTOS.esfera.diametroViewBox * escalaDisparador;
const centroEsferaX =
  disparador.left +
  REFERENCIAS_INSTRUMENTOS.disparador.centroEsfera.x * escalaDisparador;
const centroEsferaY =
  disparador.top +
  REFERENCIAS_INSTRUMENTOS.disparador.centroEsfera.y * escalaDisparador;
const bordeInferiorEsfera =
  centroEsferaY +
  REFERENCIAS_INSTRUMENTOS.esfera.radioViewBox * escalaDisparador;

const escalaRegla = regla.width / REFERENCIAS_INSTRUMENTOS.regla.anchoViewBox;
const pixelesPorMetro =
  (REFERENCIAS_INSTRUMENTOS.regla.yCeroCentimetros -
    REFERENCIAS_INSTRUMENTOS.regla.yCienCentimetros) *
  escalaRegla;

const ejeRegla =
  regla.left + REFERENCIAS_INSTRUMENTOS.regla.ejeSenaladoresX * escalaRegla;

const anchoPlatillo = 170;
const escalaPlatillo =
  anchoPlatillo / REFERENCIAS_INSTRUMENTOS.platillo.anchoViewBox;
const contactoPlatilloY =
  bordeInferiorEsfera + ALTURA_MONTAJE_INICIAL * pixelesPorMetro;
const platillo: RectanguloEscena = {
  left:
    ejeRielSoporte -
    REFERENCIAS_INSTRUMENTOS.platillo.ejeRielX * escalaPlatillo,
  top:
    contactoPlatilloY -
    REFERENCIAS_INSTRUMENTOS.platillo.contacto.y * escalaPlatillo,
  width: anchoPlatillo,
  zIndex: 4,
};

const anchoSenaladores = 140;
const escalaSenaladorSuperior =
  anchoSenaladores / REFERENCIAS_INSTRUMENTOS.senaladorSuperior.anchoViewBox;
const escalaSenaladorInferior =
  anchoSenaladores / REFERENCIAS_INSTRUMENTOS.senaladorInferior.anchoViewBox;
const senaladorSuperior: RectanguloEscena = {
  left:
    ejeRegla -
    REFERENCIAS_INSTRUMENTOS.senaladorSuperior.ejeReglaX *
      escalaSenaladorSuperior,
  top:
    bordeInferiorEsfera -
    REFERENCIAS_INSTRUMENTOS.senaladorSuperior.puntaY * escalaSenaladorSuperior,
  width: anchoSenaladores,
  zIndex: 3,
};
const senaladorInferior: RectanguloEscena = {
  left:
    ejeRegla -
    REFERENCIAS_INSTRUMENTOS.senaladorInferior.ejeReglaX *
      escalaSenaladorInferior,
  top:
    contactoPlatilloY -
    REFERENCIAS_INSTRUMENTOS.senaladorInferior.puntaY * escalaSenaladorInferior,
  width: anchoSenaladores,
  zIndex: 3,
};

/** Montaje inicial correspondiente aproximadamente a una separación de 0,20 m. */
export const MONTAJE_ESTATICO = {
  soporte,
  regla,
  senaladorSuperior,
  senaladorInferior,
  disparador,
  esfera: {
    left: centroEsferaX - diametroEsfera / 2,
    top: centroEsferaY - diametroEsfera / 2,
    width: diametroEsfera,
    zIndex: 6,
  },
  platillo,
  timer44: {
    left: 560,
    top: 790,
    width: 420,
    zIndex: 3,
  },
} satisfies Record<string, RectanguloEscena>;

export type MontajeLaboratorio = typeof MONTAJE_ESTATICO;

const ceroReglaY =
  regla.top + REFERENCIAS_INSTRUMENTOS.regla.yCeroCentimetros * escalaRegla;

export const LECTURA_INFERIOR_INICIAL =
  (ceroReglaY - contactoPlatilloY) / pixelesPorMetro;
export const LECTURA_SUPERIOR_INICIAL =
  LECTURA_INFERIOR_INICIAL + ALTURA_MONTAJE_INICIAL;
export const LECTURA_INFERIOR_MINIMA = 0.05;
export const LECTURA_INFERIOR_MAXIMA = 0.5;
export const LECTURA_SUPERIOR_MINIMA = 0.25;
export const LECTURA_SUPERIOR_MAXIMA = 1;

export const POSICION_LECTURAS_REGLA_X = regla.left + regla.width + 28;

/** Coordenada vertical correspondiente a una lectura métrica de la regla. */
export function obtenerCoordenadaReglaParaLectura(lectura: number): number {
  return ceroReglaY - lectura * pixelesPorMetro;
}

export function limitarAlturaLaboratorio(altura: number): number {
  return Math.min(
    ALTURA_MONTAJE_MAXIMA,
    Math.max(ALTURA_MONTAJE_MINIMA, altura),
  );
}

export function obtenerLimitesLecturaSuperior(lecturaInferior: number) {
  return {
    minimo: Math.max(
      LECTURA_SUPERIOR_MINIMA,
      lecturaInferior + ALTURA_MONTAJE_MINIMA,
    ),
    maximo: Math.min(
      LECTURA_SUPERIOR_MAXIMA,
      lecturaInferior + ALTURA_MONTAJE_MAXIMA,
    ),
  };
}

export function obtenerLimitesLecturaInferior(lecturaSuperior: number) {
  return {
    minimo: Math.max(
      LECTURA_INFERIOR_MINIMA,
      lecturaSuperior - ALTURA_MONTAJE_MAXIMA,
    ),
    maximo: Math.min(
      LECTURA_INFERIOR_MAXIMA,
      lecturaSuperior - ALTURA_MONTAJE_MINIMA,
    ),
  };
}

export function limitarLecturaSuperior(
  lectura: number,
  lecturaInferior: number,
): number {
  const limites = obtenerLimitesLecturaSuperior(lecturaInferior);
  return Math.min(limites.maximo, Math.max(limites.minimo, lectura));
}

export function limitarLecturaInferior(
  lectura: number,
  lecturaSuperior: number,
): number {
  const limites = obtenerLimitesLecturaInferior(lecturaSuperior);
  return Math.min(limites.maximo, Math.max(limites.minimo, lectura));
}

/** Compone ambos conjuntos según sus lecturas independientes sobre la regla. */
export function crearMontajeParaLecturas(
  lecturaSuperior: number,
  lecturaInferior: number,
  distanciaCaida = 0,
): MontajeLaboratorio {
  const superiorLimitada = limitarLecturaSuperior(
    lecturaSuperior,
    lecturaInferior,
  );
  const inferiorLimitada = limitarLecturaInferior(
    lecturaInferior,
    superiorLimitada,
  );
  const altura = superiorLimitada - inferiorLimitada;
  const desplazamientoSuperiorY =
    (LECTURA_SUPERIOR_INICIAL - superiorLimitada) * pixelesPorMetro;
  const desplazamientoInferiorY =
    (LECTURA_INFERIOR_INICIAL - inferiorLimitada) * pixelesPorMetro;
  const distanciaLimitada = Math.min(altura, Math.max(0, distanciaCaida));

  return {
    ...MONTAJE_ESTATICO,
    senaladorSuperior: {
      ...MONTAJE_ESTATICO.senaladorSuperior,
      top: MONTAJE_ESTATICO.senaladorSuperior.top + desplazamientoSuperiorY,
    },
    disparador: {
      ...MONTAJE_ESTATICO.disparador,
      top: MONTAJE_ESTATICO.disparador.top + desplazamientoSuperiorY,
    },
    esfera: {
      ...MONTAJE_ESTATICO.esfera,
      top:
        MONTAJE_ESTATICO.esfera.top +
        desplazamientoSuperiorY +
        distanciaLimitada * pixelesPorMetro,
    },
    senaladorInferior: {
      ...MONTAJE_ESTATICO.senaladorInferior,
      top: MONTAJE_ESTATICO.senaladorInferior.top + desplazamientoInferiorY,
    },
    platillo: {
      ...MONTAJE_ESTATICO.platillo,
      top: MONTAJE_ESTATICO.platillo.top + desplazamientoInferiorY,
    },
  };
}

/**
 * Mueve verticalmente el conjunto superior sin alterar sus anclajes en x.
 * Una altura mayor desplaza el disparador hacia la parte alta de la regla.
 */
export function crearMontajeParaAltura(altura: number): MontajeLaboratorio {
  const alturaLimitada = limitarAlturaLaboratorio(altura);
  return crearMontajeParaLecturas(
    LECTURA_INFERIOR_INICIAL + alturaLimitada,
    LECTURA_INFERIOR_INICIAL,
  );
}

/**
 * Sitúa la esfera durante el ensayo sin alterar el resto del montaje.
 * La distancia se expresa desde su posición retenida y queda limitada por la
 * separación real entre la esfera y el platillo.
 */
export function crearMontajeParaCaida(
  altura: number,
  distanciaCaida: number,
): MontajeLaboratorio {
  const alturaLimitada = limitarAlturaLaboratorio(altura);
  return crearMontajeParaLecturas(
    LECTURA_INFERIOR_INICIAL + alturaLimitada,
    LECTURA_INFERIOR_INICIAL,
    distanciaCaida,
  );
}

export function obtenerCentroEsferaParaLectura(
  lecturaSuperior: number,
): number {
  const desplazamientoY =
    (LECTURA_SUPERIOR_INICIAL - lecturaSuperior) * pixelesPorMetro;
  return centroEsferaY + desplazamientoY;
}

export function calcularLecturaSuperiorDesdeCentroEsfera(
  centroEsferaEscena: number,
): number {
  return (
    LECTURA_SUPERIOR_INICIAL +
    (centroEsferaY - centroEsferaEscena) / pixelesPorMetro
  );
}

export function obtenerContactoPlatilloParaLectura(
  lecturaInferior: number,
): number {
  const desplazamientoY =
    (LECTURA_INFERIOR_INICIAL - lecturaInferior) * pixelesPorMetro;
  return contactoPlatilloY + desplazamientoY;
}

export function calcularLecturaInferiorDesdeContactoPlatillo(
  contactoEscena: number,
): number {
  return (
    LECTURA_INFERIOR_INICIAL +
    (contactoPlatilloY - contactoEscena) / pixelesPorMetro
  );
}

export function obtenerCentroEsferaParaAltura(altura: number): number {
  const montaje = crearMontajeParaAltura(altura);
  const radioEsfera = montaje.esfera.width / 2;
  return montaje.esfera.top + radioEsfera;
}

/** Convierte una coordenada vertical de la escena en metros de separación. */
export function calcularAlturaDesdeCentroEsfera(
  centroEsferaEscena: number,
): number {
  const centroInicial =
    MONTAJE_ESTATICO.esfera.top + MONTAJE_ESTATICO.esfera.width / 2;
  const altura =
    ALTURA_MONTAJE_INICIAL +
    (centroInicial - centroEsferaEscena) / pixelesPorMetro;

  return limitarAlturaLaboratorio(altura);
}

export function convertirRectanguloAPorcentajes(rectangulo: RectanguloEscena) {
  return {
    left: `${(rectangulo.left / LIENZO_LABORATORIO.width) * 100}%`,
    top: `${(rectangulo.top / LIENZO_LABORATORIO.height) * 100}%`,
    width: `${(rectangulo.width / LIENZO_LABORATORIO.width) * 100}%`,
    zIndex: rectangulo.zIndex,
  };
}
