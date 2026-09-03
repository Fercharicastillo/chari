import { SimulatorTimer44 } from "@physikos/simulator-ui";

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
    <SimulatorTimer44
      className="free-fall-timer44"
      reading={lectura}
      phase={fase}
      onReset={onReiniciar}
      resetLabel="Reiniciar únicamente el contador del Timer 4-4"
      instrumentLabel="Timer 4-4; el canal uno mide el tiempo de caída"
    />
  );
}

export default Timer44CaidaLibre;
