import timer44 from "@physikos/simulator-ui/assets/timer44.svg";

const PANTALLAS_TIMER = [
  { canal: 1, left: 11.3578, top: 34.2725, width: 16.3122, height: 10.0205 },
  { canal: 2, left: 31.818, top: 35.3206, width: 16.3564, height: 8.9739 },
  { canal: 3, left: 53.7938, top: 34.2725, width: 15.4527, height: 10.0205 },
  { canal: 4, left: 74.2444, top: 34.2725, width: 15.9454, height: 10.0205 },
] as const;

export type FaseTimerCaidaLibre = "esperando" | "midiendo" | "registrado";

type Timer44CaidaLibreProps = {
  lectura: number;
  fase: FaseTimerCaidaLibre;
  onReiniciar: () => void;
};

function Timer44CaidaLibre({
  lectura,
  fase,
  onReiniciar,
}: Timer44CaidaLibreProps) {
  return (
    <div className="free-fall-timer44" aria-label="Timer 4-4 del experimento">
      <img
        className="free-fall-timer44__image"
        src={timer44}
        alt="Timer 4-4; el canal uno mide el tiempo de caída"
        draggable="false"
      />

      <div className="free-fall-timer44__screens" aria-hidden="true">
        {PANTALLAS_TIMER.map((pantalla, indice) => (
          <div
            key={pantalla.canal}
            className={`free-fall-timer44__screen free-fall-timer44__screen--${indice === 0 ? fase : "esperando"}`}
            style={{
              left: `${pantalla.left}%`,
              top: `${pantalla.top}%`,
              width: `${pantalla.width}%`,
              height: `${pantalla.height}%`,
            }}
          >
            <span>{(indice === 0 ? lectura : 0).toFixed(3)}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="free-fall-timer44__reset"
        aria-label="Reiniciar únicamente el contador del Timer 4-4"
        title="Reiniciar contador"
        onClick={onReiniciar}
      />

      <span
        className="visually-hidden"
        aria-live={fase === "registrado" ? "polite" : "off"}
      >
        Canal uno: {lectura.toFixed(3)} segundos
      </span>
    </div>
  );
}

export default Timer44CaidaLibre;
