"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LinkBuilder } from "@/lib/LinkBuilder";
import { Icon } from "@/components/ui/Icon";
import { SparkleBurst, useSparkles } from "@/components/ui/SparkleBurst";
import { SECTION_IDS } from "@/config/sections";
import { LanguageSwitcher } from "./LanguageSwitcher";

const SCROLL_THRESHOLD = 24;

export function Header() {
  const { content, site } = useLanguage();
  const links = new LinkBuilder(site);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { bursts, trigger } = useSparkles();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-hero/90 shadow-soft backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href={links.section(SECTION_IDS.hero)} className="font-display text-2xl italic text-hero-ink">
          {site.person.shortName}
        </a>

        <nav aria-label={content.nav.label} className="glass hidden items-center gap-1 rounded-full p-1.5 lg:flex">
          {content.nav.items.map((item) => (
            <a
              key={item.id}
              href={links.section(item.id)}
              onClick={trigger}
              className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-hero-ink transition-colors hover:bg-white/10"
            >
              {item.label}
            </a>
          ))}
          <a
            href={links.section(content.nav.cta.id)}
            onClick={trigger}
            className="inline-flex min-h-11 items-center rounded-full bg-lilac px-5 font-bold text-navy transition-transform hover:scale-105"
          >
            {content.nav.cta.label}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? content.nav.closeMenu : content.nav.openMenu}
            onClick={(event) => {
              trigger(event);
              setOpen((value) => !value);
            }}
            className="glass inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-hero-ink lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-menu"
            aria-label={content.nav.label}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-6">
              {[...content.nav.items, content.nav.cta].map((item) => (
                <a
                  key={item.id}
                  href={links.section(item.id)}
                  onClick={(event) => {
                    trigger(event);
                    close();
                  }}
                  className="flex min-h-12 items-center rounded-2xl px-4 text-lg font-medium text-hero-ink hover:bg-white/10"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
      <SparkleBurst bursts={bursts} />
    </header>
  );
}
