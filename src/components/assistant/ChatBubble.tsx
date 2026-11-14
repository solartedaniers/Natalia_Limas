"use client";
import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LinkBuilder } from "@/lib/LinkBuilder";
import { Icon } from "@/components/ui/Icon";
import type { ChatEntry } from "./useAssistantChat";

// Enlaces y correos dentro del texto se vuelven clicables
const LINK_PATTERN = /(https?:\/\/[^\s]+[^\s.,;:!?)]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK_PATTERN).map((part, index) => {
    if (index % 2 === 0) return part;
    const href = part.includes("@") && !part.startsWith("http") ? `mailto:${part}` : part;
    return (
      <a key={index} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
        {part}
      </a>
    );
  });
}

const BASE = "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]";

export function ChatBubble({ entry }: { entry: Pick<ChatEntry, "role" | "text" | "notice"> }) {
  const { content, site } = useLanguage();
  const copy = content.assistant;

  if (entry.role === "user") {
    return <p className={`${BASE} self-end rounded-tr-md bg-lilac text-navy`}>{entry.text}</p>;
  }

  const card = `${BASE} self-start rounded-tl-md border border-line bg-card text-ink`;
  if (!entry.notice) return <p className={card}>{linkify(entry.text)}</p>;

  // Cuando la IA no puede responder: mensaje amable y vías directas para hablar con Julieth
  const message = { rate_limited: copy.rateLimited, too_long: copy.tooLong, invalid: copy.fallback, unavailable: copy.fallback }[entry.notice];
  const links = new LinkBuilder(site);
  const pill = "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition-transform hover:-translate-y-0.5";
  return (
    <div className={`${card} flex flex-col gap-3`}>
      <p>{message}</p>
      {entry.notice !== "too_long" ? (
        <div className="flex flex-wrap gap-2">
          <a href={links.whatsapp(content.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`${pill} bg-sky text-navy`}>
            <Icon name="whatsapp" size={18} />
            {copy.contactWhatsapp}
          </a>
          <a href={links.email()} className={`${pill} border border-line text-ink`}>
            <Icon name="mail" size={18} />
            {copy.contactEmail}
          </a>
        </div>
      ) : null}
    </div>
  );
}
