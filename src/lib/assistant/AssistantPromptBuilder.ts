import { ContentRepository } from "@/lib/ContentRepository";
import { LinkBuilder } from "@/lib/LinkBuilder";
import { SECTION_IDS } from "@/config/sections";
import type { AssistantConfig, Language, PageContent, SiteConfig } from "@/types/content";

// Arma las instrucciones del sistema con el contenido vivo de la página:
// si cambian es.json, en.json o site.json, el asistente lo sabe sin tocar código
export class AssistantPromptBuilder {
  private readonly page: PageContent;
  private readonly site: SiteConfig;
  private readonly config: AssistantConfig;

  constructor(private readonly language: Language) {
    this.page = ContentRepository.page(language);
    this.site = ContentRepository.site();
    this.config = ContentRepository.assistant();
  }

  build(): string {
    return [
      this.config.persona,
      `Answer language: ${this.page.language.names[this.language]}.`,
      this.section("Rules", this.config.rules),
      this.section("Profile", this.profile()),
      this.section("Experience", this.experience()),
      this.section("Education and credentials", this.credentials()),
      this.section("CV", this.cv()),
      this.section("Contact", this.contact()),
      this.section("Additional facts", this.config.extraFacts),
    ].join("\n\n");
  }

  private section(title: string, lines: string[]): string {
    return `## ${title}\n${lines.map((line) => `- ${line}`).join("\n")}`;
  }

  private profile(): string[] {
    const { hero, about, footer } = this.page;
    return [
      `Full name: ${this.site.person.fullName}.`,
      `Headline: ${hero.eyebrow}.`,
      hero.description,
      about.statementParts.map((part) => part.text).join(""),
      ...about.areas.map((area) => `${area.title}: ${area.text}`),
      `Location: ${footer.location}.`,
    ];
  }

  private experience(): string[] {
    return this.page.experience.items.map((item) => `${item.period} · ${item.role} · ${item.company}: ${item.description}`);
  }

  private credentials(): string[] {
    const { items, view } = this.page.credentials;
    return items.map((item) => {
      const document = ContentRepository.documentFor(item.id) ? ` (supporting document available on the page: "${view}")` : "";
      return `${item.title} · ${item.detail}${document}`;
    });
  }

  private cv(): string[] {
    const { cv, nav } = this.page;
    const section = nav.items.find((item) => item.id === SECTION_IDS.cv)?.label ?? cv.titleAccent;
    if (!ContentRepository.cvFor(this.language)) return [cv.pending];
    return [`Her CV can be downloaded or viewed online in the "${section}" section of the page ("${cv.download}" / "${cv.viewOnline}").`];
  }

  private contact(): string[] {
    const { contact } = this.page;
    const links = new LinkBuilder(this.site);
    const linkedin = links.linkedin();
    return [
      contact.description,
      `Email: ${this.site.contact.email}.`,
      `WhatsApp: +${this.site.contact.whatsappNumber}.`,
      linkedin ? `LinkedIn: ${linkedin}.` : `LinkedIn: ${contact.linkedinPending}.`,
      `There is also a contact form in the "${contact.form.title}" area of the page.`,
    ];
  }
}
