import { getLocales } from "@/lib/i18n";

import { LanguageSwitcher } from "./LanguageSwitcher";

/** Language switcher with the list of languages from the API. */
export async function LanguageMenu({ className }: { className?: string }) {
  const locales = await getLocales().catch(() => []);
  if (locales.length === 0) {
    return null;
  }
  return <LanguageSwitcher locales={locales.map(({ code, name }) => ({ code, name }))} className={className} />;
}
