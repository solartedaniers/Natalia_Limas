"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SECTION_IDS } from "@/config/sections";

export function Testimonials() {
  const { content, site } = useLanguage();
  const testimonials = content.testimonials;
  const total = testimonials.items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Rota solo mientras el visitante no esté interactuando
  useEffect(() => {
    if (paused || total < 2) return;
    const timer = setInterval(() => setActiveIndex((index) => (index + 1) % total), site.testimonialRotationMs);
    return () => clearInterval(timer);
  }, [paused, total, site.testimonialRotationMs]);

  const active = testimonials.items[activeIndex] ?? testimonials.items[0];
  if (!active) return null;

  return (
    <section
      id={SECTION_IDS.testimonials}
      aria-label={testimonials.label}
      className="bg-lilac-soft"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center gap-8 px-5 py-28 text-center sm:px-8">
        <span aria-hidden="true" className="font-display text-[120px] leading-[0.6] text-sky-strong">
          &ldquo;
        </span>
        <AnimatePresence mode="wait">
          <motion.figure
            key={active.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <blockquote className="font-display text-[clamp(1.6rem,3vw,2.4rem)] italic leading-snug">{active.quote}</blockquote>
            <figcaption className="flex items-center gap-4 text-left">
              <span className="flex size-14 items-center justify-center rounded-full bg-navy font-bold text-white dark:bg-lilac dark:text-navy">{active.initials}</span>
              <span>
                <strong className="block">{active.name}</strong>
                <span className="text-muted">{active.role}</span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
        <div className="flex gap-2">
          {testimonials.items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.name}
                type="button"
                aria-label={`${testimonials.goTo} ${item.name}`}
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
                className="flex min-h-11 min-w-11 items-center justify-center"
              >
                <span className={`block h-2.5 rounded-full transition-all ${isActive ? "w-8 bg-navy dark:bg-lilac" : "w-2.5 bg-muted/50"}`} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
