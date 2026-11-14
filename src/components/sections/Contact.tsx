"use client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LinkBuilder } from "@/lib/LinkBuilder";
import { AccentTitle } from "@/components/ui/AccentTitle";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_IDS } from "@/config/sections";
import { ContactForm } from "./ContactForm";

const pillBase = "inline-flex min-h-14 items-center gap-2.5 rounded-full px-7 font-bold transition-transform hover:-translate-y-0.5";

export function Contact() {
  const { content, site } = useLanguage();
  const contact = content.contact;
  const links = new LinkBuilder(site);
  const linkedin = links.linkedin();

  return (
    <section id={SECTION_IDS.contact} className="bg-glow rounded-t-[40px] text-hero-ink sm:rounded-t-[64px]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-14 px-5 py-28 sm:px-8">
        <Reveal className="flex min-w-0 flex-[999_1_460px] flex-col gap-7">
          <AccentTitle
            start={contact.titleStart}
            accent={contact.titleAccent}
            end={contact.titleEnd}
            accentClassName="text-lilac"
            className="text-[clamp(2.6rem,6vw,5.25rem)]"
          />
          <p className="max-w-xl text-lg leading-relaxed text-hero-muted">{contact.description}</p>
          <div className="flex flex-wrap gap-3.5">
            <a href={links.whatsapp(contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`${pillBase} bg-sky text-navy`}>
              <Icon name="whatsapp" size={20} />
              {contact.whatsapp}
            </a>
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className={`${pillBase} bg-lilac text-navy`}>
                <Icon name="linkedin" size={20} />
                {contact.linkedin}
              </a>
            ) : (
              <span aria-disabled="true" className={`${pillBase} cursor-default bg-lilac/60 text-navy hover:translate-y-0`}>
                <Icon name="linkedin" size={20} />
                {contact.linkedinPending}
              </span>
            )}
            <a href={links.email()} className={`${pillBase} glass text-hero-ink`}>
              <Icon name="mail" size={20} />
              {site.contact.email}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-[1_1_380px]">
          <ContactForm />
        </Reveal>
      </div>
      <footer className="border-t border-white/15">
        {/* Margen derecho libre para el robot del asistente; en pantallas anchas el robot ya queda fuera del contenido */}
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 py-8 pr-24 pl-5 text-sm text-sky sm:pr-36 sm:pl-8 min-[1392px]:pr-8">
          <span>{content.footer.copyright}</span>
          <span>{content.footer.location}</span>
        </div>
      </footer>
    </section>
  );
}
