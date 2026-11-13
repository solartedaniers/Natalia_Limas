"use client";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LinkBuilder } from "@/lib/LinkBuilder";
import { SECTION_IDS } from "@/config/sections";

const PILL_POSITIONS = [
  "-top-3 -left-3 sm:-left-10",
  "top-[52%] -right-3 sm:-right-12",
  "-bottom-4 left-2 sm:left-6",
];
const SPRING = { stiffness: 80, damping: 18 };
const PILL_DEPTH_PX = 40;

export function Hero() {
  const { content, site } = useLanguage();
  const hero = content.hero;
  const links = new LinkBuilder(site);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, SPRING);
  const smoothY = useSpring(pointerY, SPRING);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Las píldoras y la foto se inclinan levemente siguiendo el mouse
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section id={SECTION_IDS.hero} className="bg-glow overflow-hidden rounded-b-[40px] text-hero-ink sm:rounded-b-[64px]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-14 px-5 pb-24 pt-32 sm:px-8 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-w-0 flex-[999_1_520px] flex-col gap-7"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky sm:text-sm">{hero.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.6rem,6.4vw,5.75rem)] font-medium leading-[1.04]">
            {hero.titleStart} <em className="text-lilac">{hero.titleAccentOne}</em> {hero.titleMiddle}{" "}
            <em className="text-sky">{hero.titleAccentTwo}</em>
            {hero.titleEnd}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-hero-muted">{hero.description}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={links.section(SECTION_IDS.experience)}
              className="inline-flex min-h-13 items-center rounded-full bg-white px-7 font-bold text-navy transition-transform hover:-translate-y-0.5"
            >
              {hero.primaryCta}
            </a>
            <a
              href={links.whatsapp(content.contact.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex min-h-13 items-center rounded-full px-7 font-semibold text-hero-ink transition-colors hover:bg-white/20"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </motion.div>

        <div
          className="relative flex flex-[1_1_320px] justify-center py-10 [perspective:1000px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ rotateX, rotateY }}
            className="relative w-[min(340px,80vw)] [transform-style:preserve-3d]"
          >
            <div aria-hidden="true" className="blob-back absolute inset-0 translate-x-4 translate-y-3 -rotate-6 blur-[2px]" />
            <div className="blob-shape shadow-soft relative aspect-[1/1.1] overflow-hidden bg-lilac-soft">
              <Image
                src={site.assets.profileImage}
                alt={hero.profileAlt}
                fill
                priority
                sizes="(max-width: 640px) 80vw, 340px"
                className="object-cover object-top"
              />
            </div>
            {hero.pills.map((pill, index) => (
              <motion.span
                key={pill}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: [0, -8, 0] }}
                transition={{
                  opacity: { delay: 0.6 + index * 0.15 },
                  y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ z: PILL_DEPTH_PX }}
                className={`absolute z-10 border border-white/30 bg-navy/85 backdrop-blur-md shadow-soft rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap ${PILL_POSITIONS[index] ?? ""}`}
              >
                {pill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
