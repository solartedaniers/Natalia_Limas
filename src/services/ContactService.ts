export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type ContactFieldErrors = Partial<Record<keyof ContactMessage, true>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

export class ContactService {
  constructor(private readonly endpoint: string) {}

  validate(input: ContactMessage): ContactFieldErrors {
    const errors: ContactFieldErrors = {};
    if (!input.name.trim()) errors.name = true;
    if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = true;
    if (input.message.trim().length < MIN_MESSAGE_LENGTH) errors.message = true;
    return errors;
  }

  async send(input: ContactMessage, subject: string): Promise<boolean> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...input, _subject: subject, _template: "table" }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
