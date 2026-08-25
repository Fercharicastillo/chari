export function generarErrorRelativo(
  porcentajeMaximo: number,
  aleatorio: () => number = Math.random,
): number {
  const porcentajeLimitado = Math.min(100, Math.max(0, porcentajeMaximo));
  return (aleatorio() * 2 - 1) * (porcentajeLimitado / 100);
}

export function aplicarErrorRelativo(
  valorIdeal: number,
  errorRelativo: number,
): number {
  return Math.max(0, valorIdeal * (1 + errorRelativo));
}
