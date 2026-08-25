/**
 * Genera una desviación relativa uniforme dentro de ±porcentajeMaximo.
 * Por ejemplo, 5 produce un valor comprendido entre -0,05 y 0,05.
 */
export function generarErrorRelativo(
  porcentajeMaximo: number,
  aleatorio: () => number = Math.random,
): number {
  const porcentajeLimitado = Math.min(100, Math.max(0, porcentajeMaximo));
  return (aleatorio() * 2 - 1) * (porcentajeLimitado / 100);
}

/** Aplica una desviación relativa sin permitir lecturas negativas. */
export function aplicarErrorRelativo(
  valorIdeal: number,
  errorRelativo: number,
): number {
  return Math.max(0, valorIdeal * (1 + errorRelativo));
}
