"use client";
import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ContactService, type ContactFieldErrors, type ContactMessage } from "@/services/ContactService";

type Status = "idle" | "sending" | "success" | "error";

const EMPTY_MESSAGE: ContactMessage = { name: "", email: "", message: "" };
const STATUS_RESET_MS = 6000;

const inputClass =
  "w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder:text-hero-muted/70 outline-none transition focus:border-lilac focus:bg-white/15";

export function ContactForm() {
  const { content, site } = useLanguage();
  const copy = content.contact.form;
  const service = useMemo(() => new ContactService(site.contact.formEndpoint), [site.contact.formEndpoint]);
  const [values, setValues] = useState<ContactMessage>(EMPTY_MESSAGE);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = (field: keyof ContactMessage) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const found = service.validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    const sent = await service.send(values, copy.subject);
    setStatus(sent ? "success" : "error");
    if (sent) setValues(EMPTY_MESSAGE);
    setTimeout(() => setStatus("idle"), STATUS_RESET_MS);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="glass flex w-full flex-col gap-4 rounded-[32px] p-6 text-left sm:p-8">
      <h3 className="font-display text-2xl">{copy.title}</h3>

      <label htmlFor="contact-name" className="text-sm font-semibold text-hero-muted">
        {copy.name}
      </label>
      <input id="contact-name" type="text" autoComplete="name" value={values.name} onChange={update("name")} placeholder={copy.namePlaceholder} aria-invalid={Boolean(errors.name)} className={inputClass} />
      {errors.name ? <p className="text-sm text-lilac">{copy.errors.name}</p> : null}

      <label htmlFor="contact-email" className="text-sm font-semibold text-hero-muted">
        {copy.email}
      </label>
      <input id="contact-email" type="email" autoComplete="email" value={values.email} onChange={update("email")} placeholder={copy.emailPlaceholder} aria-invalid={Boolean(errors.email)} className={inputClass} />
      {errors.email ? <p className="text-sm text-lilac">{copy.errors.email}</p> : null}

      <label htmlFor="contact-message" className="text-sm font-semibold text-hero-muted">
        {copy.message}
      </label>
      <textarea id="contact-message" rows={4} value={values.message} onChange={update("message")} placeholder={copy.messagePlaceholder} aria-invalid={Boolean(errors.message)} className={inputClass} />
      {errors.message ? <p className="text-sm text-lilac">{copy.errors.message}</p> : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 inline-flex min-h-13 items-center justify-center rounded-full bg-lilac px-7 font-bold text-navy transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "sending" ? copy.sending : copy.submit}
      </button>

      <p role="status" aria-live="polite" className="min-h-6 text-sm text-sky">
        {status === "success" ? copy.success : status === "error" ? copy.error : ""}
      </p>
    </form>
  );
}
