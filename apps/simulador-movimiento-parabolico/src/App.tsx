import { useEffect, useMemo, useRef, useState } from "react";
import {
  Latex,
  SIMULATOR_CAMERA_SPEED,
  SimulatorCameraMode,
  SimulatorExperimentPanel,
  SimulatorExperimentTransport,
  SimulatorFullscreenShell,
  SimulatorIconButton,
  SimulatorLabStage,
  SimulatorParameter,
  SimulatorResources,
  SimulatorVisibilityOptions,
  useSimulationPlayback,
  useSimulatorFullscreen,
  type RecursosSimulador,
  type SimulatorCameraModeValue,
  type SimulationPlaybackState,
} from "@physikos/simulator-ui";
import iconoInstrucciones from "../../../img/botones/sim_mru/btn-instrucciones.svg";
import iconoPantallaCompleta from "../../../img/botones/sim_mru/btn-expandir.svg";
import iconoSalirPantallaCompleta from "../../../img/botones/sim_mru/btn-comprimir-mru-01.svg";
import iconoReiniciarMovimiento from "../../../img/botones/sim_mru/btn-new-start-simulation-mru-01.svg";
import iconoIniciar from "../../../img/botones/sim_mru/btn-start-simulation-mru.svg";
import iconoPausar from "../../../img/botones/sim_mru/btn-stop-mru.svg";
import iconoPasoAPaso from "../../../img/botones/sim_mru/btn-paso-01.svg";
import iconoReiniciarTodo from "../../../img/botones/sim_mru/btn-reiniciar.svg";
import iconoEsconderPanel from "../../simulator-ui/src/assets/esconder-panel.svg";
import logoPhysikos from "../../simulator-ui/src/assets/logo-physikos.svg";
import iconoMostrarPanel from "../../simulator-ui/src/assets/mostrar-panel.svg";
import {
  RANGO_ANGULO,
  RANGO_VELOCIDAD,
} from "./physics/configuracionExperimento";
import {
  GRAVEDAD_TERRESTRE,
  calcularResultadoLanzamiento,
  type ResultadoLanzamiento,
} from "./physics/movimientoParabolico";
import {
  aplicarErrorRelativo,
  generarErrorRelativo,
} from "./physics/incertidumbre";
import EscenarioParabolico, {
  type ImpactoMesa,
} from "./scene/EscenarioParabolico";
import {
  ALTURA_PISO_LABORATORIO,
  ALTURA_MESA,
  ALTURA_MESA_MAXIMA,
  ALTURA_MESA_MINIMA,
  ALTURA_SALIDA_INICIAL,
  POSICION_MESA_INICIAL_X,
  POSICION_SALIDA_INICIAL_X,
  PIXELES_POR_METRO,
  convertirDistanciaMetrosAPixeles,
  limitarPosicionMesaX,
  obtenerLimitesAlcanceMesa,
} from "./scene/geometriaEscenario";

type OpcionesVisualizacion = {
  rastro: boolean;
  impactos: boolean;
  reglaHorizontal: boolean;
  reglaVertical: boolean;
  timer44: boolean;
};

type EstadoEnsayo = "preparada" | "ejecutando" | "pausada" | "finalizada";

const ESTADO_ENSAYO: Record<SimulationPlaybackState, EstadoEnsayo> = {
  ready: "preparada",
  running: "ejecutando",
  paused: "pausada",
  completed: "finalizada",
};

const PASO_TIEMPO = 0.01;
const ERROR_PORCENTUAL_MINIMO = 0;
const ERROR_PORCENTUAL_MAXIMO = 15;
const PASO_ERROR_PORCENTUAL = 1;

const ANGULO_INICIAL = 45;
const VELOCIDAD_INICIAL = 2.56;
const VISUALIZACION_INICIAL: OpcionesVisualizacion = {
  rastro: true,
  impactos: true,
  reglaHorizontal: true,
  reglaVertical: true,
  timer44: true,
};

type AppProps = {
  integrado?: boolean;
  recursos?: RecursosSimulador;
};

type ParametrosEvaluacionImpacto = {
  alturaMesa: number;
  posicionMesaX: number;
  desplazamientoConjuntoX: number;
  desplazamientoConjuntoY: number;
  velocidadInicial: number;
  angulo: number;
};

function aplicarIncertidumbreAlAlcance(
  resultado: ResultadoLanzamiento,
  errorRelativo: number,
): ResultadoLanzamiento {
  if (resultado.alcance === null) return resultado;

  return {
    ...resultado,
    alcance: aplicarErrorRelativo(resultado.alcance, errorRelativo),
  };
}

function calcularEvaluacionImpacto(
  {
    alturaMesa,
    posicionMesaX,
    desplazamientoConjuntoX,
    desplazamientoConjuntoY,
    velocidadInicial,
    angulo,
  }: ParametrosEvaluacionImpacto,
  errorRelativo = 0,
) {
  const alturaSalida =
    ALTURA_SALIDA_INICIAL - desplazamientoConjuntoY / PIXELES_POR_METRO;
  const condicionesMesa = {
    posicionHorizontalInicial: 0,
    alturaInicial: alturaSalida,
    velocidadInicial,
    anguloGrados: angulo,
    gravedad: GRAVEDAD_TERRESTRE,
    alturaImpacto: alturaMesa,
  };
  const resultadoMesa = aplicarIncertidumbreAlAlcance(
    calcularResultadoLanzamiento(condicionesMesa),
    errorRelativo,
  );
  const limitesAlcanceMesa = obtenerLimitesAlcanceMesa(
    posicionMesaX,
    desplazamientoConjuntoX,
  );
  const impactaMesa =
    resultadoMesa.alcance !== null &&
    resultadoMesa.alcance >= limitesAlcanceMesa.minimo &&
    resultadoMesa.alcance <= limitesAlcanceMesa.maximo;
  const condicionesFinales = impactaMesa
    ? condicionesMesa
    : {
        ...condicionesMesa,
        alturaImpacto: ALTURA_PISO_LABORATORIO,
      };

  return {
    condiciones: condicionesFinales,
    resultado: impactaMesa
      ? resultadoMesa
      : aplicarIncertidumbreAlAlcance(
          calcularResultadoLanzamiento(condicionesFinales),
          errorRelativo,
        ),
    resultadoMesa,
    destino: impactaMesa ? ("mesa" as const) : ("piso" as const),
  };
}

function App({ integrado = false, recursos }: AppProps) {
  const [angulo, setAngulo] = useState(ANGULO_INICIAL);
  const [velocidadInicial, setVelocidadInicial] = useState(VELOCIDAD_INICIAL);
  const [alturaMesa, setAlturaMesa] = useState(ALTURA_MESA);
  const [posicionMesaX, setPosicionMesaX] = useState(POSICION_MESA_INICIAL_X);
  const [desplazamientoConjuntoX, setDesplazamientoConjuntoX] = useState(0);
  const [desplazamientoConjuntoY, setDesplazamientoConjuntoY] = useState(0);
  const [modoCamara, setModoCamara] =
    useState<SimulatorCameraModeValue>("normal");
  const [visualizacion, setVisualizacion] = useState<OpcionesVisualizacion>(
    VISUALIZACION_INICIAL,
  );
  const [errorPorcentualMaximo, setErrorPorcentualMaximo] = useState(0);
  const [impactosMesa, setImpactosMesa] = useState<ImpactoMesa[]>([]);
  const [reinicioCompletoId, setReinicioCompletoId] = useState(0);
  const [instruccionesAbiertas, setInstruccionesAbiertas] = useState(false);
  const [panelParametrosPlegado, setPanelParametrosPlegado] = useState(false);
  const {
    fullscreenRef: simuladorRef,
    isFullscreen: pantallaCompleta,
    toggleFullscreen: alternarPantallaCompleta,
    compatibilityNoticeVisible: avisoCompatibilidadVisible,
    dismissCompatibilityNotice: cerrarAvisoCompatibilidad,
  } = useSimulatorFullscreen<HTMLElement>();
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const siguienteImpactoIdRef = useRef(1);
  const impactoEnsayoRegistradoRef = useRef(false);
  const posicionMesaEnsayoRef = useRef(POSICION_MESA_INICIAL_X);
  const posicionSalidaEnsayoRef = useRef(POSICION_SALIDA_INICIAL_X);
  const errorRelativoEnsayoRef = useRef(0);

  const guiaLaboratorioUrl = useMemo(() => {
    if (!recursos?.guiaPdfUrl) return undefined;

    const archivoPdfUrl = new URL(recursos.guiaPdfUrl, document.baseURI).href;
    if (!recursos.visorPdfUrl) return archivoPdfUrl;

    const visorPdfUrl = new URL(recursos.visorPdfUrl, document.baseURI);
    visorPdfUrl.searchParams.set("file", archivoPdfUrl);
    visorPdfUrl.hash = "page=1&zoom=page-width&pagemode=none";
    return visorPdfUrl.href;
  }, [recursos?.guiaPdfUrl, recursos?.visorPdfUrl]);

  const evaluacionImpacto = useMemo(() => {
    return calcularEvaluacionImpacto({
      alturaMesa,
      posicionMesaX,
      desplazamientoConjuntoX,
      desplazamientoConjuntoY,
      velocidadInicial,
      angulo,
    });
  }, [
    alturaMesa,
    posicionMesaX,
    desplazamientoConjuntoX,
    desplazamientoConjuntoY,
    velocidadInicial,
    angulo,
  ]);
  const condicionesLanzamiento = evaluacionImpacto.condiciones;
  const resultadoFisico = evaluacionImpacto.resultado;
  const destinoImpacto = evaluacionImpacto.destino;
  const posicionMesaEfectivaX = limitarPosicionMesaX(
    posicionMesaX,
    desplazamientoConjuntoX,
  );
  const condicionesEnsayoRef = useRef(condicionesLanzamiento);
  const resultadoEnsayoRef = useRef(resultadoFisico);
  const destinoEnsayoRef = useRef(destinoImpacto);
  const {
    time: tiempo,
    state: estadoReproduccion,
    start: iniciarReproduccion,
    pause: pausarReproduccion,
    advance: avanzarReproduccion,
    reset: reiniciarReproduccion,
  } = useSimulationPlayback({
    getDuration: () => resultadoEnsayoRef.current.tiempoVuelo,
    playbackRate: SIMULATOR_CAMERA_SPEED[modoCamara],
    step: PASO_TIEMPO,
    onPrepare: prepararEnsayo,
    onComplete: registrarImpactoFinal,
  });
  const estado = ESTADO_ENSAYO[estadoReproduccion];
  const configuracionBloqueada = estado !== "preparada";
  const condicionesVisuales = configuracionBloqueada
    ? condicionesEnsayoRef.current
    : condicionesLanzamiento;
  const resultadoVisual = configuracionBloqueada
    ? resultadoEnsayoRef.current
    : resultadoFisico;
  const destinoVisual = configuracionBloqueada
    ? destinoEnsayoRef.current
    : destinoImpacto;

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    if (instruccionesAbiertas && !dialogo.open) dialogo.showModal();
    if (!instruccionesAbiertas && dialogo.open) dialogo.close();
  }, [instruccionesAbiertas]);

  useEffect(() => {
    if (!pantallaCompleta) setPanelParametrosPlegado(false);
  }, [pantallaCompleta]);

  function prepararEnsayo() {
    const errorRelativo = generarErrorRelativo(errorPorcentualMaximo);
    const evaluacionEnsayo = calcularEvaluacionImpacto(
      {
        alturaMesa,
        posicionMesaX,
        desplazamientoConjuntoX,
        desplazamientoConjuntoY,
        velocidadInicial,
        angulo,
      },
      errorRelativo,
    );
    errorRelativoEnsayoRef.current = errorRelativo;
    condicionesEnsayoRef.current = evaluacionEnsayo.condiciones;
    resultadoEnsayoRef.current = evaluacionEnsayo.resultado;
    destinoEnsayoRef.current = evaluacionEnsayo.destino;
    posicionMesaEnsayoRef.current = posicionMesaEfectivaX;
    posicionSalidaEnsayoRef.current =
      POSICION_SALIDA_INICIAL_X + desplazamientoConjuntoX;
    impactoEnsayoRegistradoRef.current = false;
  }

  function registrarImpactoFinal() {
    if (
      !impactoEnsayoRegistradoRef.current &&
      destinoEnsayoRef.current === "mesa" &&
      resultadoEnsayoRef.current.alcance !== null
    ) {
      impactoEnsayoRegistradoRef.current = true;
      const nuevoImpacto: ImpactoMesa = {
        id: siguienteImpactoIdRef.current,
        alcance: resultadoEnsayoRef.current.alcance,
        desplazamientoDesdeBorde:
          posicionSalidaEnsayoRef.current +
          convertirDistanciaMetrosAPixeles(resultadoEnsayoRef.current.alcance) -
          posicionMesaEnsayoRef.current,
      };
      siguienteImpactoIdRef.current += 1;
      setImpactosMesa((actuales) => [...actuales, nuevoImpacto]);
    }
  }

  function iniciarEnsayo() {
    iniciarReproduccion();
  }

  function pausarEnsayo() {
    pausarReproduccion();
  }

  function avanzarPasoAPaso() {
    avanzarReproduccion();
  }

  function reiniciarMovimiento() {
    reiniciarReproduccion();
  }

  function cambiarModoCamara(siguienteModo: SimulatorCameraModeValue) {
    setModoCamara(siguienteModo);
  }

  function reiniciarEstructura() {
    reiniciarReproduccion();
    setAngulo(ANGULO_INICIAL);
    setVelocidadInicial(VELOCIDAD_INICIAL);
    setAlturaMesa(ALTURA_MESA);
    setPosicionMesaX(POSICION_MESA_INICIAL_X);
    setDesplazamientoConjuntoX(0);
    setDesplazamientoConjuntoY(0);
    posicionMesaEnsayoRef.current = POSICION_MESA_INICIAL_X;
    posicionSalidaEnsayoRef.current = POSICION_SALIDA_INICIAL_X;
    setModoCamara("normal");
    setVisualizacion({ ...VISUALIZACION_INICIAL });
    setErrorPorcentualMaximo(0);
    setImpactosMesa([]);
    setReinicioCompletoId((actual) => actual + 1);
    siguienteImpactoIdRef.current = 1;
    impactoEnsayoRegistradoRef.current = false;
    errorRelativoEnsayoRef.current = 0;
  }

  return (
    <div className={`app-shell${integrado ? " app-shell--integrated" : ""}`}>
      {!integrado && (
        <header className="topbar">
          <a className="brand" href="../../" aria-label="Volver a Physikós">
            <span className="brand-phi">Φ</span>
            <span>Physikós</span>
          </a>
          <span className="prototype-badge">Simulación física</span>
        </header>
      )}

      <SimulatorFullscreenShell
        ref={simuladorRef}
        isFullscreen={pantallaCompleta}
        className={`simulator projectile-simulator${
          panelParametrosPlegado ? " is-parameters-collapsed" : ""
        }`}
        compatibilityNoticeVisible={avisoCompatibilidadVisible}
        compatibilityNotice={{
          title: "Experiencia recomendada en computadora",
          message:
            "Puedes continuar en este dispositivo, aunque el montaje y los instrumentos se visualizan mejor en una pantalla de escritorio.",
          dismissLabel: "Cerrar aviso de compatibilidad",
        }}
        onDismissCompatibilityNotice={cerrarAvisoCompatibilidad}
      >
        <header className="page-header">
          <span className="page-icon" aria-hidden="true" />
          <div>
            <h1>Simulador de movimiento parabólico</h1>
            <p>
              Configura el lanzamiento y observa el alcance de la esfera sobre
              la mesa de impacto.
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
            <button
              type="button"
              className="header-action-button parameters-panel-toggle"
              aria-expanded={!panelParametrosPlegado}
              aria-label={
                panelParametrosPlegado
                  ? "Mostrar parámetros del lanzamiento"
                  : "Ocultar parámetros del lanzamiento"
              }
              title={
                panelParametrosPlegado
                  ? "Mostrar parámetros"
                  : "Ocultar parámetros"
              }
              onClick={() =>
                setPanelParametrosPlegado((plegado) => !plegado)
              }
            >
              <img
                src={
                  panelParametrosPlegado
                    ? iconoMostrarPanel
                    : iconoEsconderPanel
                }
                alt=""
                aria-hidden="true"
              />
              <span>
                {panelParametrosPlegado
                  ? "Mostrar parámetros"
                  : "Ocultar parámetros"}
              </span>
            </button>
          </div>
        </header>

        <section
          className="workspace"
          aria-label="Laboratorio de movimiento parabólico"
        >
          <div className="column-left">
            <SimulatorExperimentPanel>
              <div className="fullscreen-brand" aria-label="Physikós">
                <img src={logoPhysikos} alt="Physikós" />
              </div>
              <SimulatorLabStage>
                <EscenarioParabolico
                  condiciones={condicionesVisuales}
                  resultadoFisico={resultadoVisual}
                  destinoImpacto={destinoVisual}
                  alturaMesa={alturaMesa}
                  posicionMesaX={posicionMesaX}
                  desplazamientoConjuntoX={desplazamientoConjuntoX}
                  desplazamientoConjuntoY={desplazamientoConjuntoY}
                  tiempo={tiempo}
                  estado={estado}
                  mostrarRastro={visualizacion.rastro}
                  mostrarImpactos={visualizacion.impactos}
                  mostrarReglaHorizontal={visualizacion.reglaHorizontal}
                  mostrarReglaVertical={visualizacion.reglaVertical}
                  mostrarTimer44={visualizacion.timer44}
                  impactosMesa={impactosMesa}
                  reinicioCompletoId={reinicioCompletoId}
                  interaccionBloqueada={configuracionBloqueada}
                  onAlturaMesaChange={setAlturaMesa}
                  onAnguloChange={setAngulo}
                  onPosicionMesaXChange={setPosicionMesaX}
                  onDesplazamientoConjuntoXChange={setDesplazamientoConjuntoX}
                  onDesplazamientoConjuntoYChange={setDesplazamientoConjuntoY}
                  onReiniciarTimer={reiniciarMovimiento}
                />
              </SimulatorLabStage>

              <SimulatorExperimentTransport>
                <SimulatorVisibilityOptions
                  className="simulator-experiment-visibility"
                  options={[
                    {
                      id: "rastro",
                      label: "Rastro",
                      checked: visualizacion.rastro,
                    },
                    {
                      id: "impactos",
                      label: "Impactos",
                      checked: visualizacion.impactos,
                    },
                    {
                      id: "reglaHorizontal",
                      label: "Regla H",
                      checked: visualizacion.reglaHorizontal,
                    },
                    {
                      id: "reglaVertical",
                      label: "Regla V",
                      checked: visualizacion.reglaVertical,
                    },
                    {
                      id: "timer44",
                      label: "Timer 4-4",
                      checked: visualizacion.timer44,
                    },
                  ]}
                  onChange={(opcion, visible) =>
                    setVisualizacion((actual) => ({
                      ...actual,
                      [opcion]: visible,
                    }))
                  }
                />

                <div className="transport-controls__main">
                  <SimulatorIconButton
                    type="button"
                    icon={iconoReiniciarMovimiento}
                    label="Preparar un nuevo lanzamiento"
                    onClick={reiniciarMovimiento}
                    disabled={estado === "preparada"}
                  />
                  {estado === "ejecutando" ? (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoPausar}
                      label="Pausar lanzamiento"
                      onClick={pausarEnsayo}
                    />
                  ) : (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoIniciar}
                      label={
                        estado === "pausada"
                          ? "Continuar lanzamiento"
                          : "Lanzar esfera"
                      }
                      onClick={iniciarEnsayo}
                      disabled={estado === "finalizada"}
                    />
                  )}
                  <SimulatorIconButton
                    type="button"
                    icon={iconoPasoAPaso}
                    label="Avanzar 0,01 segundos"
                    onClick={avanzarPasoAPaso}
                    disabled={
                      estado === "ejecutando" || estado === "finalizada"
                    }
                  />
                </div>

                <SimulatorIconButton
                  type="button"
                  icon={iconoReiniciarTodo}
                  label="Restaurar la estructura inicial"
                  shape="round"
                  onClick={reiniciarEstructura}
                />
              </SimulatorExperimentTransport>
            </SimulatorExperimentPanel>
            <section className="simulator-page__description">
              <article className="simulator-page-info-card">
                <h3>Modelo bidimensional</h3>
                <Latex
                  formula={String.raw`x(t)=x_0+v_0\cos(\alpha)t\qquad y(t)=y_0+v_0\sin(\alpha)t-\frac{1}{2}gt^2`}
                  displayMode
                  className="simulator-page-equation"
                  ariaLabel="Ecuaciones horizontal y vertical del movimiento parabólico"
                />
              </article>
            </section>
          </div>

          <div
            className={`parameters-overlay${
              panelParametrosPlegado ? " parameters-overlay--collapsed" : ""
            }`}
          >
            <aside className="settings-panel simulator-card">
              <h2>Parámetros del lanzamiento</h2>
              <div className="settings-panel__content">
                <SimulatorParameter
                  id="angulo-lanzamiento"
                  label="Ángulo de lanzamiento"
                  symbol="α"
                  unit="°"
                  min={RANGO_ANGULO.minimo}
                  max={RANGO_ANGULO.maximo}
                  step={1}
                  value={angulo}
                  decimals={0}
                  disabled={configuracionBloqueada}
                  onChange={setAngulo}
                />
                <SimulatorParameter
                  id="velocidad-inicial"
                  label="Velocidad inicial"
                  symbol="v₀"
                  unit="m/s"
                  min={RANGO_VELOCIDAD.minimo}
                  max={RANGO_VELOCIDAD.maximo}
                  step={0.01}
                  value={velocidadInicial}
                  decimals={2}
                  disabled={configuracionBloqueada}
                  onChange={setVelocidadInicial}
                />
                <SimulatorParameter
                  id="altura-mesa"
                  label="Altura de la mesa"
                  symbol="hₘ"
                  unit="m"
                  min={ALTURA_MESA_MINIMA}
                  max={ALTURA_MESA_MAXIMA}
                  step={0.01}
                  value={alturaMesa}
                  decimals={2}
                  disabled={configuracionBloqueada}
                  onChange={setAlturaMesa}
                />
                <SimulatorParameter
                  id="incertidumbre-impactos"
                  label="Incertidumbre de impactos"
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
                <SimulatorCameraMode
                  value={modoCamara}
                  onChange={cambiarModoCamara}
                />
              </div>
            </aside>
          </div>
        </section>

        <section className="learning-note simulator-card">
          <strong>Práctica de movimiento parabólico</strong>
          <div className="learning-note__description">
            <p>
              El mismo montaje permitirá estudiar un ángulo constante o una
              velocidad constante sin separar la experiencia en dos
              aplicaciones.
            </p>
            <SimulatorResources
              recursos={[
                {
                  id: "clase-movimiento-parabolico",
                  tipo: "clase",
                  etiqueta: "Ver Clase",
                  url: recursos?.claseUrl,
                  abrirEnNuevaPestana: true,
                },
                {
                  id:
                    recursos?.guiaId ||
                    "guia-laboratorio-movimiento-parabolico",
                  tipo: "guia",
                  etiqueta: "Guía Lab",
                  url: guiaLaboratorioUrl,
                  abrirEnNuevaPestana: true,
                },
              ]}
            />
          </div>
        </section>

        <dialog
          ref={dialogoRef}
          className="instructions-dialog"
          aria-labelledby="titulo-instrucciones-movimiento-parabolico"
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
                <p className="eyebrow">Simulación interactiva</p>
                <h2 id="titulo-instrucciones-movimiento-parabolico">
                  Configura, mide y realiza el lanzamiento
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
                <strong>Prepara el espacio de trabajo.</strong>
                <span>
                  Arrastra el conjunto balístico, la mesa, las reglas y el Timer
                  4-4 hasta formar tu montaje. La mesa no puede atravesar el
                  soporte balístico y la regla horizontal acompañará a la mesa
                  mientras permanezca apoyada sobre ella.
                </span>
              </li>
              <li>
                <strong>Ajusta el lanzamiento.</strong>
                <span>
                  Define el ángulo y la velocidad inicial en el panel de
                  parámetros. También puedes girar directamente el dispositivo
                  sobre el transportador. Ajusta la altura arrastrando la mesa o
                  usando su deslizador.
                </span>
              </li>
              <li>
                <strong>Mide el montaje.</strong>
                <span>
                  Coloca el cero de la Regla H en el punto de salida para medir
                  el alcance horizontal. Usa la Regla V y mueve sus dos
                  señaladores entre 0 y 100 cm para medir la altura de la mesa o
                  el desnivel respecto al centro de la esfera.
                </span>
              </li>
              <li>
                <strong>Configura la incertidumbre.</strong>
                <span>
                  El control de incertidumbre introduce pequeñas variaciones en
                  el alcance de lanzamientos repetidos, aun cuando conserves el
                  mismo ángulo y velocidad. Usa Impactos para comparar las
                  huellas acumuladas sobre la mesa.
                </span>
              </li>
              <li>
                <strong>Realiza y observa el lanzamiento.</strong>
                <span>
                  Lanza, pausa o avanza en pasos de 0,01 s. Activa Cámara Lenta
                  para observar mejor el movimiento y consulta el canal 1 del
                  Timer 4-4 para medir el tiempo de vuelo. Si la esfera no
                  alcanza la mesa, continuará hasta el suelo del laboratorio.
                </span>
              </li>
              <li>
                <strong>Inspecciona y repite.</strong>
                <span>
                  Usa Rastro, Impactos, Regla H, Regla V y Timer 4-4 para mostrar
                  u ocultar instrumentos. El zoom ofrece vistas de 100 %, 200 %
                  y 300 %, con enfoques por zona y desplazamiento del lienzo al
                  ampliar. Preparar un nuevo lanzamiento conserva las huellas;
                  Restaurar la estructura reinicia todo y elimina los impactos.
                  En pantalla completa puedes plegar el panel de parámetros para
                  liberar espacio.
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
      </SimulatorFullscreenShell>
    </div>
  );
}

export default App;
