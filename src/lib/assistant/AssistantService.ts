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
    private readonly models: string[],
  ) {
    // Sin reintentos del SDK: con el modelo saturado alargan la espera; el respaldo lo manejamos aquí
    this.client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: ASSISTANT_MODEL.apiVersion, retryOptions: { attempts: 1 } } });
  }

  static fromEnvironment(): AssistantService | null {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;
    const primary = process.env.GEMINI_MODEL?.trim() || ASSISTANT_MODEL.defaultModel;
    return new AssistantService(apiKey, [...new Set([primary, ASSISTANT_MODEL.backupModel])]);
  }

  // Espera el primer fragmento con texto antes de responder, para que cualquier fallo
  // (cupo, modelo, clave, red) se detecte a tiempo y el chat muestre el mensaje amable
  async open(messages: ChatMessage[], systemInstruction: string, signal: AbortSignal): Promise<AssistantStream> {
    let lastError: unknown;
    for (const model of this.models) {
      try {
        return await this.openWith(model, messages, systemInstruction, signal);
      } catch (error) {
        lastError = error;
        if (signal.aborted || !AssistantService.isTransient(error)) break;
        console.warn(this.describe(error, model));
      }
    }
    throw lastError;
  }

  // Descripción segura del error para el log del servidor, sin la clave
  describe(error: unknown, model = this.models[0]): string {
    const name = error instanceof Error ? error.name : "UnknownError";
    const message = (error instanceof Error ? error.message : String(error)).replaceAll(this.apiKey, "[redacted]");
    return `[assistant] model=${model} status=${AssistantService.status(error) ?? "n/a"} ${name}: ${message.slice(0, 300)}`;
  }

  private async openWith(model: string, messages: ChatMessage[], systemInstruction: string, signal: AbortSignal): Promise<AssistantStream> {
    // Si el modelo no empieza a responder a tiempo, se corta y se prueba el siguiente
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), ASSISTANT_LIMITS.firstChunkTimeoutMs);
    try {
      const response = await this.client.models.generateContentStream({
        model,
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.text }],
        })),
        config: {
          systemInstruction,
          maxOutputTokens: ASSISTANT_LIMITS.maxOutputTokens,
          abortSignal: AbortSignal.any([signal, timeout.signal]),
        },
      });

      // next() en lugar de for-await: salir de un for-await cerraría el resto del stream
      const rest = AssistantService.texts(response);
      for (let step = await rest.next(); !step.done; step = await rest.next()) {
        if (step.value) return { first: step.value, rest };
      }
      throw new Error(`${model} returned an empty answer`);
    } finally {
      clearTimeout(timer);
    }
  }

  private static isTransient(error: unknown): boolean {
    const status = AssistantService.status(error);
    // Sin código HTTP: se agotó el tiempo o falló la red
    return status === undefined || (ASSISTANT_MODEL.transientStatuses as readonly number[]).includes(status);
  }

  private static status(error: unknown): number | undefined {
    if (typeof error !== "object" || !error || !("status" in error)) return undefined;
    return typeof error.status === "number" ? error.status : undefined;
  }

  private static async *texts(response: AsyncGenerator<{ text?: string }>): AsyncGenerator<string> {
    for await (const chunk of response) yield chunk.text ?? "";
  }
}
