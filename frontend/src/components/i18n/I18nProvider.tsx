"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

import { type Dictionary, type Translate, makeTranslate } from "@/lib/i18n-shared";

const I18nContext = createContext<{ locale: string; dir: "ltr" | "rtl"; t: Translate }>({ locale: "en", dir: "ltr", t: makeTranslate({}) });

/**
 * Makes the visitor's language available to client components (useT) and
 * marks the page with its language and writing direction.
 */
export function I18nProvider({ locale, dir, texts, children }: { locale: string; dir: "ltr" | "rtl"; texts: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dir, t: makeTranslate(texts) }), [locale, dir, texts]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <I18nContext value={value}>
      <div lang={locale} dir={dir} className="contents">
        {children}
      </div>
    </I18nContext>
  );
}

export function useT(): Translate {
  return useContext(I18nContext).t;
}

export function useLocale(): { locale: string; dir: "ltr" | "rtl" } {
  const { locale, dir } = useContext(I18nContext);
  return { locale, dir };
}
