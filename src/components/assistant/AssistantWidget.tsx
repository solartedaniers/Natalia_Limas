"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ContentRepository } from "@/lib/ContentRepository";
import { Icon } from "@/components/ui/Icon";
import { ASSISTANT_TIMING } from "@/config/assistant";
import type { RobotPose } from "@/types/content";
import { AssistantRobot } from "./AssistantRobot";
import { ChatPanel } from "./ChatPanel";
import { useAssistantChat } from "./useAssistantChat";

// Saludos y agradecimientos (palabras de los JSON) ponen al robot emocionado
function isGreeting(text: string, words: string[]): boolean {
  const normalize = (value: string) =>
    ` ${value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  const message = normalize(text);
  return words.some((word) => message.includes(normalize(word)));
}

export function AssistantWidget() {
  const { content, language, site } = useLanguage();
  const copy = content.assistant;
  // El visitante puede saludar en cualquier idioma, no solo en el de la página
  const greetingWords = useMemo(() => site.languages.flatMap((code) => ContentRepository.page(code).assistant.excitedWords), [site]);
  const chat = useAssistantChat(language);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [moment, setMoment] = useState<RobotPose | null>(null);
  const momentTimer = useRef<number | undefined>(undefined);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Prioridad de poses: pensando > momento breve (bienvenida, pulgar, emoción) > saludo con la mano > reposo
  const pose: RobotPose = chat.pending ? "thinking" : (moment ?? (hovered || nudge ? "wave" : "idle"));

  const showMoment = useCallback((next: RobotPose, durationMs: number) => {
    window.clearTimeout(momentTimer.current);
    setMoment(next);
    momentTimer.current = window.setTimeout(() => setMoment(null), durationMs);
  }, []);

  useEffect(() => () => window.clearTimeout(momentTimer.current), []);

  // La burbuja invita a conversar cada cierto tiempo, solo mientras el chat no se ha usado
  useEffect(() => {
    if (open || engaged) return;
    let hideTimer: number | undefined;
    const show = () => {
      setNudge(true);
      hideTimer = window.setTimeout(() => setNudge(false), ASSISTANT_TIMING.nudgeVisibleMs);
    };
    let interval: number | undefined;
    const first = window.setTimeout(() => {
      show();
      interval = window.setInterval(show, ASSISTANT_TIMING.nudgeIntervalMs);
    }, ASSISTANT_TIMING.nudgeFirstDelayMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      window.clearTimeout(hideTimer);
      setNudge(false);
    };
  }, [open, engaged]);

  const openChat = () => {
    setOpen(true);
    setEngaged(true);
    showMoment("welcome", ASSISTANT_TIMING.welcomeMs);
  };

  const closeChat = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    const greeting = isGreeting(text, greetingWords);
    const outcome = await chat.send(text);
    if (outcome === "ok") showMoment(greeting ? "excited" : "thumbsUp", greeting ? ASSISTANT_TIMING.excitedMs : ASSISTANT_TIMING.thumbsUpMs);
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            {/* Fondo: oscurece la página en celular; en escritorio es transparente y cierra al hacer clic afuera */}
            <motion.div
              key="backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 z-[65] bg-navy/45 sm:bg-transparent"
            />
            <ChatPanel key="panel" pose={pose} entries={chat.entries} pending={chat.pending} onSend={send} onClose={closeChat} />
          </>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-4 bottom-4 z-[66] flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {nudge && !open ? (
            <motion.div
              key="nudge"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="shadow-soft pointer-events-auto flex max-w-[min(16rem,calc(100vw-2rem))] items-start gap-2 rounded-2xl rounded-br-md border border-line bg-card py-2.5 pr-2 pl-4 text-sm font-semibold text-ink"
            >
              <button type="button" onClick={openChat} className="py-1 text-left">
                {copy.nudge}
              </button>
              <button
                type="button"
                onClick={() => setEngaged(true)}
                aria-label={copy.dismissNudge}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-lilac-soft"
              >
                <Icon name="close" size={16} />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          ref={launcherRef}
          type="button"
          onClick={open ? closeChat : openChat}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          aria-label={open ? copy.closeLabel : copy.openLabel}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="pointer-events-auto size-[72px] rounded-full drop-shadow-[0_10px_18px_var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lilac-ink sm:size-24"
        >
          <AssistantRobot pose={pose} animated className="size-full" />
        </button>
      </div>
    </>
  );
}
