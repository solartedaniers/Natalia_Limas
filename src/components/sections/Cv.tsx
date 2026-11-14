"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ContentRepository } from "@/lib/ContentRepository";
import { AccentTitle } from "@/components/ui/AccentTitle";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_IDS } from "@/config/sections";
import { CV_PREVIEW } from "@/config/effects";

export function Cv() {
  const { content, language } = useLanguage();
  const cv = content.cv;
  const cvFile = ContentRepository.cvFor(language);

  return (
    <section id={SECTION_IDS.cv} className="bg-journey">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-16 px-5 py-28 sm:px-8">
        <Reveal className="flex min-w-0 flex-[999_1_440px] flex-col gap-7">
          <AccentTitle start={cv.titleStart} accent={cv.titleAccent} className="text-[clamp(2.4rem,4.6vw,4rem)]" />
          <p className="max-w-lg text-lg leading-relaxed text-muted">{cv.description}</p>

          {cvFile ? (
            <div className="flex flex-wrap gap-3">
              <a
                href={cvFile.file}
                download
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-ink px-7 font-bold text-page transition-transform hover:-translate-y-0.5"
              >
                <Icon name="document" />
                {cv.download}
              </a>
              <a
                href={cvFile.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 items-center gap-2 rounded-full border border-line bg-card px-7 font-semibold transition-colors hover:border-lilac-ink hover:text-lilac-ink"
              >
                {cv.viewOnline}
                <Icon name="arrow" />
              </a>
            </div>
          ) : (
            <span className="self-start rounded-full bg-sky-soft px-4 py-2 text-sm font-semibold text-sky-ink">{cv.pending}</span>
          )}
        </Reveal>

        {cvFile ? (
          <Reveal delay={0.15} className="flex flex-[1_1_300px] justify-center [perspective:1200px]">
            {/* La hoja queda levemente girada en 3D y se endereza al pasar el mouse */}
            <motion.a
              href={cvFile.file}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={cv.viewOnline}
              initial={{ rotateX: CV_PREVIEW.rotateX, rotateY: CV_PREVIEW.rotateY }}
              whileHover={{ rotateX: 0, rotateY: 0, scale: CV_PREVIEW.hoverScale }}
              className="relative block w-[min(320px,78vw)]"
            >
              <span aria-hidden="true" className="shadow-soft absolute inset-0 translate-x-5 translate-y-4 rotate-3 rounded-[18px] bg-lilac-soft" />
              <span className="shadow-soft relative block aspect-[640/829] overflow-hidden rounded-[18px] bg-white">
                <Image src={cvFile.preview} alt={cv.previewAlt} fill sizes="(max-width: 640px) 78vw, 320px" className="object-cover" />
              </span>
            </motion.a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
