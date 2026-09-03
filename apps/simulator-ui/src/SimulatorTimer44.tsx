import timer44 from "./assets/timer44.svg";

const PANTALLAS_TIMER = [
  { canal: 1, left: 11.3578, top: 34.2725, width: 16.3122, height: 10.0205 },
  { canal: 2, left: 31.818, top: 35.3206, width: 16.3564, height: 8.9739 },
  { canal: 3, left: 53.7938, top: 34.2725, width: 15.4527, height: 10.0205 },
  { canal: 4, left: 74.2444, top: 34.2725, width: 15.9454, height: 10.0205 },
] as const;

export type SimulatorTimer44Phase =
  | "esperando"
  | "midiendo"
  | "pausado"
  | "registrado";

type SimulatorTimer44Props = {
  reading: number;
  phase: SimulatorTimer44Phase;
  onReset: () => void;
  className?: string;
  resetLabel?: string;
  instrumentLabel?: string;
};

function SimulatorTimer44({
  reading,
  phase,
  onReset,
  className = "",
  resetLabel = "Reiniciar el contador del Timer 4-4",
  instrumentLabel = "Timer 4-4; el canal uno mide el tiempo del experimento",
}: SimulatorTimer44Props) {
  const classes = `simulator-timer44${className ? ` ${className}` : ""}`;

  return (
    <div className={classes} aria-label="Timer 4-4 del experimento">
      <img
        className="simulator-timer44__image"
        src={timer44}
        alt={instrumentLabel}
        draggable="false"
      />

      <div className="simulator-timer44__screens" aria-hidden="true">
        {PANTALLAS_TIMER.map((pantalla, indice) => (
          <div
            key={pantalla.canal}
            className={`simulator-timer44__screen simulator-timer44__screen--${indice === 0 ? phase : "esperando"}`}
            style={{
              left: `${pantalla.left}%`,
              top: `${pantalla.top}%`,
              width: `${pantalla.width}%`,
              height: `${pantalla.height}%`,
            }}
          >
            <span>{(indice === 0 ? reading : 0).toFixed(3)}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="simulator-timer44__reset"
        aria-label={resetLabel}
        title={resetLabel}
        onClick={onReset}
      />

      <span
        className="visually-hidden"
        aria-live={phase === "registrado" ? "polite" : "off"}
      >
        Canal uno: {reading.toFixed(3)} segundos
      </span>
    </div>
  );
}

export default SimulatorTimer44;
