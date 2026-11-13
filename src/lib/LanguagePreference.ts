import type { Language } from "@/types/content";
import { ContentRepository } from "./ContentRepository";

const STORAGE_KEY = "portfolio-language";

// Recuerda la elección del visitante; si no hay, usa el idioma del navegador
export class LanguagePreference {
  static resolve(): Language {
    const stored = this.read();
    if (ContentRepository.isSupported(stored)) return stored;

    const browser = navigator.language?.slice(0, 2);
    if (ContentRepository.isSupported(browser)) return browser;

    return ContentRepository.site().defaultLanguage;
  }

  static save(language: Language): void {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }

  private static read(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
