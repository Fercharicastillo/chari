import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  calcularPasoMarcadores,
  calcularPosicion,
  calcularTiempoEnPosicion,
  type CondicionesMovimiento,
} from "./physics/movimiento";
import {
  aplicarErrorRelativo,
  generarErrorRelativo,
} from "./physics/incertidumbre";
import carroMruv from "./physics/carro-mruv.svg";
import iconoInputIzquierda from "./physics/btn-input-left.svg";
import iconoInputDerecha from "./physics/btn-input-right.svg";
import fondoSimulador from "./physics/fondo_sim_mruv.svg";
import sensorMruv from "./physics/sensor-mruv.svg";
import Timer44 from "./components/Timer44";
import {
  Latex,
  SIMULATOR_CAMERA_SPEED,
  SimulatorCameraMode,
  SimulatorCheckbox,
  SimulatorExperimentPanel,
  SimulatorExperimentTransport,
  SimulatorIconButton,
  SimulatorLabStage,
  SimulatorParameter,
  SimulatorResources,
  SimulatorSceneViewport,
  SimulatorZoomToolbar,
  type RecursosSimulador,
  type SimulatorCameraModeValue,
} from "@physikos/simulator-ui";
import iconoReiniciarpoco from "../../../img/botones/sim_mru/btn-new-start-simulation-mru-01.svg";
import iconoIniciar from "../../../img/botones/sim_mru/btn-start-simulation-mru.svg";
import iconoPausar from "../../../img/botones/sim_mru/btn-stop-mru.svg";
import iconostepbystep from "../../../img/botones/sim_mru/btn-paso-01.svg";
import iconoReiniciar from "../../../img/botones/sim_mru/btn-reiniciar.svg";
import iconoInstrucciones from "../../../img/botones/sim_mru/btn-instrucciones.svg";
import iconoPantallaCompleta from "../../../img/botones/sim_mru/btn-expandir.svg";
import iconoSalirPantallaCompleta from "../../../img/botones/sim_mru/btn-comprimir-mru-01.svg";
import iconoVerClase from "./physics/btn-ver.svg";
import iconoGuiaPdf from "./physics/btn-pdf.svg";

type EstadoSimulacion = "preparada" | "ejecutando" | "pausada" | "finalizada";
type FaseSensor = "esperando" | "midiendo" | "registrado";
type ModoContador = "paso" | "recorrido";

interface Configuracion extends CondicionesMovimiento {
  posicionesSensores: number[];
}

interface RegistroSensor {
  fase: FaseSensor;
  lectura: number | null;
}

interface MedicionSensor {
  inicio: number;
  fin: number;
  lectura: number;
}

interface OpcionesVisualizacion {
  contador: boolean;
  sensores: boolean;
  ejes: boolean;
  rastro: boolean;
}

const LIMITE_PISTA = 2;
const LONGITUD_VISUAL_CARRITO = 0.25;
const ANCHO_SVG_CARRITO = 908.32;
const CENTRO_MARCADOR_TRASERO = 126.63 / ANCHO_SVG_CARRITO;
const CENTRO_MARCADOR_DELANTERO = 756.2 / ANCHO_SVG_CARRITO;
const SEPARACION_MARCADORES =
  (CENTRO_MARCADOR_DELANTERO - CENTRO_MARCADOR_TRASERO) *
  LONGITUD_VISUAL_CARRITO;
const ANCHO_CARRITO_PORCENTAJE = (LONGITUD_VISUAL_CARRITO / LIMITE_PISTA) * 100;
const POSICION_SENSOR_MINIMA = 0;
const POSICION_SENSOR_MAXIMA = LIMITE_PISTA;
const PASO_SENSOR = 0.01;
const SEPARACION_MINIMA_SENSORES = 0.1;
const POSICION_INICIAL_MAXIMA = LIMITE_PISTA;
const PASO_POSICION_INICIAL = 0.01;
const PASO_TIEMPO = 0.01;
const ERROR_PORCENTUAL_MINIMO = 0;
const ERROR_PORCENTUAL_MAXIMO = 15;
const PASO_ERROR_PORCENTUAL = 1;
const INTERVALO_RASTRO_MINIMO = 0.01;
const CANTIDAD_MAXIMA_MARCAS_RASTRO = 24;
const PASO_TIMER_TECLADO = 1.5;
const POSICION_TIMER_INICIAL = { left: 69.3274, top: 71.8594 };
const NIVELES_ZOOM = [1, 1.5, 2] as const;
const ALTO_ESCENA_INICIAL = 480;
const ETIQUETAS_VISUALIZACION: Record<keyof OpcionesVisualizacion, string> = {
  contador: "Timer 4-4",
  sensores: "Sensores",
  ejes: "Ejes",
  rastro: "Rastro",
};
const visualizacionInicial: OpcionesVisualizacion = {
  contador: true,
  sensores: true,
  ejes: true,
  rastro: false,
};
const configuracionInicial: Configuracion = {
  posicionInicial: 0,
  velocidadInicial: 0,
  aceleracion: 0.5,
  posicionesSensores: [0.4, 0.8, 1.2, 1.6],
};

interface ArrastreTimer {
  pointerId: number;
  desfaseX: number;
  desfaseY: number;
}

type FocoZoom = "carrito" | "timer";

interface ArrastreVisor {
  pointerId: number;
  clientX: number;
  clientY: number;
  scrollLeft: number;
  scrollTop: number;
}

function crearRegistrosSensores(): RegistroSensor[] {
  return Array.from({ length: 4 }, () => ({
    fase: "esperando" as const,
    lectura: null,
  }));
}

function crearSensoresDescartados(): boolean[] {
  return Array.from({ length: 4 }, () => false);
}

function crearErroresRelativos(porcentajeMaximo: number): number[] {
  return Array.from({ length: 4 }, () =>
    generarErrorRelativo(porcentajeMaximo),
  );
}

function calcularMedicionSensor(
  modo: ModoContador,
  posicionSensor: number,
  condiciones: Configuracion,
  origenTiempoContador = 0,
): MedicionSensor | null {
  if (modo === "recorrido") {
    const llegada = calcularTiempoEnPosicion(posicionSensor, condiciones);
    if (llegada === null || llegada <= origenTiempoContador) return null;

    return {
      inicio: origenTiempoContador,
      fin: llegada,
      lectura: llegada - origenTiempoContador,
    };
  }

  const paso = calcularPasoMarcadores(
    posicionSensor,
    SEPARACION_MARCADORES,
    condiciones,
  );

  if (!paso) return null;

  return {
    inicio: paso.entrada,
    fin: paso.salida,
    lectura: paso.duracion,
  };
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

function obtenerLimitesSensor(indice: number, posiciones: number[]) {
  return {
    minimo:
      indice === 0
        ? POSICION_SENSOR_MINIMA
        : Number(
            (posiciones[indice - 1] + SEPARACION_MINIMA_SENSORES).toFixed(2),
          ),
    maximo:
      indice === posiciones.length - 1
        ? POSICION_SENSOR_MAXIMA
        : Number(
            (posiciones[indice + 1] - SEPARACION_MINIMA_SENSORES).toFixed(2),
          ),
  };
}

function limitarPosicionSensor(
  valor: number,
  minimo: number,
  maximo: number,
): number {
  const posicionAjustada = Math.round(valor / PASO_SENSOR) * PASO_SENSOR;

  return Number(limitar(posicionAjustada, minimo, maximo).toFixed(2));
}

type AppProps = {
  integrado?: boolean;
  recursos?: RecursosSimulador;
};

function App({ integrado = false, recursos }: AppProps) {
  const [configuracion, setConfiguracion] = useState(configuracionInicial);
  const [estado, setEstado] = useState<EstadoSimulacion>("preparada");
  const [modoContador, setModoContador] = useState<ModoContador>("paso");
  const [modoCamara, setModoCamara] =
    useState<SimulatorCameraModeValue>("normal");
  const [errorPorcentualMaximo, setErrorPorcentualMaximo] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [visualizacion, setVisualizacion] =
    useState<OpcionesVisualizacion>(visualizacionInicial);
  const [registrosSensores, setRegistrosSensores] = useState<RegistroSensor[]>(
    crearRegistrosSensores,
  );
  const [sensorArrastrado, setSensorArrastrado] = useState<number | null>(null);
  const [carritoArrastrado, setCarritoArrastrado] = useState(false);
  const guiaLaboratorioUrl = useMemo(() => {
    if (!recursos?.guiaPdfUrl) return undefined;

    const archivoPdfUrl = new URL(recursos.guiaPdfUrl, document.baseURI).href;

    if (!recursos?.visorPdfUrl) return archivoPdfUrl;

    const visorPdfUrl = new URL(recursos.visorPdfUrl, document.baseURI);
    visorPdfUrl.searchParams.set("file", archivoPdfUrl);
    visorPdfUrl.hash = "page=1&zoom=page-width&pagemode=none";
    return visorPdfUrl.href;
  }, [recursos?.guiaPdfUrl, recursos?.visorPdfUrl]);
  const [marcasRastro, setMarcasRastro] = useState<number[]>([]);
  const [instruccionesAbiertas, setInstruccionesAbiertas] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [arrastrandoTimer, setArrastrandoTimer] = useState(false);
  const [posicionTimer, setPosicionTimer] = useState(POSICION_TIMER_INICIAL);
  const [indiceZoom, setIndiceZoom] = useState(0);
  const [focoZoom, setFocoZoom] = useState<FocoZoom>("carrito");
  const [desplazandoVisor, setDesplazandoVisor] = useState(false);
  const [altoEscena, setAltoEscena] = useState(ALTO_ESCENA_INICIAL);
  const zoom = NIVELES_ZOOM[indiceZoom];

  const cuadroAnimacion = useRef<number | null>(null);
  const simuladorRef = useRef<HTMLElement | null>(null);
  const dialogoInstruccionesRef = useRef<HTMLDialogElement | null>(null);
  const panelPistaRef = useRef<HTMLElement | null>(null);
  const visorPistaRef = useRef<HTMLDivElement | null>(null);
  const mesaTrabajoRef = useRef<HTMLDivElement | null>(null);
  const barraControlesRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<HTMLDivElement | null>(null);
  const pistaRef = useRef<HTMLDivElement | null>(null);
  const carritoRef = useRef<HTMLDivElement | null>(null);
  const inicioTramo = useRef(0);
  const tiempoAcumulado = useRef(0);
  const tiempoActualRef = useRef(0);
  const velocidadReproduccionRef = useRef(SIMULATOR_CAMERA_SPEED.normal);
  const ultimaActualizacionReloj = useRef(0);
  const intervaloRastro = useRef(INTERVALO_RASTRO_MINIMO);
  const siguienteMarcaRastro = useRef(INTERVALO_RASTRO_MINIMO);
  const registrosSensoresRef = useRef<RegistroSensor[]>(
    crearRegistrosSensores(),
  );
  const sensoresDescartadosRef = useRef<boolean[]>(crearSensoresDescartados());
  const erroresRelativosSensoresRef = useRef<number[]>(
    crearErroresRelativos(0),
  );
  const origenTiempoContadorRef = useRef(0);
  const configuracionEnsayo = useRef<Configuracion>(configuracionInicial);
  const desfaseArrastreCarrito = useRef(0);
  const punteroCarritoActivo = useRef<number | null>(null);
  const punteroSensorActivo = useRef<{
    indice: number;
    pointerId: number;
  } | null>(null);
  const arrastreTimerRef = useRef<ArrastreTimer | null>(null);
  const arrastreVisorRef = useRef<ArrastreVisor | null>(null);

  const configuracionBloqueada = estado !== "preparada";
  const movimientoPosible =
    configuracion.velocidadInicial > 0 || configuracion.aceleracion > 0;
  const sensoresEstanAdelante = configuracion.posicionesSensores.every(
    (posicion) => posicion > configuracion.posicionInicial,
  );
  const sensoresOrdenados = configuracion.posicionesSensores.every(
    (posicion, indice, sensores) =>
      indice === 0 || posicion > sensores[indice - 1],
  );
  const maximaPosicionInicial = POSICION_INICIAL_MAXIMA;

  useEffect(() => {
    const dialogo = dialogoInstruccionesRef.current;
    if (!dialogo) return;

    if (instruccionesAbiertas && !dialogo.open) {
      dialogo.showModal();
    } else if (!instruccionesAbiertas && dialogo.open) {
      dialogo.close();
    }
  }, [instruccionesAbiertas]);

  useEffect(() => {
    const actualizarPantallaCompleta = () => {
      const raizSimulador = simuladorRef.current?.getRootNode();
      const elementoPantallaCompleta =
        raizSimulador instanceof ShadowRoot
          ? raizSimulador.fullscreenElement
          : document.fullscreenElement;

      setPantallaCompleta(elementoPantallaCompleta === simuladorRef.current);
    };

    document.addEventListener("fullscreenchange", actualizarPantallaCompleta);
    return () =>
      document.removeEventListener(
        "fullscreenchange",
        actualizarPantallaCompleta,
      );
  }, []);

  const medicionesTeoricas = useMemo(
    () =>
      configuracion.posicionesSensores.map((posicionSensor) =>
        calcularMedicionSensor(modoContador, posicionSensor, configuracion),
      ),
    [configuracion, modoContador],
  );

  function obtenerTiempoContador(indice: number): number {
    const condiciones =
      estado === "preparada" ? configuracion : configuracionEnsayo.current;
    const medicion = calcularMedicionSensor(
      modoContador,
      condiciones.posicionesSensores[indice],
      condiciones,
      origenTiempoContadorRef.current,
    );
    const registro = registrosSensores[indice];

    if (
      sensoresDescartadosRef.current[indice] ||
      !medicion ||
      !registro ||
      registro.fase === "esperando"
    ) {
      return 0;
    }
    const lecturaIdeal =
      registro.fase === "registrado"
        ? (registro.lectura ?? 0)
        : limitar(tiempo - medicion.inicio, 0, medicion.lectura);

    return aplicarErrorRelativo(
      lecturaIdeal,
      erroresRelativosSensoresRef.current[indice] ?? 0,
    );
  }

  function obtenerFaseVisualSensor(
    posicionSensor: number,
    indice: number,
  ): FaseSensor {
    if (estado === "preparada") return "esperando";
    if (sensoresDescartadosRef.current[indice]) return "esperando";

    const condiciones = configuracionEnsayo.current;
    const pasoMarcadores = calcularPasoMarcadores(
      posicionSensor,
      SEPARACION_MARCADORES,
      condiciones,
    );

    if (!pasoMarcadores || tiempo < pasoMarcadores.entrada) return "esperando";
    if (tiempo < pasoMarcadores.salida) return "midiendo";

    return "registrado";
  }

  const estadoEquipo = {
    preparada: "Carrito retenido",
    ejecutando: "Carrito liberado",
    pausada: "Movimiento pausado",
    finalizada: "Ensayo finalizado",
  }[estado];
  const descripcionFaseSensor: Record<FaseSensor, string> = {
    esperando: "Haz activo",
    midiendo: "Haz interrumpido por el carrito",
    registrado: "Lectura registrada",
  };

  function moverCarrito(posicion: number) {
    const pista = pistaRef.current;
    const carrito = carritoRef.current;
    if (!pista || !carrito) return;

    const progreso = limitar(posicion / LIMITE_PISTA, 0, 1);
    const posicionReferencia = progreso * pista.clientWidth;

    const desplazamientoHastaMarcadorDelantero =
      carrito.offsetWidth * CENTRO_MARCADOR_DELANTERO;

    carrito.style.transform = `translate3d(${posicionReferencia - desplazamientoHastaMarcadorDelantero}px, 5px, 0)`;
  }

  function enfocarZona(
    foco: FocoZoom,
    comportamiento: ScrollBehavior = "smooth",
  ) {
    const visor = visorPistaRef.current;
    const objetivo = foco === "timer" ? timerRef.current : carritoRef.current;
    if (!visor || !objetivo) return;

    const limitesVisor = visor.getBoundingClientRect();
    const limitesObjetivo = objetivo.getBoundingClientRect();
    const centroX =
      limitesObjetivo.left -
      limitesVisor.left +
      visor.scrollLeft +
      limitesObjetivo.width / 2;
    const centroY =
      limitesObjetivo.top -
      limitesVisor.top +
      visor.scrollTop +
      limitesObjetivo.height / 2;

    visor.scrollTo({
      left: centroX - visor.clientWidth / 2,
      top: centroY - visor.clientHeight / 2,
      behavior: comportamiento,
    });
  }

  function seleccionarFocoZoom(foco: FocoZoom) {
    setFocoZoom(foco);
    requestAnimationFrame(() => enfocarZona(foco));
  }

  function elementoControlaSuPropioArrastre(elemento: EventTarget | null) {
    if (!(elemento instanceof Element)) return false;

    return Boolean(
      elemento.closest(
        "button, input, label, .timer44-drag, .cart--draggable, .sensor-drag-area",
      ),
    );
  }

  function iniciarDesplazamientoVisor(
    evento: ReactPointerEvent<HTMLDivElement>,
  ) {
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

  function desplazarVisor(evento: ReactPointerEvent<HTMLDivElement>) {
    const inicio = arrastreVisorRef.current;
    if (!inicio || inicio.pointerId !== evento.pointerId) return;

    evento.currentTarget.scrollLeft =
      inicio.scrollLeft - (evento.clientX - inicio.clientX);
    evento.currentTarget.scrollTop =
      inicio.scrollTop - (evento.clientY - inicio.clientY);
    evento.preventDefault();
  }

  function finalizarDesplazamientoVisor(
    evento: ReactPointerEvent<HTMLDivElement>,
  ) {
    const inicio = arrastreVisorRef.current;
    if (!inicio || inicio.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreVisorRef.current = null;
    setDesplazandoVisor(false);
  }

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => enfocarZona(focoZoom, "auto"));
    return () => cancelAnimationFrame(cuadro);
  }, [indiceZoom, focoZoom]);

  useEffect(() => {
    if (!visualizacion.contador && focoZoom === "timer") {
      setFocoZoom("carrito");
    }
  }, [visualizacion.contador, focoZoom]);

  function limitarPosicionTimer(
    left: number,
    top: number,
    elementoTimer: HTMLDivElement,
  ) {
    const panel = panelPistaRef.current;
    const mesa = mesaTrabajoRef.current;
    if (!panel || !mesa) return { left, top };

    const limitesPanel = panel.getBoundingClientRect();
    const limitesMesa = mesa.getBoundingClientRect();
    const limitesControles = barraControlesRef.current?.getBoundingClientRect();
    const limitesTimer = elementoTimer.getBoundingClientRect();
    const margenSeguridad = 8;

    // LÍMITES HORIZONTALES (Eje X)
    const minimoLeftPx = limitesMesa.left - limitesPanel.left + margenSeguridad;
    const maximoLeftPx =
      limitesMesa.right -
      limitesPanel.left -
      limitesTimer.width -
      margenSeguridad;

    // La posición vertical se define por la base del Timer. Su base puede
    // recorrer la mesa desde el borde superior hasta antes de los controles.
    const minimoTopPx =
      limitesMesa.top - limitesPanel.top - limitesTimer.height;
    const limiteInferiorBase = limitesControles
      ? Math.min(limitesMesa.bottom, limitesControles.top - margenSeguridad)
      : limitesMesa.bottom - margenSeguridad;
    const maximoTopPx = Math.max(
      minimoTopPx,
      limiteInferiorBase - limitesPanel.top - limitesTimer.height,
    );

    return {
      left: limitar(
        left,
        (minimoLeftPx / limitesPanel.width) * 100,
        (Math.max(minimoLeftPx, maximoLeftPx) / limitesPanel.width) * 100,
      ),
      top: limitar(
        top,
        (minimoTopPx / limitesPanel.height) * 100,
        (maximoTopPx / limitesPanel.height) * 100,
      ),
    };
  }

  function iniciarArrastreTimer(evento: ReactPointerEvent<HTMLDivElement>) {
    if (
      (evento.pointerType === "mouse" && evento.button !== 0) ||
      (evento.target instanceof Element && evento.target.closest("button"))
    ) {
      return;
    }

    const limitesTimer = evento.currentTarget.getBoundingClientRect();
    arrastreTimerRef.current = {
      pointerId: evento.pointerId,
      desfaseX: evento.clientX - limitesTimer.left,
      desfaseY: evento.clientY - limitesTimer.top,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrandoTimer(true);
    evento.preventDefault();
  }

  function moverTimer(evento: ReactPointerEvent<HTMLDivElement>) {
    const panel = panelPistaRef.current;
    const arrastre = arrastreTimerRef.current;
    if (!panel || !arrastre || arrastre.pointerId !== evento.pointerId) return;

    const elementoTimer = evento.currentTarget;
    const limitesPanel = panel.getBoundingClientRect();
    const left =
      ((evento.clientX - limitesPanel.left - arrastre.desfaseX) /
        limitesPanel.width) *
      100;
    const top =
      ((evento.clientY - limitesPanel.top - arrastre.desfaseY) /
        limitesPanel.height) *
      100;
    setPosicionTimer(limitarPosicionTimer(left, top, elementoTimer));
    evento.preventDefault();
  }

  function finalizarArrastreTimer(evento: ReactPointerEvent<HTMLDivElement>) {
    if (arrastreTimerRef.current?.pointerId !== evento.pointerId) return;

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    arrastreTimerRef.current = null;
    setArrastrandoTimer(false);
  }

  function moverTimerConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (
      evento.target !== evento.currentTarget ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(evento.key)
    ) {
      return;
    }

    evento.preventDefault();
    const elementoTimer = evento.currentTarget;
    const desplazamientoX =
      evento.key === "ArrowLeft"
        ? -PASO_TIMER_TECLADO
        : evento.key === "ArrowRight"
          ? PASO_TIMER_TECLADO
          : 0;
    const desplazamientoY =
      evento.key === "ArrowUp"
        ? -PASO_TIMER_TECLADO
        : evento.key === "ArrowDown"
          ? PASO_TIMER_TECLADO
          : 0;
    setPosicionTimer((actual) =>
      limitarPosicionTimer(
        actual.left + desplazamientoX,
        actual.top + desplazamientoY,
        elementoTimer,
      ),
    );
  }

  useEffect(() => {
    const panel = panelPistaRef.current;
    if (!panel || typeof ResizeObserver === "undefined") return;

    const observador = new ResizeObserver(() => {
      setAltoEscena(panel.offsetHeight);
      const timer = timerRef.current;
      if (!timer) return;

      setPosicionTimer((actual) =>
        limitarPosicionTimer(actual.left, actual.top, timer),
      );
    });
    setAltoEscena(panel.offsetHeight);
    observador.observe(panel);
    if (mesaTrabajoRef.current) observador.observe(mesaTrabajoRef.current);
    if (barraControlesRef.current)
      observador.observe(barraControlesRef.current);

    return () => observador.disconnect();
  }, []);

  function limitarPosicionInicial(valor: number) {
    const posicionAjustada =
      Math.round(valor / PASO_POSICION_INICIAL) * PASO_POSICION_INICIAL;

    return Number(
      limitar(posicionAjustada, 0, POSICION_INICIAL_MAXIMA).toFixed(2),
    );
  }

  function moverCarritoDesdePuntero(posicionHorizontal: number) {
    const pista = pistaRef.current;
    const carrito = carritoRef.current;
    if (!pista || !carrito || configuracionBloqueada) return;

    const limitesPista = pista.getBoundingClientRect();
    const posicionIzquierdaCarrito =
      posicionHorizontal - limitesPista.left - desfaseArrastreCarrito.current;
    const desplazamientoHastaMarcadorDelantero =
      carrito.getBoundingClientRect().width * CENTRO_MARCADOR_DELANTERO;
    const posicionEnMetros =
      ((posicionIzquierdaCarrito + desplazamientoHastaMarcadorDelantero) /
        limitesPista.width) *
      LIMITE_PISTA;

    setConfiguracion((actual) => ({
      ...actual,
      posicionInicial: limitarPosicionInicial(posicionEnMetros),
    }));
  }

  function comenzarArrastreCarrito(evento: ReactPointerEvent<HTMLDivElement>) {
    const carrito = carritoRef.current;
    if (!carrito || configuracionBloqueada) return;

    evento.preventDefault();
    desfaseArrastreCarrito.current =
      evento.clientX - carrito.getBoundingClientRect().left;
    punteroCarritoActivo.current = evento.pointerId;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setCarritoArrastrado(true);
  }

  function terminarArrastreCarrito(evento: ReactPointerEvent<HTMLDivElement>) {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    punteroCarritoActivo.current = null;
    setCarritoArrastrado(false);
  }

  function moverCarritoConTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (
      configuracionBloqueada ||
      !["ArrowLeft", "ArrowRight"].includes(evento.key)
    ) {
      return;
    }

    evento.preventDefault();
    const direccion = evento.key === "ArrowRight" ? 1 : -1;
    setConfiguracion((actual) => ({
      ...actual,
      posicionInicial: limitarPosicionInicial(
        actual.posicionInicial + direccion * PASO_POSICION_INICIAL,
      ),
    }));
  }

  useEffect(() => {
    if (estado === "preparada") {
      moverCarrito(configuracion.posicionInicial);
    }
  }, [configuracion.posicionInicial, estado]);

  function actualizarRastroHasta(
    tiempoActual: number,
    condiciones: Configuracion,
  ) {
    if (tiempoActual < siguienteMarcaRastro.current) return;

    const nuevasMarcas: number[] = [];
    while (
      tiempoActual >= siguienteMarcaRastro.current &&
      nuevasMarcas.length < CANTIDAD_MAXIMA_MARCAS_RASTRO
    ) {
      nuevasMarcas.push(
        limitar(
          calcularPosicion(siguienteMarcaRastro.current, condiciones),
          0,
          LIMITE_PISTA,
        ),
      );
      siguienteMarcaRastro.current += intervaloRastro.current;
    }

    if (nuevasMarcas.length > 0) {
      setMarcasRastro((actuales) =>
        [...actuales, ...nuevasMarcas].slice(
          0,
          CANTIDAD_MAXIMA_MARCAS_RASTRO + 1,
        ),
      );
    }
  }

  function actualizarSensoresHasta(
    tiempoActual: number,
    condiciones: Configuracion,
  ) {
    const mediciones = condiciones.posicionesSensores.map((posicionSensor) =>
      calcularMedicionSensor(
        modoContador,
        posicionSensor,
        condiciones,
        origenTiempoContadorRef.current,
      ),
    );
    const registrosActualizados = registrosSensoresRef.current.map(
      (registro, indice) => {
        if (sensoresDescartadosRef.current[indice]) return registro;

        const medicion = mediciones[indice];
        if (!medicion || registro.fase === "registrado") return registro;

        if (tiempoActual >= medicion.fin) {
          return {
            fase: "registrado" as const,
            lectura: medicion.lectura,
          };
        }

        if (tiempoActual >= medicion.inicio && registro.fase === "esperando") {
          return { ...registro, fase: "midiendo" as const };
        }

        return registro;
      },
    );

    if (
      registrosActualizados.some(
        (registro, indice) => registro !== registrosSensoresRef.current[indice],
      )
    ) {
      registrosSensoresRef.current = registrosActualizados;
      setRegistrosSensores(registrosActualizados);
    }
  }

  function aplicarInstante(
    tiempoActual: number,
    condiciones: Configuracion,
  ): number {
    const posicionActual = calcularPosicion(tiempoActual, condiciones);
    tiempoActualRef.current = tiempoActual;
    moverCarrito(limitar(posicionActual, 0, LIMITE_PISTA));
    actualizarRastroHasta(tiempoActual, condiciones);
    actualizarSensoresHasta(tiempoActual, condiciones);

    return posicionActual;
  }

  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const ajustarAlCambiarTamano = () => {
      const condiciones =
        estado === "preparada" ? configuracion : configuracionEnsayo.current;
      const posicion =
        estado === "preparada"
          ? configuracion.posicionInicial
          : calcularPosicion(tiempoActualRef.current, condiciones);

      moverCarrito(posicion);
    };
    const observador = new ResizeObserver(ajustarAlCambiarTamano);
    observador.observe(pista);

    return () => observador.disconnect();
  }, [configuracion.posicionInicial, estado]);

  useEffect(() => {
    if (estado !== "ejecutando") return;

    const animar = (marcaTiempo: number) => {
      if (inicioTramo.current === 0) inicioTramo.current = marcaTiempo;

      const tiempoActual =
        tiempoAcumulado.current +
        ((marcaTiempo - inicioTramo.current) / 1000) *
          velocidadReproduccionRef.current;
      const condiciones = configuracionEnsayo.current;
      const posicionActual = aplicarInstante(tiempoActual, condiciones);

      // El texto del reloj no necesita actualizarse a 60 fps. Limitarlo a unas
      // 30 actualizaciones por segundo deja más recursos para mover el SVG.
      if (marcaTiempo - ultimaActualizacionReloj.current >= 33) {
        ultimaActualizacionReloj.current = marcaTiempo;
        setTiempo(tiempoActual);
      }

      if (posicionActual >= LIMITE_PISTA) {
        const llegadaFinal = calcularTiempoEnPosicion(
          LIMITE_PISTA,
          condiciones,
        );
        setTiempo(llegadaFinal ?? tiempoActual);
        aplicarInstante(llegadaFinal ?? tiempoActual, condiciones);
        tiempoAcumulado.current = llegadaFinal ?? tiempoActual;
        setEstado("finalizada");
        return;
      }

      cuadroAnimacion.current = requestAnimationFrame(animar);
    };

    cuadroAnimacion.current = requestAnimationFrame(animar);

    return () => {
      if (cuadroAnimacion.current !== null) {
        cancelAnimationFrame(cuadroAnimacion.current);
      }
    };
  }, [estado, modoContador]);

  function cambiarParametro(campo: keyof Configuracion, valor: number) {
    setConfiguracion((actual) => ({ ...actual, [campo]: valor }));
  }

  function cambiarPosicionSensor(indice: number, valor: number) {
    setConfiguracion((actual) => {
      const { minimo, maximo } = obtenerLimitesSensor(
        indice,
        actual.posicionesSensores,
      );

      return {
        ...actual,
        posicionesSensores: actual.posicionesSensores.map(
          (posicion, posicionIndice) =>
            posicionIndice === indice
              ? limitarPosicionSensor(valor, minimo, maximo)
              : posicion,
        ),
      };
    });
  }

  function moverSensorDesdePuntero(indice: number, posicionHorizontal: number) {
    const pista = pistaRef.current;
    if (!pista || configuracionBloqueada) return;

    const limitesPista = pista.getBoundingClientRect();
    const posicionEnMetros =
      ((posicionHorizontal - limitesPista.left) / limitesPista.width) *
      LIMITE_PISTA;

    setConfiguracion((actual) => {
      const { minimo, maximo } = obtenerLimitesSensor(
        indice,
        actual.posicionesSensores,
      );

      return {
        ...actual,
        posicionesSensores: actual.posicionesSensores.map(
          (posicion, posicionIndice) =>
            posicionIndice === indice
              ? limitarPosicionSensor(posicionEnMetros, minimo, maximo)
              : posicion,
        ),
      };
    });
  }

  function comenzarArrastreSensor(
    indice: number,
    evento: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (configuracionBloqueada) return;

    evento.preventDefault();
    punteroSensorActivo.current = { indice, pointerId: evento.pointerId };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setSensorArrastrado(indice);
    moverSensorDesdePuntero(indice, evento.clientX);
  }

  function terminarArrastreSensor(evento: ReactPointerEvent<HTMLDivElement>) {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    punteroSensorActivo.current = null;
    setSensorArrastrado(null);
  }

  useEffect(() => {
    function seguirArrastre(evento: PointerEvent) {
      if (punteroCarritoActivo.current === evento.pointerId) {
        moverCarritoDesdePuntero(evento.clientX);
      }

      const sensorActivo = punteroSensorActivo.current;
      if (sensorActivo?.pointerId === evento.pointerId) {
        moverSensorDesdePuntero(sensorActivo.indice, evento.clientX);
      }
    }

    function finalizarArrastre(evento: PointerEvent) {
      if (punteroCarritoActivo.current === evento.pointerId) {
        punteroCarritoActivo.current = null;
        setCarritoArrastrado(false);
      }

      if (punteroSensorActivo.current?.pointerId === evento.pointerId) {
        punteroSensorActivo.current = null;
        setSensorArrastrado(null);
      }
    }

    window.addEventListener("pointermove", seguirArrastre);
    window.addEventListener("pointerup", finalizarArrastre);
    window.addEventListener("pointercancel", finalizarArrastre);

    return () => {
      window.removeEventListener("pointermove", seguirArrastre);
      window.removeEventListener("pointerup", finalizarArrastre);
      window.removeEventListener("pointercancel", finalizarArrastre);
    };
  });

  function moverSensorConTeclado(
    indice: number,
    evento: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      configuracionBloqueada ||
      !["ArrowLeft", "ArrowRight"].includes(evento.key)
    ) {
      return;
    }

    evento.preventDefault();
    const direccion = evento.key === "ArrowRight" ? 1 : -1;
    setConfiguracion((actual) => {
      const { minimo, maximo } = obtenerLimitesSensor(
        indice,
        actual.posicionesSensores,
      );

      return {
        ...actual,
        posicionesSensores: actual.posicionesSensores.map(
          (posicion, posicionIndice) =>
            posicionIndice === indice
              ? limitarPosicionSensor(
                  posicion + direccion * PASO_SENSOR,
                  minimo,
                  maximo,
                )
              : posicion,
        ),
      };
    });
  }

  function cambiarModoContador(modo: ModoContador) {
    if (estado !== "preparada") return;

    const registrosIniciales = crearRegistrosSensores();
    sensoresDescartadosRef.current = crearSensoresDescartados();
    origenTiempoContadorRef.current = 0;
    erroresRelativosSensoresRef.current = crearErroresRelativos(
      errorPorcentualMaximo,
    );
    registrosSensoresRef.current = registrosIniciales;
    setRegistrosSensores(registrosIniciales);
    setTiempo(0);
    setModoContador(modo);
  }

  function cambiarModoCamara(valor: SimulatorCameraModeValue) {
    if (estado === "ejecutando") {
      tiempoAcumulado.current = tiempoActualRef.current;
      inicioTramo.current = 0;
    }

    velocidadReproduccionRef.current = SIMULATOR_CAMERA_SPEED[valor];
    setModoCamara(valor);
  }

  function alternarVisualizacion(opcion: keyof OpcionesVisualizacion) {
    setVisualizacion((actual) => ({
      ...actual,
      [opcion]: !actual[opcion],
    }));
  }

  function prepararEnsayo(condiciones: Configuracion) {
    configuracionEnsayo.current = condiciones;
    tiempoAcumulado.current = 0;
    tiempoActualRef.current = 0;
    ultimaActualizacionReloj.current = 0;
    setTiempo(0);

    const tiempoHastaFinal = calcularTiempoEnPosicion(
      LIMITE_PISTA,
      condiciones,
    );
    intervaloRastro.current = Math.max(
      INTERVALO_RASTRO_MINIMO,
      (tiempoHastaFinal ?? 0) / CANTIDAD_MAXIMA_MARCAS_RASTRO,
    );
    siguienteMarcaRastro.current = intervaloRastro.current;
    setMarcasRastro([condiciones.posicionInicial]);
    erroresRelativosSensoresRef.current = crearErroresRelativos(
      errorPorcentualMaximo,
    );

    const registrosIniciales = crearRegistrosSensores();
    sensoresDescartadosRef.current = crearSensoresDescartados();
    origenTiempoContadorRef.current = 0;
    registrosSensoresRef.current = registrosIniciales;
    setRegistrosSensores(registrosIniciales);
  }

  function restablecerEnsayo(condiciones: Configuracion) {
    if (cuadroAnimacion.current !== null) {
      cancelAnimationFrame(cuadroAnimacion.current);
      cuadroAnimacion.current = null;
    }

    inicioTramo.current = 0;
    tiempoAcumulado.current = 0;
    tiempoActualRef.current = 0;
    ultimaActualizacionReloj.current = 0;
    intervaloRastro.current = INTERVALO_RASTRO_MINIMO;
    siguienteMarcaRastro.current = INTERVALO_RASTRO_MINIMO;
    configuracionEnsayo.current = condiciones;
    setTiempo(0);
    setMarcasRastro([]);
    erroresRelativosSensoresRef.current = crearErroresRelativos(
      errorPorcentualMaximo,
    );

    const registrosIniciales = crearRegistrosSensores();
    sensoresDescartadosRef.current = crearSensoresDescartados();
    origenTiempoContadorRef.current = 0;
    registrosSensoresRef.current = registrosIniciales;
    setRegistrosSensores(registrosIniciales);
    moverCarrito(condiciones.posicionInicial);
    setEstado("preparada");
  }

  function iniciar() {
    if (!movimientoPosible || !sensoresEstanAdelante || !sensoresOrdenados)
      return;

    if (estado === "preparada") {
      prepararEnsayo(configuracion);
    }

    inicioTramo.current = 0;
    setEstado("ejecutando");
  }

  function pausar() {
    tiempoAcumulado.current = tiempoActualRef.current;
    setTiempo(tiempoActualRef.current);
    inicioTramo.current = 0;
    setEstado("pausada");
  }

  function avanzarPasoAPaso() {
    if (
      estado === "ejecutando" ||
      estado === "finalizada" ||
      !movimientoPosible ||
      !sensoresEstanAdelante ||
      !sensoresOrdenados
    ) {
      return;
    }

    const condiciones =
      estado === "preparada" ? configuracion : configuracionEnsayo.current;
    if (estado === "preparada") prepararEnsayo(condiciones);

    const llegadaFinal = calcularTiempoEnPosicion(LIMITE_PISTA, condiciones);
    const tiempoSiguiente = Math.min(
      tiempoActualRef.current + PASO_TIEMPO,
      llegadaFinal ?? Number.POSITIVE_INFINITY,
    );
    const posicionActual = aplicarInstante(tiempoSiguiente, condiciones);

    tiempoAcumulado.current = tiempoSiguiente;
    inicioTramo.current = 0;
    setTiempo(tiempoSiguiente);
    setEstado(posicionActual >= LIMITE_PISTA ? "finalizada" : "pausada");
  }

  function reiniciarAnimacion() {
    restablecerEnsayo(configuracion);
  }

  function reiniciarContadoresTimer() {
    const condiciones =
      estado === "preparada" ? configuracion : configuracionEnsayo.current;
    const tiempoReinicio = tiempoActualRef.current;

    sensoresDescartadosRef.current = condiciones.posicionesSensores.map(
      (posicionSensor) => {
        if (modoContador === "recorrido") {
          const llegada = calcularTiempoEnPosicion(posicionSensor, condiciones);
          return llegada !== null && tiempoReinicio >= llegada;
        }

        const paso = calcularPasoMarcadores(
          posicionSensor,
          SEPARACION_MARCADORES,
          condiciones,
        );
        return paso !== null && tiempoReinicio >= paso.entrada;
      },
    );
    origenTiempoContadorRef.current =
      modoContador === "recorrido" ? tiempoReinicio : 0;
    erroresRelativosSensoresRef.current = crearErroresRelativos(
      errorPorcentualMaximo,
    );

    const registrosIniciales = crearRegistrosSensores();
    registrosSensoresRef.current = registrosIniciales;
    setRegistrosSensores(registrosIniciales);
  }

  function alternarModoDesdeTimer() {
    cambiarModoContador(modoContador === "paso" ? "recorrido" : "paso");
  }

  async function alternarPantallaCompleta() {
    const simulador = simuladorRef.current;
    if (!simulador) return;

    try {
      if (!document.fullscreenElement) {
        await simulador.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("No se pudo cambiar el modo de pantalla completa:", error);
    }
  }

  function reiniciarSimulador() {
    const configuracionRestaurada: Configuracion = {
      ...configuracionInicial,
      posicionesSensores: [...configuracionInicial.posicionesSensores],
    };

    restablecerEnsayo(configuracionRestaurada);
    setConfiguracion(configuracionRestaurada);
    setModoContador("paso");
    setErrorPorcentualMaximo(0);
    erroresRelativosSensoresRef.current = crearErroresRelativos(0);
    velocidadReproduccionRef.current = SIMULATOR_CAMERA_SPEED.normal;
    setModoCamara("normal");
    setVisualizacion({ ...visualizacionInicial });
    punteroCarritoActivo.current = null;
    punteroSensorActivo.current = null;
    arrastreTimerRef.current = null;
    setCarritoArrastrado(false);
    setSensorArrastrado(null);
    setArrastrandoTimer(false);
    arrastreVisorRef.current = null;
    setDesplazandoVisor(false);
    setIndiceZoom(0);
    setFocoZoom("carrito");
    setPosicionTimer(() => {
      const timer = timerRef.current;
      return timer
        ? limitarPosicionTimer(
            POSICION_TIMER_INICIAL.left,
            POSICION_TIMER_INICIAL.top,
            timer,
          )
        : POSICION_TIMER_INICIAL;
    });
  }

  return (
    <div
      className={`app-shell${integrado ? " app-shell--integrated" : ""}`}
      data-recurso-clase={recursos?.claseUrl || undefined}
      data-recurso-guia={recursos?.guiaId || undefined}
    >
      {!integrado && (
        <header className="topbar">
          <a className="brand" href="../../" aria-label="Volver a Physikos">
            <span className="brand-phi">Φ</span>
            <span>Physikós</span>
          </a>
          <span className="prototype-badge">Prototipo abierto</span>
        </header>
      )}

      <main ref={simuladorRef} className="simulator">
        <header className="page-header">
          <span className="page-icon" aria-hidden="true"></span>
          <div>
            <h1>Simulador de MRUV en pista neumática</h1>
            <p>
              Selecciona cómo actuará el contador y registra los cuatro tiempos.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="header-action-button"
              onClick={() => setInstruccionesAbiertas(true)}
            >
              <img src={iconoInstrucciones} alt="" aria-hidden="true" />
              <span>Instrucciones</span>
            </button>
            <button
              type="button"
              className="header-action-button"
              aria-pressed={pantallaCompleta}
              onClick={alternarPantallaCompleta}
            >
              <img
                src={
                  pantallaCompleta
                    ? iconoSalirPantallaCompleta
                    : iconoPantallaCompleta
                }
                alt=""
                aria-hidden="true"
              />
              <span>
                {pantallaCompleta
                  ? "Salir de pantalla completa"
                  : "Pantalla completa"}
              </span>
            </button>
          </div>
        </header>

        <section className="workspace" aria-label="Simulador MRUV">
          <div className="column-left">
            <SimulatorExperimentPanel>
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
                    { id: "carrito", label: "Carrito" },
                    {
                      id: "timer",
                      label: "Timer 4-4",
                      disabled: !visualizacion.contador,
                    },
                  ]}
                  onFocusChange={seleccionarFocoZoom}
                />

                <SimulatorSceneViewport
                  ref={visorPistaRef}
                  className={`mruv-scene-viewport${zoom > 1 ? " mruv-scene-viewport--zoomed" : ""}${desplazandoVisor ? " mruv-scene-viewport--panning" : ""}`}
                  tabIndex={zoom > 1 ? 0 : -1}
                  aria-label={
                    zoom > 1
                      ? "Vista ampliada del simulador; arrastra el fondo para desplazarte"
                      : "Vista general del simulador"
                  }
                  onPointerDown={iniciarDesplazamientoVisor}
                  onPointerMove={desplazarVisor}
                  onPointerUp={finalizarDesplazamientoVisor}
                  onPointerCancel={finalizarDesplazamientoVisor}
                  onLostPointerCapture={finalizarDesplazamientoVisor}
                >
                  <div
                    className="mruv-zoom-canvas"
                    style={{
                      width: `max(${zoom * 100}%, ${760 * zoom}px)`,
                      height: `${altoEscena * zoom}px`,
                    }}
                  >
                    <section
                      ref={panelPistaRef}
                      className="track-panel"
                      style={{
                        width: `${100 / zoom}%`,
                        transform: `scale(${zoom})`,
                      }}
                    >
                      <div className="instrument-header">
                        <div
                          className={`equipment-status equipment-status--${estado}`}
                          aria-live="polite"
                        >
                          <i aria-hidden="true" />
                          <span>{estadoEquipo}</span>
                        </div>
                      </div>

                      {visualizacion.contador && (
                        <div
                          ref={timerRef}
                          className={`timer44-drag${arrastrandoTimer ? " timer44-drag--dragging" : ""}`}
                          style={{
                            left: `${posicionTimer.left}%`,
                            top: `${posicionTimer.top}%`,
                          }}
                          role="group"
                          tabIndex={0}
                          aria-label="Timer 4-4 móvil sobre la mesa de trabajo"
                          title="Arrastra el Timer 4-4 dentro de la mesa de trabajo"
                          onPointerDown={iniciarArrastreTimer}
                          onPointerMove={moverTimer}
                          onPointerUp={finalizarArrastreTimer}
                          onPointerCancel={finalizarArrastreTimer}
                          onLostPointerCapture={finalizarArrastreTimer}
                          onKeyDown={moverTimerConTeclado}
                        >
                          <Timer44
                            lecturas={registrosSensores.map((_, indice) =>
                              obtenerTiempoContador(indice),
                            )}
                            fases={registrosSensores.map(
                              (registro) => registro.fase,
                            )}
                            modo={modoContador}
                            modoDeshabilitado={configuracionBloqueada}
                            onReiniciarContadores={reiniciarContadoresTimer}
                            onCambiarModo={alternarModoDesdeTimer}
                          />
                        </div>
                      )}

                      <div className="scene-background" aria-hidden="true">
                        <img src={fondoSimulador} alt="" draggable={false} />
                      </div>

                      <div
                        ref={mesaTrabajoRef}
                        className="track-worktable"
                        aria-hidden="true"
                      />

                      <div
                        ref={pistaRef}
                        className="track"
                        aria-label="Pista de dos metros"
                      >
                        {visualizacion.rastro && marcasRastro.length > 0 && (
                          <div className="motion-trail" aria-hidden="true">
                            {marcasRastro.map((posicion, indice) => (
                              <i
                                key={`${indice}-${posicion}`}
                                style={{
                                  left: `${(posicion / LIMITE_PISTA) * 100}%`,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {visualizacion.sensores &&
                          configuracion.posicionesSensores.map(
                            (posicionSensor, indice) => {
                              const faseVisual = obtenerFaseVisualSensor(
                                posicionSensor,
                                indice,
                              );
                              const { minimo, maximo } = obtenerLimitesSensor(
                                indice,
                                configuracion.posicionesSensores,
                              );
                              const posicionVisual = limitar(
                                (posicionSensor / LIMITE_PISTA) * 100,
                                0,
                                100,
                              );

                              return (
                                <div
                                  key={indice}
                                  className={`sensor sensor--${faseVisual}${indice % 2 === 1 ? " sensor--control-staggered" : ""}${sensorArrastrado === indice ? " sensor--dragging" : ""}`}
                                  style={{ left: `${posicionVisual}%` }}
                                >
                                  <div
                                    className="sensor-inline-control"
                                    aria-label={`Posición del sensor ${indice + 1}`}
                                  >
                                    <strong className="sensor-number">
                                      {indice + 1}
                                    </strong>
                                    <button
                                      type="button"
                                      aria-label={`Mover sensor ${indice + 1} hacia la izquierda`}
                                      disabled={
                                        configuracionBloqueada ||
                                        posicionSensor <= minimo
                                      }
                                      onPointerDown={(evento) =>
                                        evento.stopPropagation()
                                      }
                                      onClick={() =>
                                        cambiarPosicionSensor(
                                          indice,
                                          posicionSensor - PASO_SENSOR,
                                        )
                                      }
                                    >
                                      <img
                                        src={iconoInputIzquierda}
                                        alt=""
                                        aria-hidden="true"
                                        draggable="false"
                                      />
                                    </button>
                                    <output aria-live="polite">
                                      {posicionSensor.toFixed(2)} m
                                    </output>
                                    <button
                                      type="button"
                                      aria-label={`Mover sensor ${indice + 1} hacia la derecha`}
                                      disabled={
                                        configuracionBloqueada ||
                                        posicionSensor >= maximo
                                      }
                                      onPointerDown={(evento) =>
                                        evento.stopPropagation()
                                      }
                                      onClick={() =>
                                        cambiarPosicionSensor(
                                          indice,
                                          posicionSensor + PASO_SENSOR,
                                        )
                                      }
                                    >
                                      <img
                                        src={iconoInputDerecha}
                                        alt=""
                                        aria-hidden="true"
                                        draggable="false"
                                      />
                                    </button>
                                  </div>
                                  <div
                                    className="sensor-drag-area"
                                    role="slider"
                                    tabIndex={configuracionBloqueada ? -1 : 0}
                                    aria-valuemin={minimo}
                                    aria-valuemax={maximo}
                                    aria-valuenow={posicionSensor}
                                    aria-valuetext={`${posicionSensor.toFixed(2)} metros`}
                                    aria-disabled={configuracionBloqueada}
                                    aria-label={`Sensor ${indice + 1} en ${posicionSensor.toFixed(2)} metros. ${descripcionFaseSensor[faseVisual]}`}
                                    onPointerDown={(evento) =>
                                      comenzarArrastreSensor(indice, evento)
                                    }
                                    onPointerUp={terminarArrastreSensor}
                                    onPointerCancel={terminarArrastreSensor}
                                    onKeyDown={(evento) =>
                                      moverSensorConTeclado(indice, evento)
                                    }
                                  >
                                    <img
                                      src={sensorMruv}
                                      alt=""
                                      draggable="false"
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}

                        <div
                          ref={carritoRef}
                          className={`cart${configuracionBloqueada ? "" : " cart--draggable"}${carritoArrastrado ? " cart--dragging" : ""}`}
                          style={{ width: `${ANCHO_CARRITO_PORCENTAJE}%` }}
                          role="slider"
                          tabIndex={configuracionBloqueada ? -1 : 0}
                          aria-label="Posición inicial del carrito"
                          aria-valuemin={0}
                          aria-valuemax={maximaPosicionInicial}
                          aria-valuenow={configuracion.posicionInicial}
                          aria-valuetext={`${configuracion.posicionInicial.toFixed(2)} metros`}
                          aria-disabled={configuracionBloqueada}
                          onPointerDown={comenzarArrastreCarrito}
                          onPointerUp={terminarArrastreCarrito}
                          onPointerCancel={terminarArrastreCarrito}
                          onKeyDown={moverCarritoConTeclado}
                        >
                          <span
                            className="cart-marker cart-marker--rear"
                            style={{
                              left: `${CENTRO_MARCADOR_TRASERO * 100}%`,
                            }}
                            aria-hidden="true"
                          >
                            fin
                          </span>
                          <span
                            className="cart-marker cart-marker--front"
                            style={{
                              left: `${CENTRO_MARCADOR_DELANTERO * 100}%`,
                            }}
                            aria-hidden="true"
                          >
                            {estado === "preparada" ? "x₀" : "x(t)"}
                          </span>
                          <img
                            src={carroMruv}
                            alt="Carrito sobre la pista neumática"
                            draggable="false"
                          />
                        </div>

                        {visualizacion.ejes && (
                          <div className="axis">
                            {[0, 0.5, 1, 1.5, 2].map((marca) => (
                              <span
                                key={marca}
                                style={{
                                  left: `${(marca / LIMITE_PISTA) * 100}%`,
                                }}
                              >
                                {marca.toFixed(1)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </SimulatorSceneViewport>
              </SimulatorLabStage>

              <SimulatorExperimentTransport ref={barraControlesRef}>
                <fieldset className="view-options simulator-experiment-visibility">
                  <legend>Mostrar</legend>
                  {(
                    Object.keys(visualizacion) as Array<
                      keyof OpcionesVisualizacion
                    >
                  ).map((opcion) => (
                    <SimulatorCheckbox
                      key={opcion}
                      label={ETIQUETAS_VISUALIZACION[opcion]}
                      checked={visualizacion[opcion]}
                      onChange={() => alternarVisualizacion(opcion)}
                    />
                  ))}
                </fieldset>

                <div className="transport-controls__main">
                  <SimulatorIconButton
                    type="button"
                    icon={iconoReiniciarpoco}
                    label="Reiniciar solo el movimiento"
                    onClick={reiniciarAnimacion}
                  />

                  {estado === "ejecutando" ? (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoPausar}
                      label="Pausar ensayo"
                      onClick={pausar}
                    />
                  ) : (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoIniciar}
                      label={
                        estado === "pausada"
                          ? "Continuar ensayo"
                          : "Liberar carrito"
                      }
                      onClick={iniciar}
                      disabled={
                        !movimientoPosible ||
                        !sensoresEstanAdelante ||
                        !sensoresOrdenados ||
                        estado === "finalizada"
                      }
                    />
                  )}

                  <SimulatorIconButton
                    type="button"
                    icon={iconostepbystep}
                    label="Avanzar 0,01 segundos"
                    onClick={avanzarPasoAPaso}
                    disabled={
                      estado === "ejecutando" ||
                      estado === "finalizada" ||
                      !movimientoPosible ||
                      !sensoresEstanAdelante ||
                      !sensoresOrdenados
                    }
                  />
                </div>

                <SimulatorIconButton
                  type="button"
                  icon={iconoReiniciar}
                  label="Reiniciar todo el simulador"
                  shape="round"
                  onClick={reiniciarSimulador}
                />
              </SimulatorExperimentTransport>
            </SimulatorExperimentPanel>

            <section className="simulator-page__description">
              <article className="simulator-page-info-card">
                <h3>Ecuaciones del MRUV</h3>
                <Latex
                  formula={String.raw`x(t)=x_0+v_0t+\frac{1}{2}a\,t^2`}
                  displayMode
                  className="simulator-page-equation"
                  ariaLabel="x de t es igual a x sub cero más v sub cero por t más un medio de a por t al cuadrado"
                />
              </article>
            </section>
          </div>
          <aside className="settings-panel simulator-card">
            <fieldset
              className="counter-mode"
              disabled={configuracionBloqueada}
            >
              <legend>Modo del contador</legend>
              <label>
                <input
                  type="radio"
                  name="modo-contador"
                  value="paso"
                  checked={modoContador === "paso"}
                  onChange={() => cambiarModoContador("paso")}
                />
                <span>
                  <strong>Paso por sensor</strong>
                  <div>
                    <span
                      className="timer44-mode timer44-mode--1"
                      role="img"
                      aria-label="Timer 4-4 midiendo el paso por cada sensor"
                    />
                  </div>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="modo-contador"
                  value="recorrido"
                  checked={modoContador === "recorrido"}
                  onChange={() => cambiarModoContador("recorrido")}
                />
                <span>
                  <strong>Desde la liberación</strong>
                  <div>
                    <span
                      className="timer44-mode timer44-mode--2"
                      role="img"
                      aria-label="Timer 4-4 midiendo desde la liberación hasta cada sensor"
                    />
                  </div>
                </span>
              </label>
            </fieldset>

            <SimulatorParameter
              id="posicion-inicial"
              label="Posición inicial del carrito"
              symbol="x₀"
              unit="m"
              min={0}
              max={maximaPosicionInicial}
              step={PASO_POSICION_INICIAL}
              value={configuracion.posicionInicial}
              disabled={configuracionBloqueada}
              onChange={(valor) =>
                cambiarParametro(
                  "posicionInicial",
                  limitarPosicionInicial(valor),
                )
              }
            />

            <SimulatorParameter
              id="velocidad-inicial"
              label="Velocidad inicial"
              symbol="v₀"
              unit="m/s"
              min={0}
              max={2}
              step={0.1}
              value={configuracion.velocidadInicial}
              disabled={configuracionBloqueada}
              onChange={(valor) => cambiarParametro("velocidadInicial", valor)}
            />
            <SimulatorParameter
              id="aceleracion"
              label="Aceleración"
              symbol="a"
              unit="m/s²"
              min={0}
              max={2}
              step={0.05}
              value={configuracion.aceleracion}
              disabled={configuracionBloqueada}
              onChange={(valor) => cambiarParametro("aceleracion", valor)}
            />
            <SimulatorParameter
              id="incertidumbre-medicion"
              label="Incertidumbre máxima"
              symbol="ε"
              unit="%"
              min={ERROR_PORCENTUAL_MINIMO}
              max={ERROR_PORCENTUAL_MAXIMO}
              step={PASO_ERROR_PORCENTUAL}
              value={errorPorcentualMaximo}
              decimals={0}
              disabled={configuracionBloqueada}
              onChange={setErrorPorcentualMaximo}
            />

            <div className="sensor-readings" aria-live="polite">
              {registrosSensores.map((registro, indice) => (
                <div
                  key={indice}
                  className={`sensor-reading sensor-reading--${registro.fase}`}
                >
                  <span>Sensor {indice + 1}</span>
                  <strong>
                    {registro.fase === "esperando" && "Haz activo"}
                    {registro.fase === "midiendo" &&
                      (modoContador === "paso"
                        ? "Carrito detectado"
                        : "Cronómetro activo")}
                    {registro.fase === "registrado" &&
                      `${obtenerTiempoContador(indice).toFixed(3)} s`}
                  </strong>
                </div>
              ))}
            </div>
            <SimulatorCameraMode
              value={modoCamara}
              onChange={cambiarModoCamara}
            />
            {!movimientoPosible && (
              <p className="validation-message">
                La velocidad inicial y la aceleración no pueden ser cero al
                mismo tiempo.
              </p>
            )}
            {!sensoresEstanAdelante && (
              <p className="validation-message">
                Todos los sensores deben estar delante de la posición inicial.
              </p>
            )}
            {!sensoresOrdenados && (
              <p className="validation-message">
                Las posiciones deben mantener el orden x₁ &lt; x₂ &lt; x₃ &lt;
                x₄.
              </p>
            )}
            {estado === "preparada" &&
              medicionesTeoricas.some((medicion) => medicion === null) &&
              movimientoPosible && (
                <p className="validation-message">
                  El móvil no alcanzará todos los sensores.
                </p>
              )}
          </aside>
        </section>

        <section className="learning-note simulator-card">
          <strong>Tu tarea como estudiante</strong>
          <div className="learning-note__description">
            {modoContador === "paso" ? (
              <p>
                Usa la separación conocida entre los marcadores (
                {SEPARACION_MARCADORES.toFixed(2).replace(".", ",")} m) y
                registra cada tiempo de paso Δt para calcular las velocidades
                instantáneas.
              </p>
            ) : (
              <p>
                Registra el tiempo acumulado correspondiente a la posición de
                cada sensor. Los cálculos posteriores quedan a tu cargo.
              </p>
            )}
            <SimulatorResources
              recursos={[
                {
                  id: "clase-mruv",
                  etiqueta: "Ver Clase",
                  url: recursos?.claseUrl,
                  icono: iconoVerClase,
                  abrirEnNuevaPestana: true,
                },
                {
                  id: recursos?.guiaId || "guia-laboratorio-mruv",
                  etiqueta: "Guía Lab",
                  url: guiaLaboratorioUrl,
                  icono: iconoGuiaPdf,
                  abrirEnNuevaPestana: true,
                },
              ]}
            />
          </div>
        </section>

        <dialog
          ref={dialogoInstruccionesRef}
          className="instructions-dialog"
          aria-labelledby="titulo-instrucciones-mruv"
          onCancel={() => setInstruccionesAbiertas(false)}
          onClose={() => setInstruccionesAbiertas(false)}
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) {
              setInstruccionesAbiertas(false);
            }
          }}
        >
          <div className="instructions-dialog__content">
            <div className="instructions-dialog__header">
              <div>
                <p className="eyebrow">Guía rápida</p>
                <h2 id="titulo-instrucciones-mruv">
                  Cómo utilizar el simulador
                </h2>
              </div>
              <button
                type="button"
                className="instructions-dialog__close"
                aria-label="Cerrar instrucciones"
                onClick={() => setInstruccionesAbiertas(false)}
              >
                ×
              </button>
            </div>

            <ol className="instructions-list">
              <li>
                <strong>Elige el modo del Timer 4-4.</strong>
                <span>
                  Puedes medir el paso entre marcadores o el tiempo desde la
                  liberación.
                </span>
              </li>
              <li>
                <strong>Configura el movimiento.</strong>
                <span>
                  Ajusta la posición, la velocidad inicial y la aceleración.
                </span>
              </li>
              <li>
                <strong>Ubica los cuatro sensores.</strong>
                <span>
                  Utiliza sus botones, las flechas del teclado o arrástralos
                  sobre el riel.
                </span>
              </li>
              <li>
                <strong>Ejecuta el ensayo.</strong>
                <span>
                  Inicia, pausa o avanza en intervalos de 0,01 segundos.
                </span>
              </li>
              <li>
                <strong>Registra las lecturas.</strong>
                <span>
                  Consulta las cuatro pantallas y realiza por tu cuenta los
                  cálculos solicitados por el docente.
                </span>
              </li>
              <li>
                <strong>Amplía el carrito o el Timer.</strong>
                <span>
                  Selecciona un nivel de zoom y usa Carrito o Timer 4-4 para
                  centrar la vista. Con la imagen ampliada, arrastra el fondo
                  para recorrer el simulador.
                </span>
              </li>
              <li>
                <strong>Simula la incertidumbre experimental.</strong>
                <span>
                  El porcentaje seleccionado define el error máximo en los
                  cuatro canales del Timer. Cada nueva liberación sortea una
                  desviación distinta entre −{errorPorcentualMaximo.toFixed(0)}{" "}
                  % y +{errorPorcentualMaximo.toFixed(0)} %.
                </span>
              </li>
              <li>
                <strong>Usa el reinicio adecuado.</strong>
                <span>
                  El Timer borra solo sus contadores; los otros dos botones
                  reinician el movimiento o todo el simulador.
                </span>
              </li>
            </ol>

            <button
              type="button"
              className="instructions-dialog__accept"
              onClick={() => setInstruccionesAbiertas(false)}
            >
              Entendido
            </button>
          </div>
        </dialog>
      </main>
    </div>
  );
}

export default App;
