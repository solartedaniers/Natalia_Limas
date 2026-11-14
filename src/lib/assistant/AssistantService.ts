import { GoogleGenAI } from "@google/genai";
import { ASSISTANT_LIMITS, ASSISTANT_MODEL } from "@/config/assistant";
import type { ChatMessage } from "@/types/assistant";

export interface AssistantStream {
  first: string;
  rest: AsyncGenerator<string>;
}

// Única pieza que habla con Gemini. Solo se usa en el servidor: la clave nunca sale de aquí
export class AssistantService {
  private readonly client: GoogleGenAI;

  private constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    this.client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: ASSISTANT_MODEL.apiVersion } });
  }

  static fromEnvironment(): AssistantService | null {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;
    const model = process.env.GEMINI_MODEL?.trim() || ASSISTANT_MODEL.defaultModel;
    return new AssistantService(apiKey, model);
  }

  // Espera el primer fragmento con texto antes de responder, para que cualquier fallo
  // (cupo, modelo, clave, red) se detecte a tiempo y el chat muestre el mensaje amable
  async open(messages: ChatMessage[], systemInstruction: string, signal?: AbortSignal): Promise<AssistantStream> {
    const response = await this.client.models.generateContentStream({
      model: this.model,
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.text }],
      })),
      config: { systemInstruction, maxOutputTokens: ASSISTANT_LIMITS.maxOutputTokens, abortSignal: signal },
    });

    // next() en lugar de for-await: salir de un for-await cerraría el resto del stream
    const rest = AssistantService.texts(response);
    for (let step = await rest.next(); !step.done; step = await rest.next()) {
      if (step.value) return { first: step.value, rest };
    }
    throw new Error("Gemini returned an empty answer");
  }

  // Descripción segura del error para el log del servidor, sin la clave
  describe(error: unknown): string {
    const status = typeof error === "object" && error && "status" in error ? String(error.status) : "n/a";
    const name = error instanceof Error ? error.name : "UnknownError";
    const message = (error instanceof Error ? error.message : String(error)).replaceAll(this.apiKey, "[redacted]");
    return `[assistant] model=${this.model} status=${status} ${name}: ${message.slice(0, 300)}`;
  }

  private static async *texts(response: AsyncGenerator<{ text?: string }>): AsyncGenerator<string> {
    for await (const chunk of response) yield chunk.text ?? "";
  }
}
