import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/500-italic.css";
import "@fontsource/playfair-display/600.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ContentRepository } from "@/lib/ContentRepository";
import "./globals.css";

const site = ContentRepository.site();
const defaultPage = ContentRepository.page(site.defaultLanguage);

export const metadata: Metadata = {
  title: defaultPage.meta.title,
  description: defaultPage.meta.description,
  icons: { icon: site.assets.favicon },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={site.defaultLanguage}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
