export type Language = "es" | "en";

export type Tone = "sky" | "lilac";

export type IconName = "pulse" | "shield" | "people" | "whatsapp" | "linkedin" | "mail" | "document" | "arrow" | "menu" | "close";

export interface NavItem {
  id: string;
  label: string;
}

export interface StatementPart {
  text: string;
  style: "plain" | "highlight" | "accent";
}

export interface AboutArea {
  icon: IconName;
  tone: Tone;
  title: string;
  text: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  description: string;
  tone: Tone;
}

export interface CredentialItem {
  id: string;
  title: string;
  detail: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface ContactFormCopy {
  title: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  errors: { name: string; email: string; message: string };
  subject: string;
}

export interface PageContent {
  meta: { title: string; description: string };
  nav: { label: string; items: NavItem[]; cta: NavItem; openMenu: string; closeMenu: string };
  language: { label: string; options: Record<Language, string>; names: Record<Language, string> };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleAccentOne: string;
    titleMiddle: string;
    titleAccentTwo: string;
    titleEnd: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    profileAlt: string;
    pills: string[];
  };
  about: { statementParts: StatementPart[]; areas: AboutArea[] };
  experience: { titleStart: string; titleAccent: string; items: ExperienceItem[] };
  credentials: {
    titleStart: string;
    titleAccent: string;
    previewTitle: string;
    previewHint: string;
    view: string;
    pending: string;
    items: CredentialItem[];
  };
  cv: {
    titleStart: string;
    titleAccent: string;
    description: string;
    download: string;
    viewOnline: string;
    previewAlt: string;
    pending: string;
  };
  testimonials: { label: string; goTo: string; items: Testimonial[] };
  contact: {
    titleStart: string;
    titleAccent: string;
    titleEnd: string;
    description: string;
    whatsapp: string;
    linkedin: string;
    linkedinPending: string;
    whatsappMessage: string;
    form: ContactFormCopy;
  };
  footer: { copyright: string; location: string };
}

export interface CvDocument {
  file: string;
  preview: string;
}

export interface SiteConfig {
  person: { fullName: string; shortName: string; initials: string };
  assets: { profileImage: string; favicon: string };
  contact: { email: string; whatsappNumber: string; linkedinUrl: string; formEndpoint: string };
  links: { whatsappBase: string; mailtoPrefix: string };
  documents: Record<string, string>;
  credentialImages: Record<string, string>;
  cv: Record<Language, CvDocument>;
  testimonialRotationMs: number;
  languages: Language[];
  defaultLanguage: Language;
}
