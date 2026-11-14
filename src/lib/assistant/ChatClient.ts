import { ASSISTANT_API, ASSISTANT_LIMITS } from "@/config/assistant";
import type { ChatErrorCode, ChatMessage, ChatOutcome } from "@/types/assistant";
import type { Language } from "@/types/content";

const ERROR_CODES: ChatErrorCode[] = ["rate_limited", "too_long", "invalid", "unavailable"];

// Habla con /api/chat desde el navegador y entrega la respuesta a medida que llega
export class ChatClient {
  async send(language: Language, history: ChatMessage[], onText: (text: string) => void, signal: AbortSignal): Promise<ChatOutcome> {
    let response: Response;
    try {
      response = await fetch(ASSISTANT_API.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, messages: history.slice(-ASSISTANT_LIMITS.historyMessages) }),
        signal,
      });
    } catch {
      return "unavailable";
    }

    if (!response.ok || !response.body) return ChatClient.errorFrom(response);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const marker = ASSISTANT_API.streamErrorMarker;
    try {
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        const text = decoder.decode(chunk.value, { stream: true });
        if (text.includes(marker)) {
          onText(text.replace(marker, ""));
          return "unavailable";
        }
        onText(text);
      }
    } catch {
      return signal.aborted ? "ok" : "unavailable";
    }
    return "ok";
  }

  private static async errorFrom(response: Response): Promise<ChatErrorCode> {
    try {
      const { error } = (await response.json()) as { error?: unknown };
      return ERROR_CODES.find((code) => code === error) ?? "unavailable";
    } catch {
      return "unavailable";
    }
  }
}
