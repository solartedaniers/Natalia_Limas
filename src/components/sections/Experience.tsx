"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AccentTitle } from "@/components/ui/AccentTitle";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_IDS } from "@/config/sections";
import type { Tone } from "@/types/content";

const RING: Record<Tone, string> = {
  sky: "ring-sky",
  lilac: "ring-lilac",
};

const PERIOD_COLOR: Record<Tone, string> = {
  sky: "text-sky-ink",
  lilac: "text-lilac-ink",
};

export function Experience() {
  const { content } = useLanguage();
  const experience = content.experience;
  const timelineRef = useRef<HTMLDivElement>(null);

  // La línea del recorrido se va llenando a medida que se hace scroll
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id={SECTION_IDS.experience} className="bg-journey">
      <div className="mx-auto flex max-w-4xl flex-col gap-14 px-5 py-24 sm:px-8 sm:py-28">
        <Reveal>
          <AccentTitle start={experience.titleStart} accent={experience.titleAccent} className="text-center text-[clamp(2.4rem,4.6vw,4rem)]" />
        </Reveal>

        <div ref={timelineRef} className="relative flex flex-col gap-14 pl-12">
          <span aria-hidden="true" className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-line" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: fill }}
            className="absolute left-[11px] top-2 bottom-2 w-0.5 origin-top bg-gradient-to-b from-sky-strong to-lilac"
          />
          {experience.items.map((item, index) => (
            <Reveal key={item.role} delay={index * 0.1} className="relative flex flex-col gap-2">
              <span aria-hidden="true" className={`absolute -left-[46px] top-1 size-5 rounded-full bg-navy ring-[6px] ${RING[item.tone]}`} />
              <p className={`text-sm font-bold uppercase tracking-wider ${PERIOD_COLOR[item.tone]}`}>{item.period}</p>
              <h3 className="font-display text-2xl font-semibold sm:text-3xl">
                {item.role} · <span className="font-medium">{item.company}</span>
              </h3>
              <p className="max-w-2xl leading-relaxed text-muted">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
