// Modelo de Gemini: el alias "-latest" lo actualiza Google solo; GEMINI_MODEL permite cambiarlo sin tocar código
export const ASSISTANT_MODEL = {
  defaultModel: "gemini-flash-latest",
  // Los alias "-latest" solo se publican en v1beta
  apiVersion: "v1beta",
} as const;

// Límites para proteger el cupo gratuito de la API
export const ASSISTANT_LIMITS = {
  maxQuestionLength: 500,
  maxOutputTokens: 1024,
  historyMessages: 8,
  maxRequestBodyBytes: 16_000,
  rateLimit: {
    maxRequests: 15,
    windowMs: 10 * 60 * 1000,
  },
} as const;

// Tiempos de la animación del robot (milisegundos y segundos según el nombre)
export const ASSISTANT_TIMING = {
  poseFadeMs: 250,
  thumbsUpMs: 2000,
  excitedMs: 2000,
  nudgeFirstDelayMs: 12_000,
  nudgeIntervalMs: 45_000,
  nudgeVisibleMs: 6000,
  floatDurationS: 3.2,
  swayDurationS: 4.6,
  glowDurationS: 2.4,
} as const;

// Amplitud de los movimientos continuos del robot
export const ASSISTANT_MOTION = {
  floatOffsetPx: 6,
  swayDeg: 2.5,
  tiltDeg: 12,
  tiltSpring: { stiffness: 120, damping: 16 },
  glowOpacity: [0.35, 0.85] as const,
  glowScale: [0.85, 1.1] as const,
} as const;

// Panel del chat en celular: alto relativo a la pantalla y margen superior mínimo
export const ASSISTANT_PANEL = {
  mobileBreakpointPx: 640,
  mobileHeightRatio: 0.8,
  mobileTopGapPx: 24,
} as const;

// Comunicación entre la ruta /api/chat y el navegador
export const ASSISTANT_API = {
  endpoint: "/api/chat",
  // Marca que el servidor agrega si Gemini falla a mitad de la respuesta
  streamErrorMarker: "\u0000assistant-error\u0000",
} as const;
