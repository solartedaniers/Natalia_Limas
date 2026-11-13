// Entrada escalonada de las píldoras bajo la foto del inicio (segundos y píxeles)
export const HERO_PILLS = {
  delay: 0.6,
  stagger: 0.15,
  offsetY: 12,
} as const;

// Destello de chispas al hacer clic en los botones del encabezado
export const SPARKLES = {
  count: 10,
  distancePx: 38,
  durationMs: 650,
  sizePx: 10,
  colors: ["var(--lilac)", "var(--sky)", "var(--white)"],
} as const;
