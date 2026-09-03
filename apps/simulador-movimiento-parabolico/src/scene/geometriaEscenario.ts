export type RectanguloEscena = {
  left: number;
  top: number;
  width: number;
  zIndex: number;
};

export const LIENZO_PARABOLICO = {
  width: 1200,
  height: 500,
  inicioMesaTrabajoY: 388,
  baseInstrumentosY: 472,
} as const;

/** Referencias tomadas directamente de los viewBox creados en Illustrator. */
export const REFERENCIAS_MONTAJE = {
  soporte: {
    ancho: 1479.58,
    alto: 927.76,
  },
  transportador: {
    ancho: 1340.91,
    alto: 1002.59,
    pivote: { x: 670.455, y: 0 },
  },
  dispositivo: {
    ancho: 911.14,
    alto: 1080.09,
    salida: { x: 666.48, y: 401.86 },
  },
  mesaSuperior: {
    ancho: 2268.82,
    alto: 404.75,
    /**
     * Zona del SVG que representa realmente la cara superior del tablero.
     * El viewBox también contiene los cantos, las patas extensibles y pequeños
     * márgenes transparentes que no deben aceptar impactos.
     */
    superficie: {
      // Extremos de la zona encerrada por el trazado rojo del SVG.
      inicioX: 40.09,
      finX: 2247.8,
      y: 92,
    },
  },
  mesaPatas: {
    ancho: 2173.16,
    alto: 481.94,
  },
  regla: {
    ancho: 223.03,
    alto: 2050.52,
    yCienCentimetros: 67,
    yCeroCentimetros: 1796.18,
    ejeSenaladoresX: 125,
  },
  reglaHorizontal: {
    ancho: 3456.43,
    alto: 87.79,
    longitudMetros: 2,
  },
  senaladorSuperior: {
    ancho: 276.58,
    alto: 103.14,
    ejeReglaX: 239,
    puntaY: 96.54,
  },
  senaladorInferior: {
    ancho: 274.01,
    alto: 102.2,
    ejeReglaX: 239,
    puntaY: 8.35,
  },
} as const;

export const ALTURA_MESA = 0.64;
export const ALTURA_SALIDA_INICIAL = ALTURA_MESA;
export const DESPLAZAMIENTO_PROFUNDIDAD_Y = {
  conjuntoBalistico: -20,
  mesa: 10,
} as const;

/**
 * Compensa la separación vertical introducida por la perspectiva para que una
 * mesa de 0,64 m coincida visualmente con una salida situada a 0,64 m.
 */
export const CORRECCION_ALINEACION_MESA_Y = -30;
export const DESPLAZAMIENTO_VISUAL_MESA_Y =
  DESPLAZAMIENTO_PROFUNDIDAD_Y.mesa + CORRECCION_ALINEACION_MESA_Y;

const SOPORTE_WIDTH_REFERENCIA = 420;
const soporteLeft = 225;
const soporteWidth = 260;
export const SEPARACION_SOPORTE_MESA = 50;
const mesaWidth = 440;
export const POSICION_MESA_INICIAL_X =
  soporteLeft + soporteWidth + SEPARACION_SOPORTE_MESA;
export const ANCHO_MESA_ESCENA = mesaWidth;
const reglaWidth = 20;
/** Mantiene la punta izquierda de ambos señaladores en el borde del tablero. */
const anchoSenaladores = reglaWidth * 1.8;
const desplazamientoPuntaSenalador =
  REFERENCIAS_MONTAJE.senaladorSuperior.ejeReglaX *
  (anchoSenaladores / REFERENCIAS_MONTAJE.senaladorSuperior.ancho);
const desplazamientoEjeRegla =
  REFERENCIAS_MONTAJE.regla.ejeSenaladoresX *
  (reglaWidth / REFERENCIAS_MONTAJE.regla.ancho);
const puntaMesaInicialX = POSICION_MESA_INICIAL_X + mesaWidth;

const regla: RectanguloEscena = {
  left:
    puntaMesaInicialX + desplazamientoPuntaSenalador - desplazamientoEjeRegla,
  top:
    LIENZO_PARABOLICO.baseInstrumentosY -
    (REFERENCIAS_MONTAJE.regla.alto / REFERENCIAS_MONTAJE.regla.ancho) *
      reglaWidth,
  width: reglaWidth,
  zIndex: 6,
};

const escalaRegla = regla.width / REFERENCIAS_MONTAJE.regla.ancho;
export const PIXELES_POR_METRO =
  (REFERENCIAS_MONTAJE.regla.yCeroCentimetros -
    REFERENCIAS_MONTAJE.regla.yCienCentimetros) *
  escalaRegla;
export const PIXELES_POR_METRO_HORIZONTAL = 300;
const ceroReglaY =
  regla.top + REFERENCIAS_MONTAJE.regla.yCeroCentimetros * escalaRegla;

const soporteHeight =
  (REFERENCIAS_MONTAJE.soporte.alto / REFERENCIAS_MONTAJE.soporte.ancho) *
  soporteWidth;
const soporte: RectanguloEscena = {
  left: soporteLeft,
  top:
    LIENZO_PARABOLICO.baseInstrumentosY -
    soporteHeight +
    DESPLAZAMIENTO_PROFUNDIDAD_Y.conjuntoBalistico,
  width: soporteWidth,
  zIndex: 2,
};

export const ALTURA_PISO_LABORATORIO = 0;
/**
 * Base visual en la que descansan los instrumentos. No coincide con la marca
 * cero de la regla porque tanto la regla como las patas incluyen bases que se
 * prolongan por debajo de esa lectura.
 */
export const SUPERFICIE_PISO_Y = LIENZO_PARABOLICO.baseInstrumentosY;

const mesaSuperiorReferencia: RectanguloEscena = {
  left: POSICION_MESA_INICIAL_X,
  top: obtenerCoordenadaYParaAltura(ALTURA_MESA),
  width: mesaWidth,
  zIndex: 3,
};

const escalaMesa = mesaWidth / REFERENCIAS_MONTAJE.mesaSuperior.ancho;
const mesaSuperiorHeight = REFERENCIAS_MONTAJE.mesaSuperior.alto * escalaMesa;
const superficieMesaInicioX =
  REFERENCIAS_MONTAJE.mesaSuperior.superficie.inicioX * escalaMesa;
const superficieMesaFinX =
  REFERENCIAS_MONTAJE.mesaSuperior.superficie.finX * escalaMesa;
const superficieMesaDesplazamientoY =
  REFERENCIAS_MONTAJE.mesaSuperior.superficie.y * escalaMesa;
const patasWidth = REFERENCIAS_MONTAJE.mesaPatas.ancho * escalaMesa;
const patasHeight = REFERENCIAS_MONTAJE.mesaPatas.alto * escalaMesa;
const mesaPatasReferencia: RectanguloEscena = {
  left: POSICION_MESA_INICIAL_X + (mesaWidth - patasWidth) / 2,
  top: SUPERFICIE_PISO_Y - patasHeight,
  width: patasWidth,
  zIndex: 4,
};

const SOLAPE_MINIMO_PATAS = 20;
const redondearCentimetros = (altura: number) => Math.round(altura * 100) / 100;
const ALTURA_MESA_MINIMA_GEOMETRICA = redondearCentimetros(
  obtenerAlturaDesdeCoordenadaY(mesaPatasReferencia.top),
);
/**
 * La mesa parte alineada con la esfera. Aunque los SVG admiten retraer más el
 * tablero, esa zona no representa una configuración válida del mecanismo.
 */
export const ALTURA_MESA_MINIMA = Math.max(
  ALTURA_MESA,
  ALTURA_MESA_MINIMA_GEOMETRICA,
);
export const ALTURA_MESA_MAXIMA = redondearCentimetros(
  obtenerAlturaDesdeCoordenadaY(
    mesaPatasReferencia.top - mesaSuperiorHeight + SOLAPE_MINIMO_PATAS,
  ),
);

const POSICION_RELATIVA_PIVOTE = 0.48;
const pivoteMontajeX = soporte.left + soporte.width * POSICION_RELATIVA_PIVOTE;
export const POSICION_SALIDA_INICIAL_X = pivoteMontajeX;
/** Conserva la proporción aprobada del conjunto móvil dentro del soporte. */
const ESCALA_CONJUNTO_BALISTICO =
  0.82 * (soporteWidth / SOPORTE_WIDTH_REFERENCIA);
const transportadorWidth = 260 * ESCALA_CONJUNTO_BALISTICO;
const dispositivoWidth = 150 * ESCALA_CONJUNTO_BALISTICO;
export function obtenerLimitesAlcanceMesa(
  posicionMesaX: number,
  desplazamientoConjuntoX = 0,
) {
  const posicionSalidaX = pivoteMontajeX + desplazamientoConjuntoX;
  const posicionMesaEfectivaX = limitarPosicionMesaX(
    posicionMesaX,
    desplazamientoConjuntoX,
  );
  return {
    minimo: Math.max(
      0,
      (posicionMesaEfectivaX + superficieMesaInicioX - posicionSalidaX) /
        PIXELES_POR_METRO_HORIZONTAL,
    ),
    maximo:
      (posicionMesaEfectivaX + superficieMesaFinX - posicionSalidaX) /
      PIXELES_POR_METRO_HORIZONTAL,
  };
}

export function limitarPosicionMesaX(
  posicionMesaX: number,
  desplazamientoConjuntoX = 0,
): number {
  const margenEscena = 20;
  const limiteIzquierdo =
    soporte.left + soporte.width + desplazamientoConjuntoX;
  return Math.min(
    LIENZO_PARABOLICO.width - mesaWidth - margenEscena,
    Math.max(limiteIzquierdo, posicionMesaX),
  );
}

export function limitarAlturaMesa(altura: number): number {
  return Math.min(ALTURA_MESA_MAXIMA, Math.max(ALTURA_MESA_MINIMA, altura));
}

/** Convierte una lectura vertical de la regla, expresada en metros, a la escena. */
export function obtenerCoordenadaYParaAltura(altura: number): number {
  return ceroReglaY - altura * PIXELES_POR_METRO;
}

export function obtenerAlturaDesdeCoordenadaY(coordenadaY: number): number {
  return (ceroReglaY - coordenadaY) / PIXELES_POR_METRO;
}

export function convertirDistanciaMetrosAPixeles(distancia: number): number {
  return distancia * PIXELES_POR_METRO_HORIZONTAL;
}

function crearSenalador(
  tipo: "superior" | "inferior",
  coordenadaY: number,
): RectanguloEscena {
  const referencia =
    tipo === "superior"
      ? REFERENCIAS_MONTAJE.senaladorSuperior
      : REFERENCIAS_MONTAJE.senaladorInferior;
  const escala = anchoSenaladores / referencia.ancho;

  return {
    left: puntaMesaInicialX,
    top: coordenadaY - referencia.puntaY * escala,
    width: anchoSenaladores * 0.8,
    zIndex: 7,
  };
}

export function crearGeometriaEscenario(
  alturaSalida: number,
  alturaMesa = ALTURA_MESA,
  posicionMesaX = POSICION_MESA_INICIAL_X,
  desplazamientoConjuntoX = 0,
  desplazamientoConjuntoY = 0,
) {
  const alturaMesaLimitada = limitarAlturaMesa(alturaMesa);
  const posicionMesaLimitadaX = limitarPosicionMesaX(
    posicionMesaX,
    desplazamientoConjuntoX,
  );
  const desplazamientoMesaX = posicionMesaLimitadaX - POSICION_MESA_INICIAL_X;
  const salidaFisicaY = obtenerCoordenadaYParaAltura(alturaSalida);
  const mesaFisicaTop = obtenerCoordenadaYParaAltura(alturaMesaLimitada);
  const salidaY =
    salidaFisicaY + DESPLAZAMIENTO_PROFUNDIDAD_Y.conjuntoBalistico;
  const salidaX = pivoteMontajeX + desplazamientoConjuntoX;
  const mesaTop = mesaFisicaTop + DESPLAZAMIENTO_VISUAL_MESA_Y;
  const escalaTransportador =
    transportadorWidth / REFERENCIAS_MONTAJE.transportador.ancho;
  const escalaDispositivo =
    dispositivoWidth / REFERENCIAS_MONTAJE.dispositivo.ancho;

  const transportador: RectanguloEscena = {
    left:
      salidaX -
      REFERENCIAS_MONTAJE.transportador.pivote.x * escalaTransportador,
    top:
      salidaY -
      REFERENCIAS_MONTAJE.transportador.pivote.y * escalaTransportador,
    width: transportadorWidth,
    zIndex: 3,
  };
  const dispositivo: RectanguloEscena = {
    left:
      salidaX - REFERENCIAS_MONTAJE.dispositivo.salida.x * escalaDispositivo,
    top: salidaY - REFERENCIAS_MONTAJE.dispositivo.salida.y * escalaDispositivo,
    width: dispositivoWidth,
    zIndex: 5,
  };
  const mesaSuperior: RectanguloEscena = {
    ...mesaSuperiorReferencia,
    left: posicionMesaLimitadaX,
    top: mesaTop,
  };
  const reglaHorizontalWidth =
    REFERENCIAS_MONTAJE.reglaHorizontal.longitudMetros *
    PIXELES_POR_METRO_HORIZONTAL;
  const reglaHorizontalHeight =
    (REFERENCIAS_MONTAJE.reglaHorizontal.alto /
      REFERENCIAS_MONTAJE.reglaHorizontal.ancho) *
    reglaHorizontalWidth;
  const reglaHorizontal: RectanguloEscena = {
    left: salidaX,
    top: mesaTop - reglaHorizontalHeight + 2,
    width: reglaHorizontalWidth,
    zIndex: 8,
  };
  const mesaPatas: RectanguloEscena = {
    ...mesaPatasReferencia,
    left: mesaPatasReferencia.left + desplazamientoMesaX,
    top: mesaPatasReferencia.top + DESPLAZAMIENTO_VISUAL_MESA_Y,
  };
  /*
   * Los señaladores representan los extremos del desnivel, no instrumentos
   * asignados permanentemente a la salida o a la mesa. En coordenadas de
   * pantalla, el menor valor de Y corresponde a la lectura superior.
   */
  const lecturaSuperiorY = Math.min(salidaFisicaY, mesaFisicaTop);
  const lecturaInferiorY = Math.max(salidaFisicaY, mesaFisicaTop);

  return {
    soporte: {
      ...soporte,
      left: soporte.left + desplazamientoConjuntoX,
      top: soporte.top + desplazamientoConjuntoY,
    },
    transportador,
    dispositivo,
    mesaSuperior,
    mesaPatas,
    regla,
    reglaHorizontal,
    senaladorSuperior: crearSenalador("superior", lecturaSuperiorY),
    senaladorInferior: crearSenalador("inferior", lecturaInferiorY),
    salida: {
      x: salidaX,
      y: salidaY,
    },
    superficieMesa: {
      left: posicionMesaLimitadaX + superficieMesaInicioX,
      right: posicionMesaLimitadaX + superficieMesaFinX,
      y: mesaTop + superficieMesaDesplazamientoY,
    },
    superficieMesaY: mesaTop + superficieMesaDesplazamientoY,
    alturaSalida,
    alturaMesa: alturaMesaLimitada,
    posicionMesaX: posicionMesaLimitadaX,
  };
}

export function convertirRectanguloAPorcentajes(rectangulo: RectanguloEscena) {
  return {
    left: `${(rectangulo.left / LIENZO_PARABOLICO.width) * 100}%`,
    top: `${(rectangulo.top / LIENZO_PARABOLICO.height) * 100}%`,
    width: `${(rectangulo.width / LIENZO_PARABOLICO.width) * 100}%`,
    zIndex: rectangulo.zIndex,
  };
}
