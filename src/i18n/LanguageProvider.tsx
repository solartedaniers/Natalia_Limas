"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ContentRepository } from "@/lib/ContentRepository";
import { LanguagePreference } from "@/lib/LanguagePreference";
import type { Language, PageContent, SiteConfig } from "@/types/content";

interface LanguageContextValue {
  language: Language;
  content: PageContent;
  site: SiteConfig;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(ContentRepository.site().defaultLanguage);

  useEffect(() => {
    setLanguageState(LanguagePreference.resolve());
  }, []);

  useEffect(() => {
    const content = ContentRepository.page(language);
    document.documentElement.lang = language;
    document.title = content.meta.title;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    LanguagePreference.save(next);
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({
      language,
      content: ContentRepository.page(language),
      site: ContentRepository.site(),
      setLanguage,
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
