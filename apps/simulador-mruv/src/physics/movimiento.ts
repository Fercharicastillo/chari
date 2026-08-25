export interface CondicionesMovimiento {
  posicionInicial: number;
  velocidadInicial: number;
  aceleracion: number;
}

export interface MedicionPasoMarcadores {
  entrada: number;
  salida: number;
  duracion: number;
}

/** Posición del móvil para un MRUV: x(t) = x0 + v0*t + (a*t^2)/2. */
export function calcularPosicion(
  tiempo: number,
  condiciones: CondicionesMovimiento,
): number {
  const { posicionInicial, velocidadInicial, aceleracion } = condiciones;

  return (
    posicionInicial +
    velocidadInicial * tiempo +
    (aceleracion * tiempo ** 2) / 2
  );
}

/**
 * Devuelve el primer instante no negativo en que el móvil alcanza una posición.
 * Si el móvil no puede alcanzarla con las condiciones dadas, devuelve null.
 */
export function calcularTiempoEnPosicion(
  posicionObjetivo: number,
  condiciones: CondicionesMovimiento,
): number | null {
  const { posicionInicial, velocidadInicial, aceleracion } = condiciones;
  const desplazamiento = posicionObjetivo - posicionInicial;

  if (desplazamiento <= 0) return 0;

  if (Math.abs(aceleracion) < Number.EPSILON) {
    return velocidadInicial > 0 ? desplazamiento / velocidadInicial : null;
  }

  const discriminante =
    velocidadInicial ** 2 + 2 * aceleracion * desplazamiento;

  if (discriminante < 0) return null;

  const soluciones = [
    (-velocidadInicial + Math.sqrt(discriminante)) / aceleracion,
    (-velocidadInicial - Math.sqrt(discriminante)) / aceleracion,
  ].filter((tiempo) => tiempo >= 0 && Number.isFinite(tiempo));

  return soluciones.length > 0 ? Math.min(...soluciones) : null;
}

/**
 * Calcula el intervalo entre el paso de los dos marcadores ópticos del carrito.
 * La entrada ocurre cuando el marcador delantero llega al sensor y la salida
 * cuando lo hace el marcador trasero. Como x(t) representa al marcador
 * delantero, la salida sucede cuando este ha avanzado la separación existente
 * entre ambos marcadores.
 */
export function calcularPasoMarcadores(
  posicionSensor: number,
  separacionMarcadores: number,
  condiciones: CondicionesMovimiento,
): MedicionPasoMarcadores | null {
  if (separacionMarcadores <= 0) return null;

  const entrada = calcularTiempoEnPosicion(posicionSensor, condiciones);
  const salida = calcularTiempoEnPosicion(
    posicionSensor + separacionMarcadores,
    condiciones,
  );

  if (entrada === null || salida === null || salida < entrada) return null;

  return {
    entrada,
    salida,
    duracion: salida - entrada,
  };
}
