export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

// Códigos que el servidor devuelve; el navegador los traduce a textos de los JSON
export type ChatErrorCode = "rate_limited" | "too_long" | "invalid" | "unavailable";

export type ChatOutcome = "ok" | ChatErrorCode;
