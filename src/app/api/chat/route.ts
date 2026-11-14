import { ASSISTANT_API, ASSISTANT_LIMITS } from "@/config/assistant";
import { AssistantPromptBuilder } from "@/lib/assistant/AssistantPromptBuilder";
import { AssistantService } from "@/lib/assistant/AssistantService";
import { ChatRequest } from "@/lib/assistant/ChatRequest";
import { RateLimiter } from "@/lib/assistant/RateLimiter";
import type { ChatErrorCode } from "@/types/assistant";

export const dynamic = "force-dynamic";

const limiter = new RateLimiter(ASSISTANT_LIMITS.rateLimit.maxRequests, ASSISTANT_LIMITS.rateLimit.windowMs);

const STATUS: Record<ChatErrorCode, number> = {
  rate_limited: 429,
  too_long: 413,
  invalid: 400,
  unavailable: 503,
};

function fail(error: ChatErrorCode): Response {
  return Response.json({ error }, { status: STATUS[error], headers: { "Cache-Control": "no-store" } });
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request): Promise<Response> {
  if (!limiter.allow(clientIp(request))) return fail("rate_limited");

  const raw = await request.text();
  if (raw.length > ASSISTANT_LIMITS.maxRequestBodyBytes) return fail("too_long");

  const parsed = ChatRequest.parse(raw);
  if (!parsed.ok) return fail(parsed.error);

  const service = AssistantService.fromEnvironment();
  if (!service) {
    console.error("[assistant] GEMINI_API_KEY is not configured");
    return fail("unavailable");
  }

  const prompt = new AssistantPromptBuilder(parsed.language).build();
  let stream;
  try {
    stream = await service.open(parsed.messages, prompt, request.signal);
  } catch (error) {
    console.error(service.describe(error));
    return fail("unavailable");
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Si el visitante cierra el chat a mitad de respuesta, el stream ya no acepta datos
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {}
      };
      send(stream.first);
      try {
        for await (const text of stream.rest) send(text);
      } catch (error) {
        if (!request.signal.aborted) console.error(service.describe(error));
        send(ASSISTANT_API.streamErrorMarker);
      }
      try {
        controller.close();
      } catch {}
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
