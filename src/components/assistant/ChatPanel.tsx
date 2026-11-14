"use client";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Icon } from "@/components/ui/Icon";
import { ASSISTANT_LIMITS, ASSISTANT_TIMING } from "@/config/assistant";
import type { RobotPose } from "@/types/content";
import { AssistantRobot } from "./AssistantRobot";
import { ChatBubble } from "./ChatBubble";
import { useMobileSheet } from "./useMobileSheet";
import type { ChatEntry } from "./useAssistantChat";

interface ChatPanelProps {
  pose: RobotPose;
  entries: ChatEntry[];
  pending: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const TYPING_DOTS = [0, 1, 2];

export function ChatPanel({ pose, entries, pending, onSend, onClose }: ChatPanelProps) {
  const { content } = useLanguage();
  const copy = content.assistant;
  const reduceMotion = useReducedMotion();
  const sheetFrame = useMobileSheet(true);
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const last = entries.at(-1);
  const waiting = pending && last?.role === "assistant" && !last.text && !last.notice;
  const hasAsked = entries.some((entry) => entry.role === "user");
  // Texto final para lectores de pantalla: se anuncia completo, no a pedazos mientras llega
  const announcement = !pending && last?.role === "assistant" ? (last.notice ? "" : last.text) : "";

  // Con mouse el foco va al campo de texto; en celular al botón de cerrar, para no abrir el teclado de golpe
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    (fine ? inputRef.current : closeRef.current)?.focus();
  }, []);

  useEffect(() => {
    const area = scrollRef.current;
    area?.scrollTo({ top: area.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [entries, pending, reduceMotion]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!draft.trim() || pending) return;
    onSend(draft);
    setDraft("");
  };

  // Escape cierra y Tab no sale del panel mientras está abierto
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const lastItem = items.at(-1);
    if (!first || !lastItem) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={copy.dialogLabel}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: ASSISTANT_TIMING.panelTransitionS, ease: [0.22, 1, 0.36, 1] }}
      style={sheetFrame}
      className="shadow-soft fixed inset-x-0 bottom-0 z-[70] flex h-[80dvh] flex-col overflow-hidden rounded-t-[28px] border border-line bg-page sm:inset-x-auto sm:right-[136px] sm:bottom-6 sm:h-[min(560px,calc(100dvh-3rem))] sm:w-[min(380px,calc(100vw-160px))] sm:rounded-[28px]"
    >
      <header className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10">
          <AssistantRobot pose={pose} className="h-11" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight italic">{copy.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-hero-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-online" />
            {copy.status} · {copy.role}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={copy.closeLabel}
          className="glass inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
        >
          <Icon name="close" size={20} />
        </button>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5">
        <ChatBubble entry={{ role: "assistant", text: copy.greeting }} />

        {!hasAsked ? (
          <div role="group" aria-label={copy.suggestionsLabel} className="flex flex-wrap gap-2 pt-1">
            {copy.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSend(suggestion)}
                disabled={pending}
                className="rounded-full border border-lilac-ink/40 bg-lilac-soft px-3.5 py-2 text-left text-sm font-semibold text-lilac-ink transition-colors hover:border-lilac-ink"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {entries.map((entry) => (entry.role === "assistant" && !entry.text && !entry.notice ? null : <ChatBubble key={entry.id} entry={entry} />))}

        {waiting ? (
          <div className="flex items-center gap-1.5 self-start rounded-2xl rounded-tl-md border border-line bg-card px-4 py-4">
            <span className="sr-only">{copy.typing}</span>
            {TYPING_DOTS.map((dot) => (
              <motion.span
                key={dot}
                aria-hidden="true"
                className="size-2 rounded-full bg-lilac-ink"
                animate={reduceMotion ? { opacity: 0.6 } : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: ASSISTANT_TIMING.typingDotS, repeat: Infinity, delay: dot * ASSISTANT_TIMING.typingStaggerS }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <form onSubmit={submit} className="border-t border-line bg-card px-3 pt-3 pb-2">
        <div className="flex items-end gap-2">
          <label htmlFor="assistant-input" className="sr-only">
            {copy.placeholder}
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={ASSISTANT_LIMITS.maxQuestionLength}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={copy.placeholder}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-page px-4 py-2.5 text-base text-ink [field-sizing:content] placeholder:text-muted focus:border-lilac-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || pending}
            aria-label={copy.send}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-lilac text-navy transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Icon name="send" size={20} />
          </button>
        </div>
        <p className="pt-2 text-center text-[11px] leading-snug text-muted">{copy.disclaimer}</p>
      </form>
    </motion.div>
  );
}
