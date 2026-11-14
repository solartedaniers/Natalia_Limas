"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASSISTANT_LIMITS } from "@/config/assistant";
import { ChatClient } from "@/lib/assistant/ChatClient";
import type { ChatErrorCode, ChatMessage, ChatOutcome, ChatRole } from "@/types/assistant";
import type { Language } from "@/types/content";

export interface ChatEntry {
  id: number;
  role: ChatRole;
  text: string;
  // Avisos sin texto propio: el panel los muestra con los textos del idioma activo
  notice?: ChatErrorCode;
}

const client = new ChatClient();

export function useAssistantChat(language: Language) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(0);
  const entriesRef = useRef(entries);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => () => abort.current?.abort(), []);

  const update = useCallback((id: number, change: (entry: ChatEntry) => ChatEntry) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? change(entry) : entry)));
  }, []);

  const send = useCallback(
    async (raw: string): Promise<ChatOutcome> => {
      const text = raw.trim();
      if (!text || pending) return "invalid";

      const userId = nextId.current++;
      const replyId = nextId.current++;
      if (text.length > ASSISTANT_LIMITS.maxQuestionLength) {
        setEntries((current) => [...current, { id: replyId, role: "assistant", text: "", notice: "too_long" }]);
        return "too_long";
      }

      // El historial que viaja al servidor omite los avisos locales
      const history: ChatMessage[] = [
        ...entriesRef.current.filter((entry) => !entry.notice && entry.text).map(({ role, text: body }) => ({ role, text: body })),
        { role: "user", text },
      ];
      setEntries((current) => [...current, { id: userId, role: "user", text }, { id: replyId, role: "assistant", text: "" }]);
      setPending(true);

      abort.current = new AbortController();
      const outcome = await client.send(language, history, (chunk) => update(replyId, (entry) => ({ ...entry, text: entry.text + chunk })), abort.current.signal);

      if (outcome !== "ok") {
        const notice: ChatErrorCode = outcome;
        setEntries((current) => {
          const reply = current.find((entry) => entry.id === replyId);
          // Si alcanzó a llegar parte de la respuesta, se conserva y el aviso va aparte
          if (reply?.text) return [...current, { id: nextId.current++, role: "assistant", text: "", notice }];
          return current.map((entry) => (entry.id === replyId ? { ...entry, notice } : entry));
        });
      }
      setPending(false);
      return outcome;
    },
    [language, pending, update],
  );

  return { entries, pending, send };
}
