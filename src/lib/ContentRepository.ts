import es from "@/content/es.json";
import en from "@/content/en.json";
import site from "@/content/site.json";
import type { CvDocument, Language, PageContent, SiteConfig } from "@/types/content";

// Único punto de acceso al contenido: los componentes nunca importan los JSON directamente
export class ContentRepository {
  private static readonly pages: Record<Language, PageContent> = {
    es: es as PageContent,
    en: en as PageContent,
  };

  private static readonly config: SiteConfig = site as SiteConfig;

  static page(language: Language): PageContent {
    return this.pages[language] ?? this.pages[this.config.defaultLanguage];
  }

  static site(): SiteConfig {
    return this.config;
  }

  static isSupported(value: unknown): value is Language {
    return typeof value === "string" && this.config.languages.includes(value as Language);
  }

  static documentFor(credentialId: string): string | null {
    const file = this.config.documents[credentialId];
    return file ? file : null;
  }

  static cvFor(language: Language): CvDocument | null {
    const cv = this.config.cv[language];
    return cv?.file ? cv : null;
  }
}
