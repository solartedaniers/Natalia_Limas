import type { SiteConfig } from "@/types/content";

export class LinkBuilder {
  constructor(private readonly site: SiteConfig) {}

  whatsapp(message: string): string {
    const { whatsappBase } = this.site.links;
    return `${whatsappBase}${this.site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  email(): string {
    return `${this.site.links.mailtoPrefix}${this.site.contact.email}`;
  }

  linkedin(): string | null {
    return this.site.contact.linkedinUrl || null;
  }

  section(id: string): string {
    return `#${id}`;
  }
}
