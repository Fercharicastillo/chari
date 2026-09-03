export const GRAVEDAD_TERRESTRE = 9.81;

export type CondicionesMovimientoParabolico = {
  posicionHorizontalInicial: number;
  alturaInicial: number;
  velocidadInicial: number;
  anguloGrados: number;
  gravedad: number;
};

export type CondicionesImpacto = CondicionesMovimientoParabolico & {
  alturaImpacto: number;
};

export type PosicionBidimensional = {
  x: number;
  y: number;
};

export type PuntoImpacto = PosicionBidimensional & {
  tiempo: number;
};

export type ResultadoLanzamiento = {
  tiempoVuelo: number | null;
  alcance: number | null;
  alturaMaxima: number;
  tiempoAlturaMaxima: number;
  puntoImpacto: PuntoImpacto | null;
};

const TOLERANCIA_NUMERICA = 1e-10;

function validarCondiciones({
  posicionHorizontalInicial,
  alturaInicial,
  velocidadInicial,
  anguloGrados,
  gravedad,
}: CondicionesMovimientoParabolico) {
  const valores = [
    posicionHorizontalInicial,
    alturaInicial,
    velocidadInicial,
    anguloGrados,
    gravedad,
  ];

  if (!valores.every(Number.isFinite)) {
    throw new TypeError("Las condiciones del lanzamiento deben ser finitas.");
  }
  if (velocidadInicial < 0) {
    throw new RangeError("La velocidad inicial no puede ser negativa.");
  }
  if (gravedad <= 0) {
    throw new RangeError("La gravedad debe ser mayor que cero.");
  }
}

export function convertirGradosARadianes(anguloGrados: number): number {
  return (anguloGrados * Math.PI) / 180;
}

export function calcularComponentesVelocidad(
  condiciones: CondicionesMovimientoParabolico,
) {
  validarCondiciones(condiciones);
  const anguloRadianes = convertirGradosARadianes(condiciones.anguloGrados);

  return {
    horizontal: condiciones.velocidadInicial * Math.cos(anguloRadianes),
    vertical: condiciones.velocidadInicial * Math.sin(anguloRadianes),
  };
}

/** x(t) = x₀ + v₀ cos(α)t. */
export function calcularPosicionHorizontal(
  tiempo: number,
  condiciones: CondicionesMovimientoParabolico,
): number {
  if (!Number.isFinite(tiempo)) {
    throw new TypeError("El tiempo debe ser finito.");
  }

  const velocidad = calcularComponentesVelocidad(condiciones);
  return condiciones.posicionHorizontalInicial + velocidad.horizontal * tiempo;
}

/** y(t) = y₀ + v₀ sin(α)t - gt²/2. */
export function calcularPosicionVertical(
  tiempo: number,
  condiciones: CondicionesMovimientoParabolico,
): number {
  if (!Number.isFinite(tiempo)) {
    throw new TypeError("El tiempo debe ser finito.");
  }

  const velocidad = calcularComponentesVelocidad(condiciones);
  return (
    condiciones.alturaInicial +
    velocidad.vertical * tiempo -
    (condiciones.gravedad * tiempo ** 2) / 2
  );
}

export function calcularPosicion(
  tiempo: number,
  condiciones: CondicionesMovimientoParabolico,
): PosicionBidimensional {
  return {
    x: calcularPosicionHorizontal(tiempo, condiciones),
    y: calcularPosicionVertical(tiempo, condiciones),
  };
}

/**
 * Devuelve el instante descendente en que el proyectil alcanza la altura de
 * impacto. Devuelve null cuando esa altura no pertenece a la trayectoria.
 */
export function calcularTiempoVuelo({
  alturaImpacto,
  ...condiciones
}: CondicionesImpacto): number | null {
  if (!Number.isFinite(alturaImpacto)) {
    throw new TypeError("La altura de impacto debe ser finita.");
  }

  const velocidad = calcularComponentesVelocidad(condiciones);
  const discriminante =
    velocidad.vertical ** 2 +
    2 * condiciones.gravedad *
      (condiciones.alturaInicial - alturaImpacto);

  if (discriminante < -TOLERANCIA_NUMERICA) return null;

  const raiz = Math.sqrt(Math.max(0, discriminante));
  const soluciones = [
    (velocidad.vertical - raiz) / condiciones.gravedad,
    (velocidad.vertical + raiz) / condiciones.gravedad,
  ].filter(
    (tiempo) =>
      tiempo >= -TOLERANCIA_NUMERICA && Number.isFinite(tiempo),
  );

  if (soluciones.length === 0) return null;
  return Math.max(...soluciones.map((tiempo) => Math.max(0, tiempo)));
}

export function calcularAlcance(
  condiciones: CondicionesImpacto,
): number | null {
  const tiempoVuelo = calcularTiempoVuelo(condiciones);
  if (tiempoVuelo === null) return null;

  return (
    calcularPosicionHorizontal(tiempoVuelo, condiciones) -
    condiciones.posicionHorizontalInicial
  );
}

/** Altura máxima absoluta, medida desde el mismo cero que y₀. */
export function calcularAlturaMaxima(
  condiciones: CondicionesMovimientoParabolico,
): number {
  const velocidad = calcularComponentesVelocidad(condiciones);
  if (velocidad.vertical <= 0) return condiciones.alturaInicial;

  return (
    condiciones.alturaInicial +
    velocidad.vertical ** 2 / (2 * condiciones.gravedad)
  );
}

export function calcularTiempoAlturaMaxima(
  condiciones: CondicionesMovimientoParabolico,
): number {
  const velocidad = calcularComponentesVelocidad(condiciones);
  return Math.max(0, velocidad.vertical / condiciones.gravedad);
}

export function calcularPuntoImpacto(
  condiciones: CondicionesImpacto,
): PuntoImpacto | null {
  const tiempo = calcularTiempoVuelo(condiciones);
  if (tiempo === null) return null;

  const posicion = calcularPosicion(tiempo, condiciones);
  return {
    x: posicion.x,
    y: condiciones.alturaImpacto,
    tiempo,
  };
}

export function calcularResultadoLanzamiento(
  condiciones: CondicionesImpacto,
): ResultadoLanzamiento {
  const puntoImpacto = calcularPuntoImpacto(condiciones);

  return {
    tiempoVuelo: puntoImpacto?.tiempo ?? null,
    alcance:
      puntoImpacto === null
        ? null
        : puntoImpacto.x - condiciones.posicionHorizontalInicial,
    alturaMaxima: calcularAlturaMaxima(condiciones),
    tiempoAlturaMaxima: calcularTiempoAlturaMaxima(condiciones),
    puntoImpacto,
  };
}
