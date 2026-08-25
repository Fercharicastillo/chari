import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  SimulatorLabStage,
  SimulatorSceneViewport,
  SimulatorZoomToolbar,
} from "@physikos/simulator-ui";
import disparadorEsfera from "../physics/assets/disparador-esfera.svg";
import esferaPrueba from "../physics/assets/esfera-cuerpo-prueba.svg";
import fondoCaidaLibre from "../physics/assets/fondo-caida-libre.svg";
import platilloEsfera from "../physics/assets/plato-esfera.svg";
import regla from "../physics/assets/regla.svg";
import senaladorInferior from "../physics/assets/senalador-inferior-regla.svg";
import senaladorSuperior from "../physics/assets/senalador-superior-regla.svg";
import soporte from "../physics/assets/soporte.svg";
import Timer44CaidaLibre, {
  type FaseTimerCaidaLibre,
} from "../components/Timer44CaidaLibre";
import {
  calcularLecturaInferiorDesdeContactoPlatillo,
  calcularLecturaSuperiorDesdeCentroEsfera,
  convertirRectanguloAPorcentajes,
  crearMontajeParaLecturas,
  LIENZO_LABORATORIO,
  MONTAJE_ESTATICO,
  POSICION_LECTURAS_REGLA_X,
  obtenerCoordenadaReglaParaLectura,
  obtenerCentroEsferaParaLectura,
  obtenerContactoPlatilloParaLectura,
  obtenerLimitesLecturaInferior,
  obtenerLimitesLecturaSuperior,
} from "./geometriaLaboratorio";

const PASO_ALTURA_TECLADO = 0.01;
const PASO_TIMER_TECLADO = 10;
const NIVELES_ZOOM = [1, 1.5, 2] as const;
const INICIO_MESA_Y = LIENZO_LABORATORIO.height * 0.6;
const RELACION_ALTO_TIMER44 = 657.33 / 1473.28;
const ALTO_TIMER44 = MONTAJE_ESTATICO.timer44.width * RELACION_ALTO_TIMER44;
const POSICION_TIMER_INICIAL = {
  left: MONTAJE_ESTATICO.timer44.left,
  top: MONTAJE_ESTATICO.timer44.top,
};
type FocoZoom = "montaje" | "timer";
type ArrastreVisor = {
  pointerId: number;
  clientX: number;
  clientY: number;
  scrollLeft: number;
  scrollTop: number;
};
type ArrastreTimer = {
  pointerId: number;
  desfaseX: number;
  desfaseY: number;
};

type LaboratorioEstaticoProps = {
  lecturaSuperior: number;
  lecturaInferior: number;
  distanciaCaida: number;
  interaccionBloqueada: boolean;
  lecturaTimer: number;
  faseTimer: FaseTimerCaidaLibre;
  estadoEnsayo: "preparada" | "ejecutando" | "pausada" | "finalizada";
  tiempo: number;
  mostrarTimer: boolean;
  mostrarRegla: boolean;
  mostrarRastro: boolean;
  onReiniciarTimer: () => void;
  reinicioCompletoId: number;
  onLecturaSuperiorChange: (lectura: number) => void;
  onLecturaInferiorChange: (lectura: number) => void;
};

function LaboratorioEstatico({
  lecturaSuperior,
  lecturaInferior,
  distanciaCaida,
  interaccionBloqueada,
  lecturaTimer,
  faseTimer,
  estadoEnsayo,
  tiempo,
  mostrarTimer,
  mostrarRegla,
  mostrarRastro,
  onReiniciarTimer,
  reinicioCompletoId,
  onLecturaSuperiorChange,
  onLecturaInferiorChange,
}: LaboratorioEstaticoProps) {
  const visorRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const punteroSuperiorRef = useRef<number | null>(null);
  const punteroInferiorRef = useRef<number | null>(null);
  const desfaseSuperiorRef = useRef(0);
  const desfaseInferiorRef = useRef(0);
  const arrastreVisorRef = useRef<ArrastreVisor | null>(null);
  const arrastreTimerRef = useRef<ArrastreTimer | null>(null);
  const [arrastrandoSuperior, setArrastrandoSuperior] = useState(false);
  const [arrastrandoInferior, setArrastrandoInferior] = useState(false);
  const [indiceZoom, setIndiceZoom] = useState(0);
  const [focoZoom, setFocoZoom] = useState<FocoZoom>("montaje");
  const [desplazandoVisor, setDesplazandoVisor] = useState(false);
  const [arrastrandoTimer, setArrastrandoTimer] = useState(false);
  const [posicionTimer, setPosicionTimer] = useState(POSICION_TIMER_INICIAL);
  const zoom = NIVELES_ZOOM[indiceZoom];
  const montaje = crearMontajeParaLecturas(
    lecturaSuperior,
    lecturaInferior,
    distanciaCaida,
  );
  const montajeInicialEnsayo = crearMontajeParaLecturas(
    lecturaSuperior,
    lecturaInferior,
    0,
  );
  const limitesSuperiores = obtenerLimitesLecturaSuperior(lecturaInferior);
  const limitesInferiores = obtenerLimitesLecturaInferior(lecturaSuperior);

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => enfocarZona(focoZoom, "auto"));
    return () => cancelAnimationFrame(cuadro);
  }, [indiceZoom, focoZoom]);

  useEffect(() => {
    if (!mostrarTimer && focoZoom === "timer") {
      setFocoZoom("montaje");
    }
  }, [mostrarTimer, focoZoom]);

  useEffect(() => {
    setIndiceZoom(0);
    setFocoZoom("montaje");
    setDesplazandoVisor(false);
    arrastreVisorRef.current = null;
    arrastreTimerRef.current = null;
    setArrastrandoTimer(false);
    setPosicionTimer(POSICION_TIMER_INICIAL);

    const cuadro = requestAnimationFrame(() => enfocarZona("montaje", "auto"));
    return () => cancelAnimationFrame(cuadro);
  }, [reinicioCompletoId]);

  function enfocarZona(
    foco: FocoZoom,
    comportamiento: ScrollBehavior = "smooth",
  ) {
    const visor = visorRef.current;
    const escena = escenaRef.current;
    if (!visor || !escena) return;

    const centro =
      foco === "timer"
        ? {
            x: posicionTimer.left + montaje.timer44.width / 2,
            y: posicionTimer.top + ALTO_TIMER44 / 2,
          }
        : {
            x:
              (montaje.soporte.left +
                montaje.regla.left +
                montaje.regla.width) /
              2,
            y:
              (obtenerCoordenadaReglaParaLectura(lecturaSuperior) +
                obtenerCoordenadaReglaParaLectura(lecturaInferior)) /
              2,
          };
    const escalaX = escena.scrollWidth / LIENZO_LABORATORIO.width;
    const escalaY = escena.scrollHeight / LIENZO_LABORATORIO.height;

    visor.scrollTo({
      left: centro.x * escalaX - visor.clientWidth / 2,
      top: centro.y * escalaY - visor.clientHeight / 2,
      behavior: comportamiento,
    });
  }

  function seleccionarFoco(foco: FocoZoom) {
    setFocoZoom(foco);
    requestAnimationFrame(() => enfocarZona(foco));
  }

  function elementoControlaSuPropioArrastre(elemento: EventTarget | null) {
    if (!(elemento instanceof Element)) return false;

    return Boolean(
      elemento.closest(
        "button, .lab-trigger-drag:not(.lab-trigger-drag--disabled), .lab-plate-drag:not(.lab-plate-drag--disabled)",
      ),
    );
  }

  function iniciarDesplazamientoVisor(evento: PointerEvent<HTMLDivElement>) {
    if (
      zoom === 1 ||
      (evento.pointerType === "mouse" && evento.button !== 0) ||
      elementoControlaSuPropioArrastre(evento.target)
    ) {
      return;
    }

    const visor = evento.currentTarget;
    arrastreVisorRef.current = {
      pointerId: evento.pointerId,
      clientX: evento.clientX,
      clientY: evento.clientY,
      scrollLeft: visor.scrollLeft,
      scrollTop: visor.scrollTop,
    };
    visor.setPointerCapture(evento.pointerId);
    setDesplazandoVisor(true);
    evento.preventDefault();
  }

  function desplazarVisor(evento: PointerEvent<HTMLDivElement>) {
    const inicio = arrastreVisorRef.current;
    if (!inicio || inicio.pointerId !== evento.pointerId) return;

    evento.currentTarget.scrollLeft =
      inicio.scrollLeft - (evento.clientX - inicio.clientX);
    evento.currentTarget.scrollTop =
      inicio.scrollTop - (evento.clientY - inicio.clientY);
    evento.preventDefault();
  }

  function finalizarDesplazamientoVisor(evento: PointerEvent<HTMLDivElement>) {
    const inicio = arrastreVisorRef.current;
    if (!inicio || inicio.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreVisorRef.current = null;
    setDesplazandoVisor(false);
  }

  function obtenerEstiloLectura(lectura: number) {
    const DESPLAZAMIENTO_X = 35;
    const DESPLAZAMIENTO_Y = 2;
    return {
      left: `${((POSICION_LECTURAS_REGLA_X - DESPLAZAMIENTO_X) / LIENZO_LABORATORIO.width) * 100}%`,
      top: `${((obtenerCoordenadaReglaParaLectura(lectura) - DESPLAZAMIENTO_Y) / LIENZO_LABORATORIO.height) * 100}%`,
      zIndex: 8,
    };
  }

  function obtenerEstiloIndicador(
    geometria: typeof montaje.disparador,
    referencia: { x: number; y: number; anchoViewBox: number; diametro: number },
  ) {
    const escala = geometria.width / referencia.anchoViewBox;
    const diametro = referencia.diametro * escala;
    return convertirRectanguloAPorcentajes({
      left: geometria.left + referencia.x * escala - diametro / 2,
      top: geometria.top + referencia.y * escala - diametro / 2,
      width: diametro,
      zIndex: 8,
    });
  }

  const disparadorVerde =
    estadoEnsayo === "ejecutando" || estadoEnsayo === "pausada";
  const platilloVerde = estadoEnsayo === "finalizada";

  const elementos = [
    {
      id: "regla",
      src: regla,
      alt: "Regla vertical graduada de cero a cien centímetros",
      geometria: montaje.regla,
    },
    {
      id: "soporte",
      src: soporte,
      alt: "Soporte vertical del equipo de caída libre",
      geometria: montaje.soporte,
    },
    {
      id: "senalador-superior",
      src: senaladorSuperior,
      alt: "Señalador superior de la regla",
      geometria: montaje.senaladorSuperior,
    },
    {
      id: "senalador-inferior",
      src: senaladorInferior,
      alt: "Señalador inferior de la regla",
      geometria: montaje.senaladorInferior,
    },
    {
      id: "platillo",
      src: platilloEsfera,
      alt: "Platillo receptor de la esfera",
      geometria: montaje.platillo,
    },
    {
      id: "disparador",
      src: disparadorEsfera,
      alt: "Disparador que retiene la esfera",
      geometria: montaje.disparador,
    },
    {
      id: "esfera",
      src: esferaPrueba,
      alt: "Esfera retenida antes del ensayo",
      geometria: montaje.esfera,
    },
  ];

  function obtenerCoordenadaY(clientY: number) {
    const escena = escenaRef.current;
    if (!escena) return null;

    const limites = escena.getBoundingClientRect();
    return (
      ((clientY - limites.top) / limites.height) * LIENZO_LABORATORIO.height
    );
  }

  function obtenerCoordenadasEscena(clientX: number, clientY: number) {
    const escena = escenaRef.current;
    if (!escena) return null;

    const limites = escena.getBoundingClientRect();
    return {
      x: ((clientX - limites.left) / limites.width) * LIENZO_LABORATORIO.width,
      y: ((clientY - limites.top) / limites.height) * LIENZO_LABORATORIO.height,
    };
  }

  function limitarPosicionTimer(left: number, top: number) {
    return {
      left: Math.min(
        LIENZO_LABORATORIO.width - montaje.timer44.width,
        Math.max(0, left),
      ),
      top: Math.min(
        LIENZO_LABORATORIO.height - ALTO_TIMER44,
        Math.max(INICIO_MESA_Y, top),
      ),
    };
  }

  function iniciarArrastreTimer(evento: PointerEvent<HTMLDivElement>) {
    evento.stopPropagation();
    if (
      (evento.pointerType === "mouse" && evento.button !== 0) ||
      (evento.target instanceof Element && evento.target.closest("button"))
    ) {
      return;
    }

    const coordenadas = obtenerCoordenadasEscena(
      evento.clientX,
      evento.clientY,
    );
    if (!coordenadas) return;

    arrastreTimerRef.current = {
      pointerId: evento.pointerId,
      desfaseX: coordenadas.x - posicionTimer.left,
      desfaseY: coordenadas.y - posicionTimer.top,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrandoTimer(true);
    evento.preventDefault();
  }

  function moverTimer(evento: PointerEvent<HTMLDivElement>) {
    const arrastre = arrastreTimerRef.current;
    if (!arrastre || arrastre.pointerId !== evento.pointerId) return;

    const coordenadas = obtenerCoordenadasEscena(
      evento.clientX,
      evento.clientY,
    );
    if (!coordenadas) return;

    setPosicionTimer(
      limitarPosicionTimer(
        coordenadas.x - arrastre.desfaseX,
        coordenadas.y - arrastre.desfaseY,
      ),
    );
    evento.stopPropagation();
    evento.preventDefault();
  }

  function finalizarArrastreTimer(evento: PointerEvent<HTMLDivElement>) {
    const arrastre = arrastreTimerRef.current;
    if (!arrastre || arrastre.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreTimerRef.current = null;
    setArrastrandoTimer(false);
    evento.stopPropagation();
  }

  function controlarTimerConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    let desplazamientoX = 0;
    let desplazamientoY = 0;

    if (evento.key === "ArrowLeft") desplazamientoX = -PASO_TIMER_TECLADO;
    else if (evento.key === "ArrowRight") desplazamientoX = PASO_TIMER_TECLADO;
    else if (evento.key === "ArrowUp") desplazamientoY = -PASO_TIMER_TECLADO;
    else if (evento.key === "ArrowDown") desplazamientoY = PASO_TIMER_TECLADO;
    else if (evento.key === "Home") {
      setPosicionTimer(POSICION_TIMER_INICIAL);
      evento.preventDefault();
      return;
    } else return;

    setPosicionTimer((actual) =>
      limitarPosicionTimer(
        actual.left + desplazamientoX,
        actual.top + desplazamientoY,
      ),
    );
    evento.preventDefault();
  }

  function iniciarArrastreSuperior(evento: PointerEvent<HTMLDivElement>) {
    if (interaccionBloqueada) return;
    const posicionY = obtenerCoordenadaY(evento.clientY);
    if (posicionY === null) return;

    punteroSuperiorRef.current = evento.pointerId;
    desfaseSuperiorRef.current =
      posicionY - obtenerCentroEsferaParaLectura(lecturaSuperior);
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrandoSuperior(true);
    evento.preventDefault();
  }

  function moverMontajeSuperior(evento: PointerEvent<HTMLDivElement>) {
    if (punteroSuperiorRef.current !== evento.pointerId) return;

    const posicionY = obtenerCoordenadaY(evento.clientY);
    if (posicionY === null) return;

    const centroEsfera = posicionY - desfaseSuperiorRef.current;
    const siguienteLectura =
      calcularLecturaSuperiorDesdeCentroEsfera(centroEsfera);
    onLecturaSuperiorChange(Number(siguienteLectura.toFixed(3)));
  }

  function finalizarArrastreSuperior(evento: PointerEvent<HTMLDivElement>) {
    if (punteroSuperiorRef.current !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    punteroSuperiorRef.current = null;
    setArrastrandoSuperior(false);
  }

  function controlarSuperiorConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (interaccionBloqueada) return;
    let siguienteAltura: number | null = null;

    if (evento.key === "ArrowUp" || evento.key === "ArrowRight") {
      siguienteAltura = lecturaSuperior + PASO_ALTURA_TECLADO;
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowLeft") {
      siguienteAltura = lecturaSuperior - PASO_ALTURA_TECLADO;
    } else if (evento.key === "Home") {
      siguienteAltura = limitesSuperiores.minimo;
    } else if (evento.key === "End") {
      siguienteAltura = limitesSuperiores.maximo;
    }

    if (siguienteAltura === null) return;
    evento.preventDefault();
    onLecturaSuperiorChange(Number(siguienteAltura.toFixed(2)));
  }

  function iniciarArrastreInferior(evento: PointerEvent<HTMLDivElement>) {
    if (interaccionBloqueada) return;
    const posicionY = obtenerCoordenadaY(evento.clientY);
    if (posicionY === null) return;

    punteroInferiorRef.current = evento.pointerId;
    desfaseInferiorRef.current =
      posicionY - obtenerContactoPlatilloParaLectura(lecturaInferior);
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrandoInferior(true);
    evento.preventDefault();
  }

  function moverMontajeInferior(evento: PointerEvent<HTMLDivElement>) {
    if (punteroInferiorRef.current !== evento.pointerId) return;
    const posicionY = obtenerCoordenadaY(evento.clientY);
    if (posicionY === null) return;

    const contactoPlatillo = posicionY - desfaseInferiorRef.current;
    const siguienteLectura =
      calcularLecturaInferiorDesdeContactoPlatillo(contactoPlatillo);
    onLecturaInferiorChange(Number(siguienteLectura.toFixed(3)));
  }

  function finalizarArrastreInferior(evento: PointerEvent<HTMLDivElement>) {
    if (punteroInferiorRef.current !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    punteroInferiorRef.current = null;
    setArrastrandoInferior(false);
  }

  function controlarInferiorConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (interaccionBloqueada) return;
    let siguienteLectura: number | null = null;

    if (evento.key === "ArrowUp" || evento.key === "ArrowRight") {
      siguienteLectura = lecturaInferior + PASO_ALTURA_TECLADO;
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowLeft") {
      siguienteLectura = lecturaInferior - PASO_ALTURA_TECLADO;
    } else if (evento.key === "Home") {
      siguienteLectura = limitesInferiores.minimo;
    } else if (evento.key === "End") {
      siguienteLectura = limitesInferiores.maximo;
    }

    if (siguienteLectura === null) return;
    evento.preventDefault();
    onLecturaInferiorChange(Number(siguienteLectura.toFixed(2)));
  }

  return (
    <SimulatorLabStage>
      <SimulatorZoomToolbar<FocoZoom>
        zoom={zoom}
        canDecrease={indiceZoom > 0}
        canIncrease={indiceZoom < NIVELES_ZOOM.length - 1}
        onDecrease={() =>
          setIndiceZoom((actual) => Math.max(0, actual - 1))
        }
        onIncrease={() =>
          setIndiceZoom((actual) =>
            Math.min(NIVELES_ZOOM.length - 1, actual + 1),
          )
        }
        activeFocus={focoZoom}
        focusOptions={[
          { id: "montaje", label: "Montaje" },
          { id: "timer", label: "Timer 4-4", disabled: !mostrarTimer },
        ]}
        onFocusChange={seleccionarFoco}
      />

      <SimulatorSceneViewport
        ref={visorRef}
        className={`lab-scene-viewport${zoom > 1 ? " lab-scene-viewport--zoomed" : ""}${desplazandoVisor ? " lab-scene-viewport--panning" : ""}`}
        tabIndex={zoom > 1 ? 0 : -1}
        aria-label={
          zoom > 1
            ? "Vista ampliada del laboratorio; arrastra el fondo o usa las flechas para desplazarte"
            : "Vista general del laboratorio"
        }
        onPointerDown={iniciarDesplazamientoVisor}
        onPointerMove={desplazarVisor}
        onPointerUp={finalizarDesplazamientoVisor}
        onPointerCancel={finalizarDesplazamientoVisor}
      >
        <div
          ref={escenaRef}
          className="lab-scene"
          style={{
            aspectRatio: `${LIENZO_LABORATORIO.width} / ${LIENZO_LABORATORIO.height}`,
            width: `max(${zoom * 100}%, ${760 * zoom}px)`,
          }}
          role="group"
          aria-label="Montaje interactivo del experimento de caída libre"
        >
          <img
            className="lab-scene__background"
            src={fondoCaidaLibre}
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <div className="lab-worktable" aria-hidden="true" />

          {elementos
            .filter(
              (elemento) =>
                mostrarRegla ||
                ![
                  "regla",
                  "senalador-superior",
                  "senalador-inferior",
                ].includes(elemento.id),
            )
            .map((elemento) => (
            <img
              key={elemento.id}
              className={`lab-instrument lab-instrument--${elemento.id}`}
              src={elemento.src}
              alt={elemento.alt}
              draggable="false"
              style={convertirRectanguloAPorcentajes(elemento.geometria)}
            />
            ))}

          {mostrarRastro && tiempo > 0 && (
            <div className="free-fall-trail" aria-hidden="true">
              {Array.from(
                { length: Math.floor(tiempo / 0.025) + 1 },
                (_, indice) => {
                  const tiempoMarca = indice * 0.025;
                  const fraccionTiempo = Math.min(1, tiempoMarca / tiempo);
                  const recorridoVisual =
                    (montaje.esfera.top - montajeInicialEnsayo.esfera.top) *
                    fraccionTiempo ** 2;
                  const centroX =
                    montajeInicialEnsayo.esfera.left +
                    montajeInicialEnsayo.esfera.width / 2;
                  const centroY =
                    montajeInicialEnsayo.esfera.top +
                    montajeInicialEnsayo.esfera.width / 2 +
                    recorridoVisual;

                  return (
                    <i
                      key={indice}
                      style={{
                        left: `${(centroX / LIENZO_LABORATORIO.width) * 100}%`,
                        top: `${(centroY / LIENZO_LABORATORIO.height) * 100}%`,
                      }}
                    />
                  );
                },
              )}
            </div>
          )}

          <div
            className={`lab-signal-light lab-signal-light--${disparadorVerde ? "green" : "yellow"}`}
            style={obtenerEstiloIndicador(montaje.disparador, {
              x: 272.97,
              y: 54.09,
              anchoViewBox: 391.26,
              diametro: 18,
            })}
            role="img"
            aria-label={
              disparadorVerde
                ? "Indicador verde: esfera liberada"
                : estadoEnsayo === "finalizada"
                  ? "Indicador amarillo: caída finalizada"
                  : "Indicador amarillo: disparador preparado"
            }
          />

          <div
            className={`lab-signal-light lab-signal-light--plate lab-signal-light--${platilloVerde ? "green" : "red"}`}
            style={obtenerEstiloIndicador(montaje.platillo, {
              x: 210.46,
              y: 34.6,
              anchoViewBox: 323.75,
              diametro: 18,
            })}
            role="img"
            aria-label={
              platilloVerde
                ? "Indicador verde: esfera recibida en el platillo"
                : "Indicador rojo: platillo esperando la esfera"
            }
          />

          {mostrarRegla && <div
            className="lab-rule-reading lab-rule-reading--superior"
            style={obtenerEstiloLectura(lecturaSuperior)}
            aria-label={`Lectura superior: ${lecturaSuperior.toFixed(2)} metros`}
          >
            <span className="lab-rule-reading__symbol" aria-hidden="true">
              x<sub>s</sub>
            </span>
            <output>
              {lecturaSuperior.toFixed(2)} <small>m</small>
            </output>
          </div>}

          {mostrarRegla && <div
            className="lab-rule-reading lab-rule-reading--inferior"
            style={obtenerEstiloLectura(lecturaInferior)}
            aria-label={`Lectura inferior: ${lecturaInferior.toFixed(2)} metros`}
          >
            <span className="lab-rule-reading__symbol" aria-hidden="true">
              x<sub>i</sub>
            </span>
            <output>
              {lecturaInferior.toFixed(2)} <small>m</small>
            </output>
          </div>}

          {mostrarTimer && <div
            className={`lab-timer44${arrastrandoTimer ? " lab-timer44--dragging" : ""}`}
            style={convertirRectanguloAPorcentajes({
              ...montaje.timer44,
              ...posicionTimer,
              zIndex: arrastrandoTimer ? 9 : montaje.timer44.zIndex,
            })}
            role="group"
            tabIndex={0}
            aria-label="Timer 4-4 móvil sobre la mesa de laboratorio"
            title="Arrastra el Timer 4-4 sobre la mesa"
            onPointerDown={iniciarArrastreTimer}
            onPointerMove={moverTimer}
            onPointerUp={finalizarArrastreTimer}
            onPointerCancel={finalizarArrastreTimer}
            onLostPointerCapture={finalizarArrastreTimer}
            onKeyDown={controlarTimerConTeclado}
          >
            <Timer44CaidaLibre
              lectura={lecturaTimer}
              fase={faseTimer}
              onReiniciar={onReiniciarTimer}
            />
          </div>}

          <div
            className={`lab-trigger-drag${arrastrandoSuperior ? " lab-trigger-drag--active" : ""}${interaccionBloqueada ? " lab-trigger-drag--disabled" : ""}`}
            style={convertirRectanguloAPorcentajes({
              ...montaje.disparador,
              zIndex: 7,
            })}
            role="slider"
            tabIndex={interaccionBloqueada ? -1 : 0}
            aria-disabled={interaccionBloqueada}
            aria-label="Altura del disparador y de la esfera"
            aria-valuemin={limitesSuperiores.minimo}
            aria-valuemax={limitesSuperiores.maximo}
            aria-valuenow={Number(lecturaSuperior.toFixed(3))}
            aria-valuetext={`${lecturaSuperior.toFixed(2)} metros sobre la regla`}
            title="Arrastra verticalmente el conjunto superior"
            onPointerDown={iniciarArrastreSuperior}
            onPointerMove={moverMontajeSuperior}
            onPointerUp={finalizarArrastreSuperior}
            onPointerCancel={finalizarArrastreSuperior}
            onKeyDown={controlarSuperiorConTeclado}
          />

          <div
            className={`lab-plate-drag${arrastrandoInferior ? " lab-plate-drag--active" : ""}${interaccionBloqueada ? " lab-plate-drag--disabled" : ""}`}
            style={convertirRectanguloAPorcentajes({
              ...montaje.platillo,
              zIndex: 7,
            })}
            role="slider"
            tabIndex={interaccionBloqueada ? -1 : 0}
            aria-disabled={interaccionBloqueada}
            aria-label="Posición del platillo receptor"
            aria-valuemin={limitesInferiores.minimo}
            aria-valuemax={limitesInferiores.maximo}
            aria-valuenow={Number(lecturaInferior.toFixed(3))}
            aria-valuetext={`${lecturaInferior.toFixed(2)} metros sobre la regla`}
            title="Arrastra verticalmente el conjunto inferior"
            onPointerDown={iniciarArrastreInferior}
            onPointerMove={moverMontajeInferior}
            onPointerUp={finalizarArrastreInferior}
            onPointerCancel={finalizarArrastreInferior}
            onKeyDown={controlarInferiorConTeclado}
          />
        </div>
      </SimulatorSceneViewport>
    </SimulatorLabStage>
  );
}

export default LaboratorioEstatico;
