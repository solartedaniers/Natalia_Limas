import { ASSISTANT_LIMITS } from "@/config/assistant";
import { ContentRepository } from "@/lib/ContentRepository";
import type { ChatErrorCode, ChatMessage } from "@/types/assistant";
import type { Language } from "@/types/content";

type ParseResult = { ok: true; language: Language; messages: ChatMessage[] } | { ok: false; error: ChatErrorCode };

// Valida el cuerpo que llega del navegador: nada de lo que envía el visitante se usa sin revisar
export class ChatRequest {
  static parse(raw: string): ParseResult {
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return { ok: false, error: "invalid" };
    }
    if (!body || typeof body !== "object") return { ok: false, error: "invalid" };

    const { language, messages } = body as { language?: unknown; messages?: unknown };
    if (!ContentRepository.isSupported(language) || !Array.isArray(messages)) return { ok: false, error: "invalid" };

    const recent = messages.slice(-ASSISTANT_LIMITS.historyMessages);
    if (!recent.every(ChatRequest.isMessage)) return { ok: false, error: "invalid" };

    const history = recent.map((message) => ({ role: message.role, text: message.text.trim() })).filter((message) => message.text);
    const last = history.at(-1);
    if (!last || last.role !== "user") return { ok: false, error: "invalid" };
    if (history.some((message) => message.role === "user" && message.text.length > ASSISTANT_LIMITS.maxQuestionLength)) {
      return { ok: false, error: "too_long" };
    }

    // Gemini exige que la conversación empiece con un mensaje del visitante
    const firstUser = history.findIndex((message) => message.role === "user");
    return { ok: true, language, messages: history.slice(firstUser) };
  }

  private static isMessage(value: unknown): value is ChatMessage {
    if (!value || typeof value !== "object") return false;
    const { role, text } = value as { role?: unknown; text?: unknown };
    return (role === "user" || role === "assistant") && typeof text === "string";
  }
}
