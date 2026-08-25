import timer44Mruv from "@physikos/simulator-ui/assets/timer44.svg";

const PANTALLAS_TIMER = [
  { canal: 1, left: 11.3578, top: 34.2725, width: 16.3122, height: 10.0205 },
  { canal: 2, left: 31.818, top: 35.3206, width: 16.3564, height: 8.9739 },
  { canal: 3, left: 53.7938, top: 34.2725, width: 15.4527, height: 10.0205 },
  { canal: 4, left: 74.2444, top: 34.2725, width: 15.9454, height: 10.0205 },
] as const;

type FasePantalla = "esperando" | "midiendo" | "registrado";

interface Timer44Props {
  lecturas: readonly number[];
  fases: readonly FasePantalla[];
  modo: "paso" | "recorrido";
  modoDeshabilitado: boolean;
  onReiniciarContadores: () => void;
  onCambiarModo: () => void;
}

function Timer44({
  lecturas,
  fases,
  modo,
  modoDeshabilitado,
  onReiniciarContadores,
  onCambiarModo,
}: Timer44Props) {
  const siguienteModo = modo === "paso" ? "desde la liberación" : "paso por sensor";

  return (
    <div className="timer44" aria-label="Timer 4-4 de cuatro canales">
      <img
        className="timer44-image"
        src={timer44Mruv}
        alt="Timer 4-4 con cuatro pantallas para los sensores"
      />

      <div className="timer44-display-layer" aria-hidden="true">
        {PANTALLAS_TIMER.map((pantalla, indice) => (
          <div
            key={pantalla.canal}
            className={`timer44-screen timer44-screen--${fases[indice] ?? "esperando"}`}
            style={{
              left: `${pantalla.left}%`,
              top: `${pantalla.top}%`,
              width: `${pantalla.width}%`,
              height: `${pantalla.height}%`,
            }}
          >
            <span>{(lecturas[indice] ?? 0).toFixed(3)}</span>
          </div>
        ))}
      </div>

      <div className="timer44-control-layer">
        <button
          type="button"
          className="timer44-overlay-button timer44-overlay-button--reset"
          aria-label="Reiniciar únicamente los contadores del Timer 4-4"
          title="Reiniciar contadores"
          onClick={onReiniciarContadores}
        />
        <button
          type="button"
          className="timer44-overlay-button timer44-overlay-button--mode"
          aria-label={`Cambiar el Timer 4-4 al modo ${siguienteModo}`}
          title={`Cambiar a ${siguienteModo}`}
          disabled={modoDeshabilitado}
          onClick={onCambiarModo}
        />
      </div>
    </div>
  );
}

export default Timer44;
