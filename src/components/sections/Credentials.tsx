"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ContentRepository } from "@/lib/ContentRepository";
import { AccentTitle } from "@/components/ui/AccentTitle";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_IDS } from "@/config/sections";

const FAN_ANGLE = 11;
const FAN_SHIFT = 72;

export function Credentials() {
  const { content } = useLanguage();
  const credentials = content.credentials;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = credentials.items[selectedIndex] ?? credentials.items[0];
  const selectedFile = selected ? ContentRepository.documentFor(selected.id) : null;
  const selectedImage = selected ? ContentRepository.imageFor(selected.id) : null;

  return (
    <section id={SECTION_IDS.credentials} className="mx-auto flex max-w-6xl flex-wrap items-center gap-16 px-5 py-28 sm:px-8">
      <Reveal className="relative flex min-h-[500px] flex-[1_1_380px] items-center justify-center">
        {/* Las hojas de atrás se abren en abanico al entrar en pantalla */}
        <motion.div
          aria-hidden="true"
          initial={{ rotate: 0, x: 0 }}
          whileInView={{ rotate: -FAN_ANGLE, x: -FAN_SHIFT }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="shadow-soft absolute h-[410px] w-[min(270px,64vw)] rounded-[18px] bg-lilac-soft"
        />
        <motion.div
          aria-hidden="true"
          initial={{ rotate: 0, x: 0 }}
          whileInView={{ rotate: FAN_ANGLE - 2, x: FAN_SHIFT }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="shadow-soft absolute h-[410px] w-[min(270px,64vw)] rounded-[18px] bg-sky-soft"
        />
        <div className="shadow-soft relative flex h-[430px] w-[min(290px,72vw)] rounded-[18px] bg-card p-3 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected?.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center gap-3"
            >
              {/* Con imagen, el soporte ocupa la hoja; sin imagen se mantiene el ícono */}
              {selectedImage ? (
                <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[12px] bg-lilac-soft">
                  <Image src={selectedImage} alt={selected?.title ?? ""} fill sizes="(max-width: 640px) 72vw, 290px" className="object-cover" />
                </div>
              ) : (
                <span className="mt-auto flex size-14 items-center justify-center rounded-full bg-lilac-soft text-lilac-ink">
                  <Icon name="document" />
                </span>
              )}
              <div className={`flex flex-col items-center gap-2 px-3 pb-3 ${selectedImage ? "" : "mb-auto"}`}>
                <p className="font-display text-lg leading-snug italic">{selected?.title}</p>
                <p className="text-sm text-muted">{selected?.detail}</p>
                {selectedFile ? (
                  <a
                    href={selectedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-page"
                  >
                    {credentials.view}
                  </a>
                ) : (
                  <span className="mt-1 rounded-full bg-sky-soft px-4 py-2 text-sm font-semibold text-sky-ink">{credentials.pending}</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      <div className="flex min-w-0 flex-[999_1_440px] flex-col gap-7">
        <Reveal>
          <AccentTitle start={credentials.titleStart} accent={credentials.titleAccent} className="text-[clamp(2.4rem,4.6vw,4rem)]" />
          <p className="mt-3 text-muted">{credentials.previewHint}</p>
        </Reveal>
        <ul className="flex flex-col">
          {credentials.items.map((item, index) => {
            const active = index === selectedIndex;
            const file = ContentRepository.documentFor(item.id);
            const select = () => setSelectedIndex(index);
            const rowClassName = "group flex w-full items-center justify-between gap-4 py-5 text-left";
            const row = (
              <>
                <span>
                  <strong className={`block text-lg transition-colors ${active ? "text-lilac-ink" : ""}`}>{item.title}</strong>
                  <span className="text-muted">{item.detail}</span>
                </span>
                <Icon
                  name="arrow"
                  className={`shrink-0 text-lilac-ink transition-transform ${active ? "translate-x-1" : "opacity-50 group-hover:translate-x-1 group-hover:opacity-100"}`}
                />
              </>
            );
            return (
              <li key={item.id} className="border-b border-line last:border-b-0">
                {/* Con documento, el clic selecciona y además lo abre; sin documento solo selecciona */}
                {file ? (
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title} · ${credentials.opensInNewTab}`}
                    aria-current={active || undefined}
                    onClick={select}
                    onMouseEnter={select}
                    className={rowClassName}
                  >
                    {row}
                  </a>
                ) : (
                  <button type="button" aria-pressed={active} onClick={select} onMouseEnter={select} className={rowClassName}>
                    {row}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
