import { getI18n } from "@/lib/i18n";

import { I18nProvider } from "./I18nProvider";

/** Reads the visitor's language once per request and hands it to the page. */
export async function LocaleRoot({ children }: { children: React.ReactNode }) {
  const { locale, dir, texts } = await getI18n();

  return (
    <I18nProvider locale={locale} dir={dir} texts={texts}>
      {children}
    </I18nProvider>
  );
}
