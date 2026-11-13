"use client";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage, content, site } = useLanguage();

  return (
    <div role="group" aria-label={content.language.label} className="glass flex rounded-full p-1">
      {site.languages.map((option) => {
        const active = option === language;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={content.language.names[option]}
            onClick={() => setLanguage(option)}
            className={`min-h-11 min-w-11 rounded-full px-3 text-sm font-bold transition-colors ${
              active ? "bg-lilac text-navy" : "text-hero-ink hover:bg-white/10"
            }`}
          >
            {content.language.options[option]}
          </button>
        );
      })}
    </div>
  );
}
