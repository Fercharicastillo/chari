import { useEffect, useMemo, useRef, useState } from "react";
import {
  Latex,
  SIMULATOR_CAMERA_SPEED,
  SimulatorCameraMode,
  SimulatorIconButton,
  SimulatorParameter,
  SimulatorResources,
  SimulatorVisibilityOptions,
  type RecursosSimulador,
  type SimulatorCameraModeValue,
} from "@physikos/simulator-ui";
import iconoInstrucciones from "../../../img/botones/sim_mru/btn-instrucciones.svg";
import iconoPantallaCompleta from "../../../img/botones/sim_mru/btn-expandir.svg";
import iconoSalirPantallaCompleta from "../../../img/botones/sim_mru/btn-comprimir-mru-01.svg";
import iconoReiniciarMovimiento from "../../../img/botones/sim_mru/btn-new-start-simulation-mru-01.svg";
import iconoIniciar from "../../../img/botones/sim_mru/btn-start-simulation-mru.svg";
import iconoPausar from "../../../img/botones/sim_mru/btn-stop-mru.svg";
import iconoPasoAPaso from "../../../img/botones/sim_mru/btn-paso-01.svg";
import iconoReiniciarTodo from "../../../img/botones/sim_mru/btn-reiniciar.svg";
import {
  calcularDistanciaCaida,
  calcularTiempoCaida,
} from "./physics/caidaLibre";
import {
  aplicarErrorRelativo,
  generarErrorRelativo,
} from "./physics/incertidumbre";
import LaboratorioEstatico from "./scene/LaboratorioEstatico";
import {
  ALTURA_MONTAJE_INICIAL,
  ALTURA_MONTAJE_MAXIMA,
  ALTURA_MONTAJE_MINIMA,
  LECTURA_INFERIOR_INICIAL,
  LECTURA_SUPERIOR_INICIAL,
  limitarAlturaLaboratorio,
  limitarLecturaInferior,
  limitarLecturaSuperior,
} from "./scene/geometriaLaboratorio";

const ALTURA_MINIMA = ALTURA_MONTAJE_MINIMA;
const ALTURA_MAXIMA = ALTURA_MONTAJE_MAXIMA;
const PASO_ALTURA = 0.01;
const PASO_TIEMPO = 0.01;
const GRAVEDAD = 9.81;
const ERROR_PORCENTUAL_MINIMO = 0;
const ERROR_PORCENTUAL_MAXIMO = 15;
const PASO_ERROR_PORCENTUAL = 1;

type EstadoEnsayo = "preparada" | "ejecutando" | "pausada" | "finalizada";
type OpcionesVisualizacion = {
  timer: boolean;
  regla: boolean;
  rastro: boolean;
};

const VISUALIZACION_INICIAL: OpcionesVisualizacion = {
  timer: true,
  regla: true,
  rastro: false,
};

type AppProps = {
  integrado?: boolean;
  recursos?: RecursosSimulador;
};

function App({ integrado = false, recursos }: AppProps) {
  const [lecturaSuperior, setLecturaSuperior] = useState(
    LECTURA_SUPERIOR_INICIAL,
  );
  const [lecturaInferior, setLecturaInferior] = useState(
    LECTURA_INFERIOR_INICIAL,
  );
  const [tiempo, setTiempo] = useState(0);
  const [lecturaTimer, setLecturaTimer] = useState(0);
  const [reinicioCompletoId, setReinicioCompletoId] = useState(0);
  const [modoCamara, setModoCamara] =
    useState<SimulatorCameraModeValue>("normal");
  const [visualizacion, setVisualizacion] = useState(VISUALIZACION_INICIAL);
  const [errorPorcentualMaximo, setErrorPorcentualMaximo] = useState(0);
  const [estado, setEstado] = useState<EstadoEnsayo>("preparada");
  const [instruccionesAbiertas, setInstruccionesAbiertas] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const simuladorRef = useRef<HTMLElement>(null);
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const cuadroAnimacionRef = useRef<number | null>(null);
  const inicioTramoRef = useRef(0);
  const tiempoAcumuladoRef = useRef(0);
  const origenTiempoTimerRef = useRef(0);
  const alturaEnsayoRef = useRef(ALTURA_MONTAJE_INICIAL);
  const velocidadCamaraRef = useRef(SIMULATOR_CAMERA_SPEED.normal);
  const errorRelativoEnsayoRef = useRef(0);
  const altura = Number((lecturaSuperior - lecturaInferior).toFixed(3));
  const guiaLaboratorioUrl = useMemo(() => {
    if (!recursos?.guiaPdfUrl) return undefined;

    const archivoPdfUrl = new URL(recursos.guiaPdfUrl, document.baseURI).href;
    if (!recursos.visorPdfUrl) return archivoPdfUrl;

    const visorPdfUrl = new URL(recursos.visorPdfUrl, document.baseURI);
    visorPdfUrl.searchParams.set("file", archivoPdfUrl);
    visorPdfUrl.hash = "page=1&zoom=page-width&pagemode=none";
    return visorPdfUrl.href;
  }, [recursos?.guiaPdfUrl, recursos?.visorPdfUrl]);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    if (instruccionesAbiertas && !dialogo.open) dialogo.showModal();
    if (!instruccionesAbiertas && dialogo.open) dialogo.close();
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

  useEffect(() => {
    if (estado !== "ejecutando") return;

    const tiempoFinal = calcularTiempoCaida({
      altura: alturaEnsayoRef.current,
      gravedad: GRAVEDAD,
    });

    const animar = (marcaTiempo: number) => {
      if (inicioTramoRef.current === 0) inicioTramoRef.current = marcaTiempo;

      const tiempoActual =
        tiempoAcumuladoRef.current +
        ((marcaTiempo - inicioTramoRef.current) / 1000) *
          velocidadCamaraRef.current;

      if (tiempoActual >= tiempoFinal) {
        tiempoAcumuladoRef.current = tiempoFinal;
        setTiempo(tiempoFinal);
        setLecturaTimer(
          aplicarErrorRelativo(
            Math.max(0, tiempoFinal - origenTiempoTimerRef.current),
            errorRelativoEnsayoRef.current,
          ),
        );
        setEstado("finalizada");
        return;
      }

      setTiempo(tiempoActual);
      setLecturaTimer(
        aplicarErrorRelativo(
          Math.max(0, tiempoActual - origenTiempoTimerRef.current),
          errorRelativoEnsayoRef.current,
        ),
      );
      cuadroAnimacionRef.current = requestAnimationFrame(animar);
    };

    cuadroAnimacionRef.current = requestAnimationFrame(animar);

    return () => {
      if (cuadroAnimacionRef.current !== null) {
        cancelAnimationFrame(cuadroAnimacionRef.current);
        cuadroAnimacionRef.current = null;
      }
    };
  }, [estado]);

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

  function iniciarEnsayo() {
    if (estado === "finalizada") return;

    if (estado === "preparada") {
      alturaEnsayoRef.current = altura;
      tiempoAcumuladoRef.current = 0;
      origenTiempoTimerRef.current = 0;
      errorRelativoEnsayoRef.current = generarErrorRelativo(
        errorPorcentualMaximo,
      );
      setTiempo(0);
      setLecturaTimer(0);
    }

    inicioTramoRef.current = 0;
    setEstado("ejecutando");
  }

  function pausarEnsayo() {
    if (estado !== "ejecutando") return;
    tiempoAcumuladoRef.current = tiempo;
    inicioTramoRef.current = 0;
    setEstado("pausada");
  }

  function reiniciarMovimiento() {
    tiempoAcumuladoRef.current = 0;
    inicioTramoRef.current = 0;
    setTiempo(0);
    setEstado("preparada");
  }

  function avanzarPasoAPaso() {
    if (estado === "ejecutando" || estado === "finalizada") return;

    if (estado === "preparada") {
      alturaEnsayoRef.current = altura;
      origenTiempoTimerRef.current = 0;
      errorRelativoEnsayoRef.current = generarErrorRelativo(
        errorPorcentualMaximo,
      );
      setLecturaTimer(0);
    }

    const tiempoFinal = calcularTiempoCaida({
      altura: alturaEnsayoRef.current,
      gravedad: GRAVEDAD,
    });
    const siguienteTiempo = Math.min(tiempo + PASO_TIEMPO, tiempoFinal);

    tiempoAcumuladoRef.current = siguienteTiempo;
    inicioTramoRef.current = 0;
    setTiempo(siguienteTiempo);
    setLecturaTimer(
      aplicarErrorRelativo(
        Math.max(0, siguienteTiempo - origenTiempoTimerRef.current),
        errorRelativoEnsayoRef.current,
      ),
    );
    setEstado(siguienteTiempo >= tiempoFinal ? "finalizada" : "pausada");
  }

  function reiniciarContadorTimer() {
    origenTiempoTimerRef.current = tiempo;
    errorRelativoEnsayoRef.current = generarErrorRelativo(
      errorPorcentualMaximo,
    );
    setLecturaTimer(0);
  }

  function cambiarModoCamara(siguienteModo: SimulatorCameraModeValue) {
    if (estado === "ejecutando") {
      tiempoAcumuladoRef.current = tiempo;
      inicioTramoRef.current = 0;
    }
    velocidadCamaraRef.current = SIMULATOR_CAMERA_SPEED[siguienteModo];
    setModoCamara(siguienteModo);
  }

  function reiniciarSimulador() {
    tiempoAcumuladoRef.current = 0;
    inicioTramoRef.current = 0;
    origenTiempoTimerRef.current = 0;
    alturaEnsayoRef.current = ALTURA_MONTAJE_INICIAL;
    velocidadCamaraRef.current = SIMULATOR_CAMERA_SPEED.normal;
    errorRelativoEnsayoRef.current = 0;
    setLecturaSuperior(LECTURA_SUPERIOR_INICIAL);
    setLecturaInferior(LECTURA_INFERIOR_INICIAL);
    setTiempo(0);
    setLecturaTimer(0);
    setModoCamara("normal");
    setVisualizacion(VISUALIZACION_INICIAL);
    setErrorPorcentualMaximo(0);
    setEstado("preparada");
    setReinicioCompletoId((actual) => actual + 1);
  }

  const alturaDelEnsayo =
    estado === "preparada" ? altura : alturaEnsayoRef.current;
  const distanciaCaida = calcularDistanciaCaida(tiempo, {
    altura: alturaDelEnsayo,
    gravedad: GRAVEDAD,
  });
  const faseTimer =
    estado === "ejecutando"
      ? "midiendo"
      : lecturaTimer > 0
        ? "registrado"
        : "esperando";
  return (
    <div className={`app-shell${integrado ? " app-shell--integrated" : ""}`}>
      {!integrado && (
        <header className="topbar">
          <a className="brand" href="../../" aria-label="Volver a Physikós">
            <span className="brand-phi">Φ</span>
            <span>Physikós</span>
          </a>
          <span className="prototype-badge">Estructura inicial</span>
        </header>
      )}

      <main ref={simuladorRef} className="simulator free-fall-simulator">
        <header className="page-header">
          <span className="page-icon" aria-hidden="true"></span>
          <div>
            <h1>Simulador de caída libre</h1>
            <p>
              Prepara la altura, libera la esfera y mide el tiempo de caída.
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

        <section className="workspace" aria-label="Laboratorio de caída libre">
          <div className="column-left">
            <section className="experiment-panel simulator-card">
              <LaboratorioEstatico
                lecturaSuperior={lecturaSuperior}
                lecturaInferior={lecturaInferior}
                distanciaCaida={distanciaCaida}
                interaccionBloqueada={estado !== "preparada"}
                lecturaTimer={lecturaTimer}
                faseTimer={faseTimer}
                estadoEnsayo={estado}
                tiempo={tiempo}
                mostrarTimer={visualizacion.timer}
                mostrarRegla={visualizacion.regla}
                mostrarRastro={visualizacion.rastro}
                onReiniciarTimer={reiniciarContadorTimer}
                reinicioCompletoId={reinicioCompletoId}
                onLecturaSuperiorChange={(valor) =>
                  setLecturaSuperior(
                    limitarLecturaSuperior(valor, lecturaInferior),
                  )
                }
                onLecturaInferiorChange={(valor) =>
                  setLecturaInferior(
                    limitarLecturaInferior(valor, lecturaSuperior),
                  )
                }
              />
              <div className="free-fall-transport transport-controls">
                <SimulatorVisibilityOptions
                  className="experiment-status"
                  options={[
                    {
                      id: "timer",
                      label: "Timer 4-4",
                      checked: visualizacion.timer,
                    },
                    {
                      id: "regla",
                      label: "Regla",
                      checked: visualizacion.regla,
                    },
                    {
                      id: "rastro",
                      label: "Rastro",
                      checked: visualizacion.rastro,
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
                    label="Retener nuevamente la esfera"
                    onClick={reiniciarMovimiento}
                    disabled={estado === "preparada"}
                  />

                  {estado === "ejecutando" ? (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoPausar}
                      label="Pausar caída"
                      onClick={pausarEnsayo}
                    />
                  ) : (
                    <SimulatorIconButton
                      type="button"
                      icon={iconoIniciar}
                      label={
                        estado === "pausada"
                          ? "Continuar caída"
                          : "Liberar esfera"
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
                  label="Reiniciar todo el simulador"
                  shape="round"
                  onClick={reiniciarSimulador}
                />
              </div>
            </section>
          </div>
          <div>
            <aside className="settings-panel simulator-card">
              <h2>Parámetros del experimento</h2>
              <SimulatorParameter
                id="altura-caida"
                label="Altura de caída"
                symbol="h"
                unit="m"
                min={ALTURA_MINIMA}
                max={ALTURA_MAXIMA}
                step={PASO_ALTURA}
                value={altura}
                disabled={estado !== "preparada"}
                onChange={(valor) =>
                  setLecturaSuperior(
                    limitarLecturaSuperior(
                      lecturaInferior + limitarAlturaLaboratorio(valor),
                      lecturaInferior,
                    ),
                  )
                }
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
                disabled={estado !== "preparada"}
                onChange={setErrorPorcentualMaximo}
              />
              <p className="measurement-uncertainty-note">
                Cada ensayo aplica al Timer una desviación aleatoria entre −
                {errorPorcentualMaximo.toFixed(0)} % y +
                {errorPorcentualMaximo.toFixed(0)} %.
              </p>
              <SimulatorCameraMode
                value={modoCamara}
                onChange={cambiarModoCamara}
              />
            </aside>
            <section className="simulator-page__description">
              <article className="simulator-page-info-card">
                <h3>Ecuación de caída libre</h3>
                <Latex
                  formula={String.raw`h(t)=\frac{1}{2}g\,t^2`}
                  displayMode
                  className="simulator-page-equation"
                  ariaLabel="h de t es igual a un medio de g por t al cuadrado"
                />
              </article>
            </section>
          </div>
        </section>

        <section className="learning-note simulator-card">
          <strong>Montaje regulable sobre la regla</strong>
          <div className="learning-note__description">
            <p>
              El disparador y el platillo pueden colocarse independientemente.
              La altura se obtiene de la diferencia entre las lecturas compactas
              superior e inferior.
            </p>
            <SimulatorResources
              recursos={[
                {
                  id: "clase-caida-libre",
                  tipo: "clase",
                  etiqueta: "Ver Clase",
                  url: recursos?.claseUrl,
                  abrirEnNuevaPestana: true,
                },
                {
                  id: recursos?.guiaId || "guia-laboratorio-caida-libre",
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
          aria-labelledby="titulo-instrucciones-caida-libre"
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
                <p className="eyebrow">Estado de desarrollo</p>
                <h2 id="titulo-instrucciones-caida-libre">
                  Base del experimento
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
                <strong>Ajusta la altura.</strong>
                <span>
                  Usa el deslizador lateral o arrastra el disparador y el
                  platillo directamente sobre el riel.
                </span>
              </li>
              <li>
                <strong>Comprueba la referencia.</strong>
                <span>
                  La altura se medirá desde la parte inferior de la esfera hasta
                  la superficie superior del platillo. Las etiquetas xₛ y xᵢ
                  muestran ambas lecturas sobre la regla.
                </span>
              </li>
              <li>
                <strong>Observa el movimiento conjunto.</strong>
                <span>
                  El disparador, la esfera y el señalador superior conservan su
                  alineación. Durante la caída, el ajuste de altura permanece
                  bloqueado hasta que vuelvas a retener la esfera.
                </span>
              </li>
              <li>
                <strong>Libera la esfera.</strong>
                <span>
                  Usa iniciar para ejecutar la caída, pausa para detenerla y el
                  botón de paso para avanzar intervalos de 0,01 segundos.
                </span>
              </li>
              <li>
                <strong>Elige la velocidad de observación.</strong>
                <span>
                  Cámara Lenta reproduce la caída a un cuarto de velocidad para
                  observarla mejor, sin cambiar el tiempo físico registrado.
                </span>
              </li>
              <li>
                <strong>Consulta el Timer 4-4.</strong>
                <span>
                  El canal 1 muestra el tiempo de caída. Puedes arrastrar el
                  Timer sobre la mesa; su botón circular borra únicamente la
                  lectura y no modifica su posición.
                </span>
              </li>
              <li>
                <strong>Simula la incertidumbre experimental.</strong>
                <span>
                  El porcentaje seleccionado define el error máximo del Timer.
                  Cada nueva liberación sortea una desviación distinta dentro
                  del intervalo positivo y negativo configurado.
                </span>
              </li>
              <li>
                <strong>Amplía los instrumentos.</strong>
                <span>
                  Usa los controles de zoom y selecciona Montaje o Timer 4-4
                  para centrar automáticamente la zona que necesitas observar.
                  Con la vista ampliada también puedes arrastrar el fondo para
                  recorrer libremente el laboratorio.
                </span>
              </li>
              <li>
                <strong>Elige el reinicio adecuado.</strong>
                <span>
                  Retener esfera reinicia solamente el movimiento; el botón del
                  Timer borra su pantalla; y el botón circular exterior restaura
                  completamente el simulador.
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
