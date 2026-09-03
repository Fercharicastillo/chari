import {
  SimulatorSceneViewport,
  SimulatorTimer44,
  SimulatorZoomToolbar,
  useDraggableSceneItem,
  useZoomPanViewport,
  type SimulatorTimer44Phase,
} from "@physikos/simulator-ui";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import cuerpoPrueba from "../physics/assets/cuerpo-de-prueba.svg";
import dispositivoBalistico from "../physics/assets/dispositivo-balistico.svg";
import fondoLaboratorio from "../physics/assets/fondo-lanzamiento-de-proyectiles.svg";
import mesaInferiorPatas from "../physics/assets/mesa-inferior-patas.svg";
import mesaSuperior from "../physics/assets/mesa-supeior.svg";
import regla from "../physics/assets/regla.svg";
import reglaHorizontal from "../physics/assets/regla-horizontal.svg";
import senaladorInferior from "../physics/assets/senalador-inferior-regla.svg";
import senaladorSuperior from "../physics/assets/senalador-superior-regla.svg";
import soporteBalistico from "../physics/assets/soporte-dispositivo-balistico.svg";
import transportadorBalistico from "../physics/assets/transportador-dispositivo-balistico.svg";
import {
  calcularPosicion,
  type CondicionesImpacto,
  type ResultadoLanzamiento,
} from "../physics/movimientoParabolico";
import {
  DESPLAZAMIENTO_PROFUNDIDAD_Y,
  ALTURA_MESA,
  LIENZO_PARABOLICO,
  PIXELES_POR_METRO,
  POSICION_MESA_INICIAL_X,
  REFERENCIAS_MONTAJE,
  convertirRectanguloAPorcentajes,
  convertirDistanciaMetrosAPixeles,
  crearGeometriaEscenario,
  limitarAlturaMesa,
  limitarPosicionMesaX,
  obtenerCoordenadaYParaAltura,
} from "./geometriaEscenario";

export type ImpactoMesa = {
  id: number;
  alcance: number;
  desplazamientoDesdeBorde: number;
};

type EscenarioParabolicoProps = {
  condiciones: CondicionesImpacto;
  resultadoFisico: ResultadoLanzamiento;
  destinoImpacto: "mesa" | "piso";
  alturaMesa: number;
  posicionMesaX: number;
  desplazamientoConjuntoX: number;
  desplazamientoConjuntoY: number;
  tiempo: number;
  estado: "preparada" | "ejecutando" | "pausada" | "finalizada";
  mostrarRastro: boolean;
  mostrarImpactos: boolean;
  mostrarReglaHorizontal: boolean;
  mostrarReglaVertical: boolean;
  mostrarTimer44: boolean;
  impactosMesa: readonly ImpactoMesa[];
  reinicioCompletoId: number;
  interaccionBloqueada: boolean;
  onAlturaMesaChange: (altura: number) => void;
  onAnguloChange: (angulo: number) => void;
  onPosicionMesaXChange: (posicionX: number) => void;
  onDesplazamientoConjuntoXChange: (desplazamientoX: number) => void;
  onDesplazamientoConjuntoYChange: (desplazamientoY: number) => void;
  onReiniciarTimer: () => void;
};

type ArrastreMesa = {
  pointerId: number;
  clientX: number;
  clientY: number;
  posicionInicialX: number;
  alturaInicial: number;
};

type PosicionEscena = {
  left: number;
  top: number;
};

type DesplazamientoEscena = {
  x: number;
  y: number;
};

type ArrastreAnguloDispositivo = {
  pointerId: number;
  direccionInicial: number;
  anguloInicial: number;
};

type ArrastreSenaladorRegla = {
  pointerId: number;
  desfaseY: number;
};

type FocoZoom = "general" | "balistico" | "mesa" | "reglas" | "timer";

/**
 * El eje oscuro del dispositivo requiere 41,5° para quedar horizontal. La
 * calibración se mantiene separada de la escala para conservar un giro real
 * de un grado visual por cada grado indicado por el control.
 */
const ANGULO_DIBUJO_DISPOSITIVO = 41.5;
const ANGULO_MONTAJE_TRANSPORTADOR = 45;
const CORRECCION_APERTURA_TRANSPORTADOR = 5;
const ANCHO_RELATIVO_ESFERA_EN_DISPOSITIVO = 0.085;
const ANCHO_HUELLA_RELATIVO_ESFERA = 0.7;
const ALTO_HUELLA_RELATIVO_ESFERA = 0.25;
const INTERVALO_RASTRO_SEGUNDOS = 0.025;
const PASO_MESA_HORIZONTAL_TECLADO = 5;
const PASO_MESA_VERTICAL_TECLADO = 0.01;
const ANCHO_TIMER44 = 125;
const ALTO_TIMER44 = ANCHO_TIMER44 * (657.33 / 1473.28);
const PASO_TIMER_TECLADO = 10;
const PASO_REGLA_HORIZONTAL_TECLADO = 5;
const ALTO_MINIMO_AGARRE_REGLA = 24;
const TOLERANCIA_APOYO_REGLA = 14;
const SOLAPE_MINIMO_APOYO_REGLA = 20;
const PASO_REGLA_VERTICAL_TECLADO = 5;
const PASO_SENALADOR_REGLA_CM = 1;
/** Calibración visual: una lectura aparente de 70 cm corresponde a 64 cm. */
const FACTOR_ESCALA_VERTICAL_REGLA = 70 / 67.5;
const PASO_CONJUNTO_BALISTICO_TECLADO = 5;
const PASO_ANGULO_DISPOSITIVO = 1;
const NIVELES_ZOOM = [1, 2, 3] as const;
const POSICION_TIMER44_INICIAL: PosicionEscena = {
  left: 66,
  top: LIENZO_PARABOLICO.height - ALTO_TIMER44 - 10,
};

function EscenarioParabolico({
  condiciones,
  resultadoFisico,
  destinoImpacto,
  alturaMesa,
  posicionMesaX,
  desplazamientoConjuntoX,
  desplazamientoConjuntoY,
  tiempo,
  estado,
  mostrarRastro,
  mostrarImpactos,
  mostrarReglaHorizontal,
  mostrarReglaVertical,
  mostrarTimer44,
  impactosMesa,
  reinicioCompletoId,
  interaccionBloqueada,
  onAlturaMesaChange,
  onAnguloChange,
  onPosicionMesaXChange,
  onDesplazamientoConjuntoXChange,
  onDesplazamientoConjuntoYChange,
  onReiniciarTimer,
}: EscenarioParabolicoProps) {
  const arrastreMesaRef = useRef<ArrastreMesa | null>(null);
  const arrastreSenaladorSuperiorRef = useRef<ArrastreSenaladorRegla | null>(
    null,
  );
  const arrastreSenaladorInferiorRef = useRef<ArrastreSenaladorRegla | null>(
    null,
  );
  const arrastreAnguloDispositivoRef = useRef<ArrastreAnguloDispositivo | null>(
    null,
  );
  const [arrastrandoMesa, setArrastrandoMesa] = useState(false);
  const [reglaHorizontalSobreMesa, setReglaHorizontalSobreMesa] =
    useState(true);
  const [arrastrandoSenaladorSuperior, setArrastrandoSenaladorSuperior] =
    useState(false);
  const [arrastrandoSenaladorInferior, setArrastrandoSenaladorInferior] =
    useState(false);
  const [ajustandoAnguloDispositivo, setAjustandoAnguloDispositivo] =
    useState(false);
  const [desplazamientoReglaVertical, setDesplazamientoReglaVertical] =
    useState<DesplazamientoEscena>({ x: 0, y: 0 });
  const [lecturaSenaladorSuperiorCm, setLecturaSenaladorSuperiorCm] = useState(
    () => Math.min(100, Math.max(0, condiciones.alturaInicial * 100)),
  );
  const [lecturaSenaladorInferiorCm, setLecturaSenaladorInferiorCm] = useState(
    () => Math.min(100, Math.max(0, alturaMesa * 100)),
  );
  const [posicionTimer, setPosicionTimer] = useState(POSICION_TIMER44_INICIAL);
  const geometria = crearGeometriaEscenario(
    condiciones.alturaInicial,
    alturaMesa,
    posicionMesaX,
    desplazamientoConjuntoX,
    desplazamientoConjuntoY,
  );
  const [posicionReglaHorizontal, setPosicionReglaHorizontal] =
    useState<PosicionEscena>(() => ({
      left: geometria.reglaHorizontal.left,
      top: geometria.reglaHorizontal.top,
    }));
  const impactoX =
    resultadoFisico.alcance === null
      ? null
      : geometria.salida.x +
        convertirDistanciaMetrosAPixeles(resultadoFisico.alcance);
  const posicionImpactoIdeal =
    resultadoFisico.tiempoVuelo === null
      ? null
      : calcularPosicion(resultadoFisico.tiempoVuelo, condiciones);
  const alcanceIdeal =
    posicionImpactoIdeal === null
      ? null
      : posicionImpactoIdeal.x - condiciones.posicionHorizontalInicial;
  const factorAlcanceExperimental =
    resultadoFisico.alcance === null ||
    alcanceIdeal === null ||
    Math.abs(alcanceIdeal) < 1e-9
      ? 1
      : resultadoFisico.alcance / alcanceIdeal;
  const convertirDesplazamientoHorizontal = (distancia: number) =>
    convertirDistanciaMetrosAPixeles(distancia * factorAlcanceExperimental);
  const desplazamientoDestinoY =
    destinoImpacto === "mesa"
      ? geometria.superficieMesa.y -
        obtenerCoordenadaYParaAltura(condiciones.alturaImpacto)
      : 0;
  const obtenerDesplazamientoTrayectoriaY = (coordenadaX: number) => {
    if (impactoX === null || Math.abs(impactoX - geometria.salida.x) < 0.001) {
      return DESPLAZAMIENTO_PROFUNDIDAD_Y.conjuntoBalistico;
    }

    const progreso = Math.min(
      1,
      Math.max(
        0,
        (coordenadaX - geometria.salida.x) / (impactoX - geometria.salida.x),
      ),
    );
    return (
      DESPLAZAMIENTO_PROFUNDIDAD_Y.conjuntoBalistico +
      (desplazamientoDestinoY -
        DESPLAZAMIENTO_PROFUNDIDAD_Y.conjuntoBalistico) *
        progreso
    );
  };
  const impactoY =
    resultadoFisico.puntoImpacto === null
      ? null
      : obtenerCoordenadaYParaAltura(resultadoFisico.puntoImpacto.y) +
        desplazamientoDestinoY;
  const escalaDispositivo =
    geometria.dispositivo.width / REFERENCIAS_MONTAJE.dispositivo.ancho;
  const anchoProyectil =
    geometria.dispositivo.width * ANCHO_RELATIVO_ESFERA_EN_DISPOSITIVO;
  const anchoHuellaImpacto = anchoProyectil * ANCHO_HUELLA_RELATIVO_ESFERA;
  const altoHuellaImpacto = anchoProyectil * ALTO_HUELLA_RELATIVO_ESFERA;
  const origenTransportadorX =
    (REFERENCIAS_MONTAJE.transportador.pivote.x /
      REFERENCIAS_MONTAJE.transportador.ancho) *
    100;
  const origenTransportadorY =
    (REFERENCIAS_MONTAJE.transportador.pivote.y /
      REFERENCIAS_MONTAJE.transportador.alto) *
    100;
  const origenDispositivoX =
    REFERENCIAS_MONTAJE.dispositivo.salida.x * escalaDispositivo;
  const origenDispositivoY =
    REFERENCIAS_MONTAJE.dispositivo.salida.y * escalaDispositivo;
  const proyectilLiberado = estado !== "preparada";
  const posicionProyectil =
    estado === "finalizada" && resultadoFisico.puntoImpacto !== null
      ? resultadoFisico.puntoImpacto
      : calcularPosicion(tiempo, condiciones);
  const proyectilX =
    geometria.salida.x +
    convertirDesplazamientoHorizontal(
      posicionProyectil.x - condiciones.posicionHorizontalInicial,
    );
  const proyectilY =
    obtenerCoordenadaYParaAltura(posicionProyectil.y) +
    obtenerDesplazamientoTrayectoriaY(proyectilX);
  const marcasRastro =
    tiempo <= 0
      ? []
      : Array.from(
          {
            length: Math.floor(tiempo / INTERVALO_RASTRO_SEGUNDOS) + 1,
          },
          (_, indice) => {
            const tiempoMarca = indice * INTERVALO_RASTRO_SEGUNDOS;
            const posicionMarca = calcularPosicion(tiempoMarca, condiciones);
            const x =
              geometria.salida.x +
              convertirDesplazamientoHorizontal(
                posicionMarca.x - condiciones.posicionHorizontalInicial,
              );
            const y =
              obtenerCoordenadaYParaAltura(posicionMarca.y) +
              obtenerDesplazamientoTrayectoriaY(x);

            return { x, y };
          },
        );
  const faseTimer: SimulatorTimer44Phase =
    estado === "ejecutando"
      ? "midiendo"
      : estado === "pausada"
        ? "pausado"
        : estado === "finalizada"
          ? "registrado"
          : "esperando";
  const alturaVisualMesaSuperior =
    (REFERENCIAS_MONTAJE.mesaSuperior.alto /
      REFERENCIAS_MONTAJE.mesaSuperior.ancho) *
    geometria.mesaSuperior.width;
  const alturaVisualSoporte =
    (REFERENCIAS_MONTAJE.soporte.alto / REFERENCIAS_MONTAJE.soporte.ancho) *
    geometria.soporte.width;
  const alturaVisualTransportador =
    (REFERENCIAS_MONTAJE.transportador.alto /
      REFERENCIAS_MONTAJE.transportador.ancho) *
    geometria.transportador.width;
  const alturaVisualDispositivo =
    (REFERENCIAS_MONTAJE.dispositivo.alto /
      REFERENCIAS_MONTAJE.dispositivo.ancho) *
    geometria.dispositivo.width;
  const limitesGrupoBalistico = {
    left: Math.min(
      geometria.soporte.left,
      geometria.transportador.left,
      geometria.dispositivo.left,
    ),
    top: Math.min(
      geometria.soporte.top,
      geometria.transportador.top,
      geometria.dispositivo.top,
    ),
    right: Math.max(
      geometria.soporte.left + geometria.soporte.width,
      geometria.transportador.left + geometria.transportador.width,
      geometria.dispositivo.left + geometria.dispositivo.width,
    ),
    bottom: Math.max(
      geometria.soporte.top + alturaVisualSoporte,
      geometria.transportador.top + alturaVisualTransportador,
      geometria.dispositivo.top + alturaVisualDispositivo,
    ),
  };
  const alturaVisualReglaHorizontal =
    (REFERENCIAS_MONTAJE.reglaHorizontal.alto /
      REFERENCIAS_MONTAJE.reglaHorizontal.ancho) *
    geometria.reglaHorizontal.width;
  const alturaAgarreReglaHorizontal = Math.max(
    ALTO_MINIMO_AGARRE_REGLA,
    alturaVisualReglaHorizontal,
  );
  const posicionVisualReglaHorizontal: PosicionEscena = reglaHorizontalSobreMesa
    ? {
        left: posicionReglaHorizontal.left,
        top: geometria.reglaHorizontal.top,
      }
    : posicionReglaHorizontal;
  const escalaReglaVertical =
    geometria.regla.width / REFERENCIAS_MONTAJE.regla.ancho;
  const alturaReglaVerticalSinCalibrar =
    REFERENCIAS_MONTAJE.regla.alto * escalaReglaVertical;
  const alturaVisualReglaVertical =
    alturaReglaVerticalSinCalibrar * FACTOR_ESCALA_VERTICAL_REGLA;
  const ceroVisualReglaY =
    geometria.regla.top +
    REFERENCIAS_MONTAJE.regla.yCeroCentimetros * escalaReglaVertical;
  const topVisualReglaVertical =
    ceroVisualReglaY -
    REFERENCIAS_MONTAJE.regla.yCeroCentimetros *
      escalaReglaVertical *
      FACTOR_ESCALA_VERTICAL_REGLA;
  const crearGeometriaSenaladorManual = (
    tipo: "superior" | "inferior",
    lecturaCm: number,
  ) => {
    const referencia =
      tipo === "superior"
        ? REFERENCIAS_MONTAJE.senaladorSuperior
        : REFERENCIAS_MONTAJE.senaladorInferior;
    const geometriaReferencia =
      tipo === "superior"
        ? geometria.senaladorSuperior
        : geometria.senaladorInferior;
    const escalaSenalador = geometriaReferencia.width / referencia.ancho;
    const ejeReglaX =
      geometria.regla.left +
      REFERENCIAS_MONTAJE.regla.ejeSenaladoresX * escalaReglaVertical;
    const coordenadaLecturaY =
      ceroVisualReglaY -
      (lecturaCm / 100) *
        (REFERENCIAS_MONTAJE.regla.yCeroCentimetros -
          REFERENCIAS_MONTAJE.regla.yCienCentimetros) *
        escalaReglaVertical *
        FACTOR_ESCALA_VERTICAL_REGLA;

    return {
      ...geometriaReferencia,
      left: ejeReglaX - referencia.ejeReglaX * escalaSenalador,
      top: coordenadaLecturaY - referencia.puntaY * escalaSenalador,
    };
  };
  const geometriaSenaladorSuperior = crearGeometriaSenaladorManual(
    "superior",
    lecturaSenaladorSuperiorCm,
  );
  const geometriaSenaladorInferior = crearGeometriaSenaladorManual(
    "inferior",
    lecturaSenaladorInferiorCm,
  );
  const alturaVisualSenaladorSuperior =
    (REFERENCIAS_MONTAJE.senaladorSuperior.alto /
      REFERENCIAS_MONTAJE.senaladorSuperior.ancho) *
    geometriaSenaladorSuperior.width;
  const alturaVisualSenaladorInferior =
    (REFERENCIAS_MONTAJE.senaladorInferior.alto /
      REFERENCIAS_MONTAJE.senaladorInferior.ancho) *
    geometriaSenaladorInferior.width;
  const limitesGrupoReglaVertical = {
    left: Math.min(
      geometria.regla.left,
      geometriaSenaladorSuperior.left,
      geometriaSenaladorInferior.left,
    ),
    top: Math.min(
      topVisualReglaVertical,
      geometriaSenaladorSuperior.top,
      geometriaSenaladorInferior.top,
    ),
    right: Math.max(
      geometria.regla.left + geometria.regla.width,
      geometriaSenaladorSuperior.left + geometriaSenaladorSuperior.width,
      geometriaSenaladorInferior.left + geometriaSenaladorInferior.width,
    ),
    bottom: Math.max(
      topVisualReglaVertical + alturaVisualReglaVertical,
      geometriaSenaladorSuperior.top + alturaVisualSenaladorSuperior,
      geometriaSenaladorInferior.top + alturaVisualSenaladorInferior,
    ),
  };
  const senaladoresEnExtremos = [
    {
      geometria: crearGeometriaSenaladorManual("superior", 0),
      altura: alturaVisualSenaladorSuperior,
    },
    {
      geometria: crearGeometriaSenaladorManual("superior", 100),
      altura: alturaVisualSenaladorSuperior,
    },
    {
      geometria: crearGeometriaSenaladorManual("inferior", 0),
      altura: alturaVisualSenaladorInferior,
    },
    {
      geometria: crearGeometriaSenaladorManual("inferior", 100),
      altura: alturaVisualSenaladorInferior,
    },
  ];
  const limitesRecorridoReglaVertical = {
    left: Math.min(
      geometria.regla.left,
      ...senaladoresEnExtremos.map(({ geometria: elemento }) => elemento.left),
    ),
    top: Math.min(
      topVisualReglaVertical,
      ...senaladoresEnExtremos.map(({ geometria: elemento }) => elemento.top),
    ),
    right: Math.max(
      geometria.regla.left + geometria.regla.width,
      ...senaladoresEnExtremos.map(
        ({ geometria: elemento }) => elemento.left + elemento.width,
      ),
    ),
    bottom: Math.max(
      topVisualReglaVertical + alturaVisualReglaVertical,
      ...senaladoresEnExtremos.map(
        ({ geometria: elemento, altura }) => elemento.top + altura,
      ),
    ),
  };

  const focosZoomNoDisponibles: FocoZoom[] = [
    ...(!mostrarTimer44 ? (["timer"] as const) : []),
    ...(!mostrarReglaHorizontal && !mostrarReglaVertical
      ? (["reglas"] as const)
      : []),
  ];
  const {
    viewportRef: visorRef,
    sceneRef: escenaRef,
    zoom,
    activeFocus: focoZoom,
    isPanning: desplazandoVisor,
    canDecrease: puedeReducirZoom,
    canIncrease: puedeAumentarZoom,
    decreaseZoom: reducirZoom,
    increaseZoom: aumentarZoom,
    selectFocus: seleccionarFocoZoom,
    resetViewport: reiniciarVisor,
    sceneStyle: estiloEscena,
    viewportProps: propiedadesVisor,
  } = useZoomPanViewport<FocoZoom>({
    zoomLevels: NIVELES_ZOOM,
    initialFocus: "general",
    sceneSize: LIENZO_PARABOLICO,
    resolveFocusCenter: resolverCentroFoco,
    unavailableFocuses: focosZoomNoDisponibles,
    ignorePanSelector:
      "button, .projectile-scene__timer44-drag, input, label, output",
  });

  const {
    isDragging: arrastrandoTimer,
    cancelDrag: cancelarArrastreTimer,
    dragProps: propiedadesArrastreTimer,
  } = useDraggableSceneItem<HTMLDivElement>({
    position: { x: posicionTimer.left, y: posicionTimer.top },
    onPositionChange: ({ x, y }) => setPosicionTimer({ left: x, top: y }),
    getScenePosition: obtenerCoordenadasEscena,
    constrainPosition: ({ x, y }) => {
      const posicion = limitarPosicionTimer(x, y);
      return { x: posicion.left, y: posicion.top };
    },
    initialPosition: {
      x: POSICION_TIMER44_INICIAL.left,
      y: POSICION_TIMER44_INICIAL.top,
    },
    keyboardStep: PASO_TIMER_TECLADO,
    ignorePointerSelector: "button",
    keyboardTargetSelfOnly: true,
  });

  const {
    isDragging: arrastrandoReglaHorizontal,
    cancelDrag: cancelarArrastreReglaHorizontal,
    dragProps: propiedadesArrastreReglaHorizontal,
  } = useDraggableSceneItem<HTMLButtonElement>({
    position: {
      x: posicionVisualReglaHorizontal.left,
      y: posicionVisualReglaHorizontal.top,
    },
    onPositionChange: ({ x, y }) =>
      setPosicionReglaHorizontal({ left: x, top: y }),
    getScenePosition: obtenerCoordenadasEscena,
    constrainPosition: ({ x, y }) => {
      const posicion = limitarPosicionReglaHorizontal(x, y);
      return { x: posicion.left, y: posicion.top };
    },
    initialPosition: () => ({
      x: geometria.reglaHorizontal.left,
      y: geometria.reglaHorizontal.top,
    }),
    keyboardStep: PASO_REGLA_HORIZONTAL_TECLADO,
    disabled: interaccionBloqueada,
    onDragStart: ({ x, y }) => {
      setPosicionReglaHorizontal({ left: x, top: y });
      setReglaHorizontalSobreMesa(false);
    },
    onDragEnd: ({ x, y }) => {
      const solapeHorizontal =
        Math.min(
          x + geometria.reglaHorizontal.width,
          geometria.mesaSuperior.left + geometria.mesaSuperior.width,
        ) - Math.max(x, geometria.mesaSuperior.left);
      const cercaDeLaSuperficie =
        Math.abs(y - geometria.reglaHorizontal.top) <=
        TOLERANCIA_APOYO_REGLA;

      if (
        cercaDeLaSuperficie &&
        solapeHorizontal >= SOLAPE_MINIMO_APOYO_REGLA
      ) {
        setReglaHorizontalSobreMesa(true);
        return { x, y: geometria.reglaHorizontal.top };
      }
    },
    onKeyboardMove: (_posicion, tecla) => {
      if (tecla === "ArrowUp" || tecla === "ArrowDown") {
        setReglaHorizontalSobreMesa(false);
      }
    },
    onReset: () => setReglaHorizontalSobreMesa(true),
  });

  const {
    isDragging: arrastrandoReglaVertical,
    cancelDrag: cancelarArrastreReglaVertical,
    dragProps: propiedadesArrastreReglaVertical,
  } = useDraggableSceneItem<HTMLButtonElement>({
    position: desplazamientoReglaVertical,
    onPositionChange: setDesplazamientoReglaVertical,
    getScenePosition: obtenerCoordenadasEscena,
    constrainPosition: limitarDesplazamientoReglaVertical,
    initialPosition: { x: 0, y: 0 },
    keyboardStep: PASO_REGLA_VERTICAL_TECLADO,
    disabled: interaccionBloqueada,
  });

  const {
    isDragging: arrastrandoConjuntoBalistico,
    cancelDrag: cancelarArrastreConjuntoBalistico,
    dragProps: propiedadesArrastreConjuntoBalistico,
  } = useDraggableSceneItem<HTMLButtonElement>({
    position: {
      x: desplazamientoConjuntoX,
      y: desplazamientoConjuntoY,
    },
    onPositionChange: ({ x, y }) => {
      onDesplazamientoConjuntoXChange(x);
      onDesplazamientoConjuntoYChange(y);
    },
    getScenePosition: obtenerCoordenadasEscena,
    constrainPosition: limitarDesplazamientoConjuntoBalistico,
    initialPosition: { x: 0, y: 0 },
    keyboardStep: PASO_CONJUNTO_BALISTICO_TECLADO,
    disabled: interaccionBloqueada,
  });

  useEffect(() => {
    cancelarArrastreTimer();
    cancelarArrastreReglaHorizontal();
    cancelarArrastreReglaVertical();
    arrastreSenaladorSuperiorRef.current = null;
    arrastreSenaladorInferiorRef.current = null;
    cancelarArrastreConjuntoBalistico();
    arrastreAnguloDispositivoRef.current = null;
    setArrastrandoSenaladorSuperior(false);
    setArrastrandoSenaladorInferior(false);
    setAjustandoAnguloDispositivo(false);
    setReglaHorizontalSobreMesa(true);
    setPosicionTimer(POSICION_TIMER44_INICIAL);
    setPosicionReglaHorizontal({
      left: geometria.reglaHorizontal.left,
      top: geometria.reglaHorizontal.top,
    });
    setDesplazamientoReglaVertical({ x: 0, y: 0 });
    setLecturaSenaladorSuperiorCm(
      Math.min(100, Math.max(0, condiciones.alturaInicial * 100)),
    );
    setLecturaSenaladorInferiorCm(Math.min(100, Math.max(0, alturaMesa * 100)));
    reiniciarVisor();
  }, [reinicioCompletoId]);

  function resolverCentroFoco(foco: FocoZoom) {
    let centro: { x: number; y: number };
    if (foco === "balistico") {
      centro = {
        x: (limitesGrupoBalistico.left + limitesGrupoBalistico.right) / 2,
        y: (limitesGrupoBalistico.top + limitesGrupoBalistico.bottom) / 2,
      };
    } else if (foco === "mesa") {
      centro = {
        x: geometria.mesaSuperior.left + geometria.mesaSuperior.width / 2,
        y:
          (geometria.mesaSuperior.top + LIENZO_PARABOLICO.baseInstrumentosY) /
          2,
      };
    } else if (foco === "reglas") {
      const limitesReglas = [
        ...(mostrarReglaHorizontal
          ? [
              {
                left: posicionVisualReglaHorizontal.left,
                top: posicionVisualReglaHorizontal.top,
                right:
                  posicionVisualReglaHorizontal.left +
                  geometria.reglaHorizontal.width,
                bottom:
                  posicionVisualReglaHorizontal.top +
                  alturaVisualReglaHorizontal,
              },
            ]
          : []),
        ...(mostrarReglaVertical
          ? [
              {
                left:
                  limitesGrupoReglaVertical.left +
                  desplazamientoReglaVertical.x,
                top:
                  limitesGrupoReglaVertical.top + desplazamientoReglaVertical.y,
                right:
                  limitesGrupoReglaVertical.right +
                  desplazamientoReglaVertical.x,
                bottom:
                  limitesGrupoReglaVertical.bottom +
                  desplazamientoReglaVertical.y,
              },
            ]
          : []),
      ];
      if (limitesReglas.length === 0) {
        centro = {
          x: LIENZO_PARABOLICO.width / 2,
          y: LIENZO_PARABOLICO.height / 2,
        };
      } else {
        const izquierda = Math.min(
          ...limitesReglas.map((limite) => limite.left),
        );
        const derecha = Math.max(
          ...limitesReglas.map((limite) => limite.right),
        );
        const superior = Math.min(...limitesReglas.map((limite) => limite.top));
        const inferior = Math.max(
          ...limitesReglas.map((limite) => limite.bottom),
        );
        centro = { x: (izquierda + derecha) / 2, y: (superior + inferior) / 2 };
      }
    } else if (foco === "timer") {
      centro = {
        x: posicionTimer.left + ANCHO_TIMER44 / 2,
        y: posicionTimer.top + ALTO_TIMER44 / 2,
      };
    } else {
      centro = {
        x: LIENZO_PARABOLICO.width / 2,
        y: LIENZO_PARABOLICO.height / 2,
      };
    }
    return centro;
  }

  function obtenerCoordenadasEscena(clientX: number, clientY: number) {
    const escena = escenaRef.current;
    if (!escena) return null;

    const limites = escena.getBoundingClientRect();
    return {
      x: ((clientX - limites.left) / limites.width) * LIENZO_PARABOLICO.width,
      y: ((clientY - limites.top) / limites.height) * LIENZO_PARABOLICO.height,
    };
  }

  function limitarPosicionTimer(left: number, top: number): PosicionEscena {
    return {
      left: Math.min(
        LIENZO_PARABOLICO.width - ANCHO_TIMER44,
        Math.max(0, left),
      ),
      top: Math.min(
        LIENZO_PARABOLICO.height - ALTO_TIMER44,
        Math.max(LIENZO_PARABOLICO.inicioMesaTrabajoY, top),
      ),
    };
  }

  function limitarPosicionReglaHorizontal(
    left: number,
    top: number,
  ): PosicionEscena {
    return {
      left: Math.min(
        LIENZO_PARABOLICO.width - geometria.reglaHorizontal.width,
        Math.max(0, left),
      ),
      top: Math.min(
        LIENZO_PARABOLICO.height - alturaVisualReglaHorizontal,
        Math.max(0, top),
      ),
    };
  }

  function limitarDesplazamientoReglaVertical(
    desplazamiento: DesplazamientoEscena,
  ): DesplazamientoEscena {
    return {
      x: Math.min(
        LIENZO_PARABOLICO.width - limitesRecorridoReglaVertical.right,
        Math.max(-limitesRecorridoReglaVertical.left, desplazamiento.x),
      ),
      y: Math.min(
        LIENZO_PARABOLICO.height - limitesRecorridoReglaVertical.bottom,
        Math.max(-limitesRecorridoReglaVertical.top, desplazamiento.y),
      ),
    };
  }

  function limitarLecturaSenalador(
    tipo: "superior" | "inferior",
    lecturaCm: number,
  ) {
    const lecturaLimitada = Math.min(100, Math.max(0, lecturaCm));
    return tipo === "superior"
      ? Math.max(lecturaSenaladorInferiorCm, lecturaLimitada)
      : Math.min(lecturaSenaladorSuperiorCm, lecturaLimitada);
  }

  function iniciarArrastreSenalador(
    tipo: "superior" | "inferior",
    evento: PointerEvent<HTMLButtonElement>,
  ) {
    if (
      interaccionBloqueada ||
      (evento.pointerType === "mouse" && evento.button !== 0)
    ) {
      return;
    }

    const coordenadas = obtenerCoordenadasEscena(
      evento.clientX,
      evento.clientY,
    );
    if (!coordenadas) return;
    const geometriaSenalador =
      tipo === "superior"
        ? geometriaSenaladorSuperior
        : geometriaSenaladorInferior;
    const referencia =
      tipo === "superior"
        ? REFERENCIAS_MONTAJE.senaladorSuperior
        : REFERENCIAS_MONTAJE.senaladorInferior;
    const escalaSenalador = geometriaSenalador.width / referencia.ancho;
    const puntaY =
      geometriaSenalador.top +
      referencia.puntaY * escalaSenalador +
      desplazamientoReglaVertical.y;
    const arrastre = {
      pointerId: evento.pointerId,
      desfaseY: coordenadas.y - puntaY,
    };

    if (tipo === "superior") {
      arrastreSenaladorSuperiorRef.current = arrastre;
      setArrastrandoSenaladorSuperior(true);
    } else {
      arrastreSenaladorInferiorRef.current = arrastre;
      setArrastrandoSenaladorInferior(true);
    }
    evento.currentTarget.setPointerCapture(evento.pointerId);
    evento.preventDefault();
  }

  function moverSenalador(
    tipo: "superior" | "inferior",
    evento: PointerEvent<HTMLButtonElement>,
  ) {
    const arrastre =
      tipo === "superior"
        ? arrastreSenaladorSuperiorRef.current
        : arrastreSenaladorInferiorRef.current;
    if (!arrastre || arrastre.pointerId !== evento.pointerId) return;

    const coordenadas = obtenerCoordenadasEscena(
      evento.clientX,
      evento.clientY,
    );
    if (!coordenadas) return;
    const puntaY = coordenadas.y - arrastre.desfaseY;
    const lecturaCm =
      ((ceroVisualReglaY + desplazamientoReglaVertical.y - puntaY) /
        ((REFERENCIAS_MONTAJE.regla.yCeroCentimetros -
          REFERENCIAS_MONTAJE.regla.yCienCentimetros) *
          escalaReglaVertical *
          FACTOR_ESCALA_VERTICAL_REGLA)) *
      100;
    const lecturaLimitada = limitarLecturaSenalador(
      tipo,
      Math.round(lecturaCm),
    );

    if (tipo === "superior") {
      setLecturaSenaladorSuperiorCm(lecturaLimitada);
    } else {
      setLecturaSenaladorInferiorCm(lecturaLimitada);
    }
    evento.preventDefault();
  }

  function finalizarArrastreSenalador(
    tipo: "superior" | "inferior",
    evento: PointerEvent<HTMLButtonElement>,
  ) {
    const referenciaArrastre =
      tipo === "superior"
        ? arrastreSenaladorSuperiorRef
        : arrastreSenaladorInferiorRef;
    if (referenciaArrastre.current?.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    referenciaArrastre.current = null;
    if (tipo === "superior") setArrastrandoSenaladorSuperior(false);
    else setArrastrandoSenaladorInferior(false);
  }

  function controlarSenaladorConTeclado(
    tipo: "superior" | "inferior",
    evento: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (interaccionBloqueada) return;
    const lecturaActual =
      tipo === "superior"
        ? lecturaSenaladorSuperiorCm
        : lecturaSenaladorInferiorCm;
    let siguienteLectura: number;

    if (evento.key === "ArrowUp" || evento.key === "ArrowRight") {
      siguienteLectura = lecturaActual + PASO_SENALADOR_REGLA_CM;
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowLeft") {
      siguienteLectura = lecturaActual - PASO_SENALADOR_REGLA_CM;
    } else if (evento.key === "Home") {
      siguienteLectura = 0;
    } else if (evento.key === "End") {
      siguienteLectura = 100;
    } else {
      return;
    }

    const lecturaLimitada = limitarLecturaSenalador(tipo, siguienteLectura);
    if (tipo === "superior") setLecturaSenaladorSuperiorCm(lecturaLimitada);
    else setLecturaSenaladorInferiorCm(lecturaLimitada);
    evento.preventDefault();
  }

  function obtenerDireccionDesdePivote(clientX: number, clientY: number) {
    const coordenadas = obtenerCoordenadasEscena(clientX, clientY);
    if (!coordenadas) return null;
    return Math.atan2(
      coordenadas.y - geometria.salida.y,
      coordenadas.x - geometria.salida.x,
    );
  }

  function iniciarAjusteAnguloDispositivo(
    evento: PointerEvent<HTMLButtonElement>,
  ) {
    if (
      interaccionBloqueada ||
      (evento.pointerType === "mouse" && evento.button !== 0)
    ) {
      return;
    }

    const direccionInicial = obtenerDireccionDesdePivote(
      evento.clientX,
      evento.clientY,
    );
    if (direccionInicial === null) return;

    arrastreAnguloDispositivoRef.current = {
      pointerId: evento.pointerId,
      direccionInicial,
      anguloInicial: condiciones.anguloGrados,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setAjustandoAnguloDispositivo(true);
    evento.preventDefault();
  }

  function ajustarAnguloDispositivo(evento: PointerEvent<HTMLButtonElement>) {
    const arrastre = arrastreAnguloDispositivoRef.current;
    if (!arrastre || arrastre.pointerId !== evento.pointerId) return;

    const direccionActual = obtenerDireccionDesdePivote(
      evento.clientX,
      evento.clientY,
    );
    if (direccionActual === null) return;
    let diferencia = direccionActual - arrastre.direccionInicial;
    if (diferencia > Math.PI) diferencia -= Math.PI * 2;
    if (diferencia < -Math.PI) diferencia += Math.PI * 2;

    const siguienteAngulo = Math.min(
      90,
      Math.max(
        0,
        Math.round(arrastre.anguloInicial - (diferencia * 180) / Math.PI),
      ),
    );
    onAnguloChange(siguienteAngulo);
    evento.preventDefault();
  }

  function finalizarAjusteAnguloDispositivo(
    evento: PointerEvent<HTMLButtonElement>,
  ) {
    if (arrastreAnguloDispositivoRef.current?.pointerId !== evento.pointerId) {
      return;
    }

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreAnguloDispositivoRef.current = null;
    setAjustandoAnguloDispositivo(false);
  }

  function controlarAnguloDispositivoConTeclado(
    evento: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (interaccionBloqueada) return;
    let siguienteAngulo: number;

    if (evento.key === "ArrowUp" || evento.key === "ArrowRight") {
      siguienteAngulo = condiciones.anguloGrados + PASO_ANGULO_DISPOSITIVO;
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowLeft") {
      siguienteAngulo = condiciones.anguloGrados - PASO_ANGULO_DISPOSITIVO;
    } else if (evento.key === "Home") {
      siguienteAngulo = 0;
    } else if (evento.key === "End") {
      siguienteAngulo = 90;
    } else {
      return;
    }

    onAnguloChange(Math.min(90, Math.max(0, siguienteAngulo)));
    evento.preventDefault();
  }

  function limitarDesplazamientoConjuntoBalistico(
    desplazamiento: DesplazamientoEscena,
  ): DesplazamientoEscena {
    const limitesBase = {
      left: limitesGrupoBalistico.left - desplazamientoConjuntoX,
      top: limitesGrupoBalistico.top - desplazamientoConjuntoY,
      right: limitesGrupoBalistico.right - desplazamientoConjuntoX,
      bottom: limitesGrupoBalistico.bottom - desplazamientoConjuntoY,
    };
    const limiteDerecho = Math.min(
      LIENZO_PARABOLICO.width - limitesBase.right,
      posicionMesaX - limitesBase.right,
    );

    return {
      x: Math.min(limiteDerecho, Math.max(-limitesBase.left, desplazamiento.x)),
      y: Math.min(
        LIENZO_PARABOLICO.height - limitesBase.bottom,
        Math.max(-limitesBase.top, desplazamiento.y),
      ),
    };
  }

  function iniciarArrastreMesa(evento: PointerEvent<HTMLButtonElement>) {
    if (
      interaccionBloqueada ||
      (evento.pointerType === "mouse" && evento.button !== 0)
    ) {
      return;
    }

    arrastreMesaRef.current = {
      pointerId: evento.pointerId,
      clientX: evento.clientX,
      clientY: evento.clientY,
      posicionInicialX: posicionMesaX,
      alturaInicial: alturaMesa,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrandoMesa(true);
    evento.preventDefault();
  }

  function moverMesa(evento: PointerEvent<HTMLButtonElement>) {
    const arrastre = arrastreMesaRef.current;
    const escena = escenaRef.current;
    if (!arrastre || !escena || arrastre.pointerId !== evento.pointerId) {
      return;
    }

    const limitesEscena = escena.getBoundingClientRect();
    const desplazamientoX =
      ((evento.clientX - arrastre.clientX) / limitesEscena.width) *
      LIENZO_PARABOLICO.width;
    const desplazamientoY =
      ((evento.clientY - arrastre.clientY) / limitesEscena.height) *
      LIENZO_PARABOLICO.height;

    onPosicionMesaXChange(
      limitarPosicionMesaX(
        arrastre.posicionInicialX + desplazamientoX,
        desplazamientoConjuntoX,
      ),
    );
    onAlturaMesaChange(
      limitarAlturaMesa(
        arrastre.alturaInicial - desplazamientoY / PIXELES_POR_METRO,
      ),
    );
    evento.preventDefault();
  }

  function finalizarArrastreMesa(evento: PointerEvent<HTMLButtonElement>) {
    if (arrastreMesaRef.current?.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreMesaRef.current = null;
    setArrastrandoMesa(false);
  }

  function controlarMesaConTeclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (interaccionBloqueada) return;

    if (evento.key === "ArrowLeft") {
      onPosicionMesaXChange(
        limitarPosicionMesaX(
          posicionMesaX - PASO_MESA_HORIZONTAL_TECLADO,
          desplazamientoConjuntoX,
        ),
      );
    } else if (evento.key === "ArrowRight") {
      onPosicionMesaXChange(
        limitarPosicionMesaX(
          posicionMesaX + PASO_MESA_HORIZONTAL_TECLADO,
          desplazamientoConjuntoX,
        ),
      );
    } else if (evento.key === "ArrowUp") {
      onAlturaMesaChange(
        limitarAlturaMesa(alturaMesa + PASO_MESA_VERTICAL_TECLADO),
      );
    } else if (evento.key === "ArrowDown") {
      onAlturaMesaChange(
        limitarAlturaMesa(alturaMesa - PASO_MESA_VERTICAL_TECLADO),
      );
    } else if (evento.key === "Home") {
      onPosicionMesaXChange(POSICION_MESA_INICIAL_X);
      onAlturaMesaChange(ALTURA_MESA);
    } else {
      return;
    }

    evento.preventDefault();
  }

  return (
    <>
      <SimulatorZoomToolbar<FocoZoom>
        zoom={zoom}
        canDecrease={puedeReducirZoom}
        canIncrease={puedeAumentarZoom}
        onDecrease={reducirZoom}
        onIncrease={aumentarZoom}
        activeFocus={focoZoom}
        focusOptions={[
          { id: "general", label: "General" },
          { id: "balistico", label: "Balístico" },
          { id: "mesa", label: "Mesa" },
          {
            id: "reglas",
            label: "Reglas",
            disabled: !mostrarReglaHorizontal && !mostrarReglaVertical,
          },
          { id: "timer", label: "Timer 4-4", disabled: !mostrarTimer44 },
        ]}
        onFocusChange={seleccionarFocoZoom}
      />

      <SimulatorSceneViewport
        ref={visorRef}
        className={`projectile-scene-viewport${zoom > 1 ? " projectile-scene-viewport--zoomed" : ""}${desplazandoVisor ? " projectile-scene-viewport--panning" : ""}`}
        {...propiedadesVisor}
        aria-label={
          zoom > 1
            ? "Vista ampliada del laboratorio; arrastra el fondo o usa las flechas para desplazarte"
            : "Vista general del laboratorio de movimiento parabólico"
        }
      >
        <div
          ref={escenaRef}
          className="projectile-scene"
          style={estiloEscena}
        >
          <img
            className="projectile-scene__background"
            src={fondoLaboratorio}
            alt=""
            draggable={false}
            aria-hidden="true"
          />
          <div className="projectile-scene__worktable" aria-hidden="true" />

          {mostrarRastro && marcasRastro.length > 0 && (
            <div className="projectile-scene__trail" aria-hidden="true">
              {marcasRastro.map((marca, indice) => (
                <i
                  key={indice}
                  style={{
                    left: `${(marca.x / LIENZO_PARABOLICO.width) * 100}%`,
                    top: `${(marca.y / LIENZO_PARABOLICO.height) * 100}%`,
                  }}
                />
              ))}
            </div>
          )}

          <img
            className="projectile-scene__instrument projectile-scene__ballistic-support"
            style={convertirRectanguloAPorcentajes({
              ...geometria.soporte,
              zIndex: arrastrandoConjuntoBalistico
                ? 18
                : geometria.soporte.zIndex,
            })}
            src={soporteBalistico}
            alt="Soporte del dispositivo balístico"
            draggable={false}
          />

          <div
            className="projectile-scene__ballistic-carriage"
            aria-label={`Conjunto balístico con salida a ${geometria.alturaSalida.toFixed(2)} metros`}
          >
            <img
              className="projectile-scene__instrument projectile-scene__protractor"
              style={{
                ...convertirRectanguloAPorcentajes(geometria.transportador),
                zIndex: arrastrandoConjuntoBalistico
                  ? 18
                  : geometria.transportador.zIndex,
                transform: `skewX(${CORRECCION_APERTURA_TRANSPORTADOR}deg) rotate(${ANGULO_MONTAJE_TRANSPORTADOR}deg)`,
                transformOrigin: `${origenTransportadorX}% ${origenTransportadorY}%`,
              }}
              src={transportadorBalistico}
              alt="Transportador móvil sobre el soporte"
              draggable={false}
            />
            <div
              className={`projectile-scene__ballistic-device${ajustandoAnguloDispositivo ? " projectile-scene__ballistic-device--adjusting" : ""}`}
              style={
                {
                  ...convertirRectanguloAPorcentajes(geometria.dispositivo),
                  zIndex: arrastrandoConjuntoBalistico
                    ? 19
                    : geometria.dispositivo.zIndex,
                  "--device-rotation": `${ANGULO_DIBUJO_DISPOSITIVO - condiciones.anguloGrados}deg`,
                  "--device-origin-x": `${(origenDispositivoX / geometria.dispositivo.width) * 100}%`,
                  "--device-origin-y": `${(origenDispositivoY / ((REFERENCIAS_MONTAJE.dispositivo.alto / REFERENCIAS_MONTAJE.dispositivo.ancho) * geometria.dispositivo.width)) * 100}%`,
                  "--speed-display-correction": `${-ANGULO_DIBUJO_DISPOSITIVO}deg`,
                } as CSSProperties
              }
              aria-label={`Dispositivo balístico orientado a ${condiciones.anguloGrados} grados`}
            >
              <img
                className="projectile-scene__ballistic-device-image"
                src={dispositivoBalistico}
                alt="Dispositivo balístico regulable"
                draggable={false}
              />
              {!proyectilLiberado && (
                <img
                  className="projectile-scene__projectile"
                  src={cuerpoPrueba}
                  alt="Esfera de acero preparada para el lanzamiento"
                  draggable={false}
                />
              )}
              <output
                className="projectile-scene__speed-display"
                aria-label={`Velocidad inicial ${condiciones.velocidadInicial.toFixed(2)} metros por segundo`}
              >
                {condiciones.velocidadInicial.toFixed(2)}
              </output>
            </div>
            <button
              type="button"
              className={`projectile-scene__device-angle-drag${ajustandoAnguloDispositivo ? " projectile-scene__device-angle-drag--active" : ""}`}
              style={{
                ...convertirRectanguloAPorcentajes({
                  ...geometria.dispositivo,
                  zIndex: ajustandoAnguloDispositivo ? 23 : 21,
                }),
                height: `${(alturaVisualDispositivo / LIENZO_PARABOLICO.height) * 100}%`,
                transform: `rotate(${ANGULO_DIBUJO_DISPOSITIVO - condiciones.anguloGrados}deg)`,
                transformOrigin: `${(origenDispositivoX / geometria.dispositivo.width) * 100}% ${(origenDispositivoY / alturaVisualDispositivo) * 100}%`,
              }}
              aria-label={`Ajustar visualmente el ángulo de lanzamiento; valor actual ${condiciones.anguloGrados} grados`}
              title={
                interaccionBloqueada
                  ? "Prepara un nuevo lanzamiento para ajustar el ángulo"
                  : "Gira el dispositivo alrededor de su pivote"
              }
              disabled={interaccionBloqueada}
              onPointerDown={iniciarAjusteAnguloDispositivo}
              onPointerMove={ajustarAnguloDispositivo}
              onPointerUp={finalizarAjusteAnguloDispositivo}
              onPointerCancel={finalizarAjusteAnguloDispositivo}
              onKeyDown={controlarAnguloDispositivoConTeclado}
            />
          </div>

          <button
            type="button"
            className={`projectile-scene__ballistic-drag${arrastrandoConjuntoBalistico ? " projectile-scene__ballistic-drag--active" : ""}`}
            style={{
              ...convertirRectanguloAPorcentajes({
                left: limitesGrupoBalistico.left,
                top: limitesGrupoBalistico.top,
                width: limitesGrupoBalistico.right - limitesGrupoBalistico.left,
                zIndex: arrastrandoConjuntoBalistico ? 20 : 13,
              }),
              height: `${((limitesGrupoBalistico.bottom - limitesGrupoBalistico.top) / LIENZO_PARABOLICO.height) * 100}%`,
            }}
            aria-label={`Mover conjunto balístico; altura de salida ${geometria.alturaSalida.toFixed(2)} metros`}
            title={
              interaccionBloqueada
                ? "Prepara un nuevo lanzamiento para mover el conjunto balístico"
                : "Arrastra el conjunto completo; usa las flechas para ajustes finos"
            }
            disabled={interaccionBloqueada}
            {...propiedadesArrastreConjuntoBalistico}
          />

          {proyectilLiberado && (
            <img
              className="projectile-scene__animated-projectile"
              src={cuerpoPrueba}
              alt="Esfera de acero en movimiento"
              draggable={false}
              style={{
                left: `${(proyectilX / LIENZO_PARABOLICO.width) * 100}%`,
                top: `${(proyectilY / LIENZO_PARABOLICO.height) * 100}%`,
                width: `${(anchoProyectil / LIENZO_PARABOLICO.width) * 100}%`,
              }}
            />
          )}

          <img
            className="projectile-scene__instrument projectile-scene__impact-table-legs"
            style={convertirRectanguloAPorcentajes(geometria.mesaPatas)}
            src={mesaInferiorPatas}
            alt="Patas telescópicas de la mesa de impacto"
            draggable={false}
          />
          <img
            className="projectile-scene__instrument projectile-scene__impact-table"
            style={convertirRectanguloAPorcentajes(geometria.mesaSuperior)}
            src={mesaSuperior}
            alt={`Mesa de impacto ajustada a ${geometria.alturaMesa.toFixed(2)} metros de altura`}
            draggable={false}
          />
          <button
            type="button"
            className={`projectile-scene__table-drag${arrastrandoMesa ? " projectile-scene__table-drag--active" : ""}`}
            style={{
              ...convertirRectanguloAPorcentajes(geometria.mesaSuperior),
              height: `${(alturaVisualMesaSuperior / LIENZO_PARABOLICO.height) * 100}%`,
              zIndex: 12,
            }}
            aria-label={`Mover mesa de impacto; posición horizontal ${posicionMesaX.toFixed(0)} y altura ${alturaMesa.toFixed(2)} metros`}
            title={
              interaccionBloqueada
                ? "Prepara un nuevo lanzamiento para mover la mesa"
                : "Arrastra para mover la mesa; usa las flechas para ajustes finos"
            }
            disabled={interaccionBloqueada}
            onPointerDown={iniciarArrastreMesa}
            onPointerMove={moverMesa}
            onPointerUp={finalizarArrastreMesa}
            onPointerCancel={finalizarArrastreMesa}
            onKeyDown={controlarMesaConTeclado}
          />

          {mostrarReglaHorizontal && (
            <>
              <img
                className="projectile-scene__instrument projectile-scene__horizontal-rule"
                style={convertirRectanguloAPorcentajes({
                  ...geometria.reglaHorizontal,
                  ...posicionVisualReglaHorizontal,
                  zIndex: arrastrandoReglaHorizontal ? 13 : 8,
                })}
                src={reglaHorizontal}
                alt="Regla horizontal graduada de cero a doscientos centímetros"
                draggable={false}
              />
              <button
                type="button"
                className={`projectile-scene__horizontal-rule-drag${arrastrandoReglaHorizontal ? " projectile-scene__horizontal-rule-drag--active" : ""}`}
                style={{
                  ...convertirRectanguloAPorcentajes({
                    ...geometria.reglaHorizontal,
                    left: posicionVisualReglaHorizontal.left,
                    top:
                      posicionVisualReglaHorizontal.top -
                      (alturaAgarreReglaHorizontal -
                        alturaVisualReglaHorizontal) /
                        2,
                    zIndex: 14,
                  }),
                  height: `${(alturaAgarreReglaHorizontal / LIENZO_PARABOLICO.height) * 100}%`,
                }}
                aria-label="Mover regla horizontal de dos metros"
                title={
                  interaccionBloqueada
                    ? "Prepara un nuevo lanzamiento para mover la regla"
                    : "Arrastra la regla; usa las flechas para ajustes finos"
                }
                disabled={interaccionBloqueada}
                {...propiedadesArrastreReglaHorizontal}
              />
            </>
          )}

          {mostrarReglaVertical && (
            <>
              <img
                className="projectile-scene__instrument projectile-scene__vertical-rule"
                style={{
                  ...convertirRectanguloAPorcentajes({
                    ...geometria.regla,
                    left: geometria.regla.left + desplazamientoReglaVertical.x,
                    top: geometria.regla.top + desplazamientoReglaVertical.y,
                    zIndex: arrastrandoReglaVertical
                      ? 19
                      : geometria.regla.zIndex,
                  }),
                  transform: `scaleY(${FACTOR_ESCALA_VERTICAL_REGLA})`,
                  transformOrigin: `center ${(REFERENCIAS_MONTAJE.regla.yCeroCentimetros / REFERENCIAS_MONTAJE.regla.alto) * 100}%`,
                }}
                src={regla}
                alt="Regla vertical graduada de cero a cien centímetros"
                draggable={false}
              />
              <img
                className="projectile-scene__instrument projectile-scene__rule-pointer projectile-scene__rule-pointer--superior"
                style={convertirRectanguloAPorcentajes({
                  ...geometriaSenaladorSuperior,
                  left:
                    geometriaSenaladorSuperior.left +
                    desplazamientoReglaVertical.x,
                  top:
                    geometriaSenaladorSuperior.top +
                    desplazamientoReglaVertical.y,
                  zIndex:
                    arrastrandoReglaVertical || arrastrandoSenaladorSuperior
                      ? 19
                      : geometriaSenaladorSuperior.zIndex,
                })}
                src={senaladorSuperior}
                alt={`Señalador superior en ${lecturaSenaladorSuperiorCm.toFixed(0)} centímetros`}
                draggable={false}
              />
              <img
                className="projectile-scene__instrument projectile-scene__rule-pointer projectile-scene__rule-pointer--inferior"
                style={convertirRectanguloAPorcentajes({
                  ...geometriaSenaladorInferior,
                  left:
                    geometriaSenaladorInferior.left +
                    desplazamientoReglaVertical.x,
                  top:
                    geometriaSenaladorInferior.top +
                    desplazamientoReglaVertical.y,
                  zIndex:
                    arrastrandoReglaVertical || arrastrandoSenaladorInferior
                      ? 19
                      : geometriaSenaladorInferior.zIndex,
                })}
                src={senaladorInferior}
                alt={`Señalador inferior en ${lecturaSenaladorInferiorCm.toFixed(0)} centímetros`}
                draggable={false}
              />
              <button
                type="button"
                className={`projectile-scene__rule-pointer-drag${arrastrandoSenaladorSuperior ? " projectile-scene__rule-pointer-drag--active" : ""}`}
                style={{
                  ...convertirRectanguloAPorcentajes({
                    ...geometriaSenaladorSuperior,
                    left:
                      geometriaSenaladorSuperior.left +
                      desplazamientoReglaVertical.x,
                    top:
                      geometriaSenaladorSuperior.top +
                      desplazamientoReglaVertical.y,
                    zIndex: arrastrandoSenaladorSuperior ? 22 : 17,
                  }),
                  height: `${(alturaVisualSenaladorSuperior / LIENZO_PARABOLICO.height) * 100}%`,
                }}
                aria-label={`Mover señalador superior; lectura ${lecturaSenaladorSuperiorCm.toFixed(0)} centímetros`}
                title="Desliza el señalador superior entre 0 y 100 cm"
                disabled={interaccionBloqueada}
                onPointerDown={(evento) =>
                  iniciarArrastreSenalador("superior", evento)
                }
                onPointerMove={(evento) => moverSenalador("superior", evento)}
                onPointerUp={(evento) =>
                  finalizarArrastreSenalador("superior", evento)
                }
                onPointerCancel={(evento) =>
                  finalizarArrastreSenalador("superior", evento)
                }
                onKeyDown={(evento) =>
                  controlarSenaladorConTeclado("superior", evento)
                }
              />
              <button
                type="button"
                className={`projectile-scene__rule-pointer-drag${arrastrandoSenaladorInferior ? " projectile-scene__rule-pointer-drag--active" : ""}`}
                style={{
                  ...convertirRectanguloAPorcentajes({
                    ...geometriaSenaladorInferior,
                    left:
                      geometriaSenaladorInferior.left +
                      desplazamientoReglaVertical.x,
                    top:
                      geometriaSenaladorInferior.top +
                      desplazamientoReglaVertical.y,
                    zIndex: arrastrandoSenaladorInferior ? 22 : 17,
                  }),
                  height: `${(alturaVisualSenaladorInferior / LIENZO_PARABOLICO.height) * 100}%`,
                }}
                aria-label={`Mover señalador inferior; lectura ${lecturaSenaladorInferiorCm.toFixed(0)} centímetros`}
                title="Desliza el señalador inferior entre 0 y 100 cm"
                disabled={interaccionBloqueada}
                onPointerDown={(evento) =>
                  iniciarArrastreSenalador("inferior", evento)
                }
                onPointerMove={(evento) => moverSenalador("inferior", evento)}
                onPointerUp={(evento) =>
                  finalizarArrastreSenalador("inferior", evento)
                }
                onPointerCancel={(evento) =>
                  finalizarArrastreSenalador("inferior", evento)
                }
                onKeyDown={(evento) =>
                  controlarSenaladorConTeclado("inferior", evento)
                }
              />
              <button
                type="button"
                className={`projectile-scene__vertical-rule-drag${arrastrandoReglaVertical ? " projectile-scene__vertical-rule-drag--active" : ""}`}
                style={{
                  ...convertirRectanguloAPorcentajes({
                    left:
                      geometria.regla.left + desplazamientoReglaVertical.x - 6,
                    top: topVisualReglaVertical + desplazamientoReglaVertical.y,
                    width: geometria.regla.width + 12,
                    zIndex: arrastrandoReglaVertical ? 20 : 15,
                  }),
                  height: `${(alturaVisualReglaVertical / LIENZO_PARABOLICO.height) * 100}%`,
                }}
                aria-label="Mover regla vertical"
                title={
                  interaccionBloqueada
                    ? "Prepara un nuevo lanzamiento para mover la regla vertical"
                    : "Arrastra la regla; los señaladores conservarán sus lecturas"
                }
                disabled={interaccionBloqueada}
                {...propiedadesArrastreReglaVertical}
              />
            </>
          )}

          {mostrarImpactos &&
            impactosMesa.map((impacto, indice) => {
              const centroImpactoX = Math.min(
                geometria.superficieMesa.right - anchoHuellaImpacto / 2,
                Math.max(
                  geometria.superficieMesa.left + anchoHuellaImpacto / 2,
                  geometria.mesaSuperior.left +
                    impacto.desplazamientoDesdeBorde,
                ),
              );

              return (
                <span
                  key={impacto.id}
                  className="projectile-scene__impact-mark projectile-scene__impact-mark--mesa"
                  style={{
                    left: `${(centroImpactoX / LIENZO_PARABOLICO.width) * 100}%`,
                    top: `${(geometria.superficieMesa.y / LIENZO_PARABOLICO.height) * 100}%`,
                    width: `${(anchoHuellaImpacto / LIENZO_PARABOLICO.width) * 100}%`,
                    height: `${(altoHuellaImpacto / LIENZO_PARABOLICO.height) * 100}%`,
                  }}
                  aria-label={`Impacto ${indice + 1} sobre la mesa, alcance ${impacto.alcance.toFixed(2)} metros`}
                />
              );
            })}

          {mostrarImpactos &&
            destinoImpacto === "piso" &&
            impactoX !== null &&
            impactoY !== null &&
            estado === "finalizada" && (
              <span
                className="projectile-scene__impact-mark projectile-scene__impact-mark--piso"
                style={{
                  left: `${(impactoX / LIENZO_PARABOLICO.width) * 100}%`,
                  top: `${(impactoY / LIENZO_PARABOLICO.height) * 100}%`,
                }}
                aria-label="Marca de impacto sobre el piso"
              />
            )}

          {mostrarTimer44 && (
            <div
              className={`projectile-scene__timer44-drag${arrastrandoTimer ? " projectile-scene__timer44-drag--active" : ""}`}
              style={convertirRectanguloAPorcentajes({
                ...posicionTimer,
                width: ANCHO_TIMER44,
                zIndex: arrastrandoTimer ? 20 : 16,
              })}
              role="group"
              tabIndex={0}
              aria-label="Timer 4-4 móvil; usa las flechas para desplazarlo y la tecla Inicio para restaurarlo"
              {...propiedadesArrastreTimer}
            >
              <SimulatorTimer44
                className="projectile-scene__timer44"
                reading={tiempo}
                phase={faseTimer}
                onReset={onReiniciarTimer}
                resetLabel="Preparar un nuevo lanzamiento y reiniciar el Timer 4-4"
                instrumentLabel="Timer 4-4; el canal uno mide el tiempo de vuelo de la esfera"
              />
            </div>
          )}
        </div>
      </SimulatorSceneViewport>
    </>
  );
}

export default EscenarioParabolico;
