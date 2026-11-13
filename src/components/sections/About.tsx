"use client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_IDS } from "@/config/sections";
import type { StatementPart, Tone } from "@/types/content";

const TONE_BACKGROUND: Record<Tone, string> = {
  sky: "bg-sky-soft",
  lilac: "bg-lilac-soft",
};

const PART_CLASS: Record<StatementPart["style"], string> = {
  plain: "",
  highlight: "marker",
  accent: "italic text-lilac-ink",
};

export function About() {
  const { content } = useLanguage();
  const about = content.about;

  return (
    <section id={SECTION_IDS.about} className="mx-auto flex max-w-5xl flex-col gap-14 px-5 py-28 sm:px-8 sm:py-32">
      <Reveal>
        <p className="font-display text-[clamp(1.7rem,3.4vw,2.9rem)] leading-snug">
          {about.statementParts.map((part, index) => (
            <span key={index} className={PART_CLASS[part.style]}>
              {part.text}
            </span>
          ))}
        </p>
      </Reveal>

      <div className="flex flex-wrap gap-10">
        {about.areas.map((area, index) => (
          <Reveal key={area.title} delay={index * 0.12} className="flex flex-[1_1_240px] items-start gap-4">
            <span className={`flex size-13 shrink-0 items-center justify-center rounded-full text-ink ${TONE_BACKGROUND[area.tone]}`}>
              <Icon name={area.icon} />
            </span>
            <div>
              <h3 className="mb-1.5 text-lg font-bold">{area.title}</h3>
              <p className="leading-relaxed text-muted">{area.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
