export interface CondicionesCaidaLibre {
  altura: number;
  gravedad: number;
}

/** Distancia recorrida desde el reposo: y(t) = g*t²/2. */
export function calcularDistanciaCaida(
  tiempo: number,
  condiciones: CondicionesCaidaLibre,
): number {
  return Math.min(
    condiciones.altura,
    (condiciones.gravedad * tiempo ** 2) / 2,
  );
}

/** Tiempo ideal hasta alcanzar el platillo receptor. */
export function calcularTiempoCaida({
  altura,
  gravedad,
}: CondicionesCaidaLibre): number {
  if (altura <= 0 || gravedad <= 0) return 0;
  return Math.sqrt((2 * altura) / gravedad);
}
