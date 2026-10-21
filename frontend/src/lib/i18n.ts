import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { api } from "./api";
import { type Dictionary, LOCALE_COOKIE, type Translate, makeTranslate } from "./i18n-shared";

/**
 * Languages of the site. The visitor's choice is kept in a cookie; without
 * one, the browser's preferred language is used when the site has it.
 */

export type Locale = { code: string; name: string; dir: "ltr" | "rtl" };

export async function getLocales(): Promise<Locale[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("locales");
  const { data } = await api<{ data: Locale[] }>("/public/locales", { forwardVisitorIp: false });
  return data;
}

async function getDictionary(locale: string): Promise<{ dir: "ltr" | "rtl"; texts: Dictionary }> {
  "use cache";
  // Admin edits show up within a few minutes.
  cacheLife("minutes");
  cacheTag(`translations-${locale}`);
  if (locale === "en") {
    return { dir: "ltr", texts: {} };
  }
  const { data } = await api<{ data: { dir: "ltr" | "rtl"; texts: Dictionary } }>(`/public/translations/${encodeURIComponent(locale)}`, { forwardVisitorIp: false });
  return { dir: data.dir, texts: data.texts };
}

/** The visitor's language code. Reads the request, so callers must be inside <Suspense>. */
export const getLocale = cache(async (): Promise<string> => {
  const known = new Set((await getLocales()).map((locale) => locale.code));
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (chosen && known.has(chosen)) {
    return chosen;
  }

  const accepted = (await headers()).get("accept-language") ?? "";
  for (const part of accepted.split(",")) {
    const code = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (known.has(code)) {
      return code;
    }
    const base = code.split("-")[0] ?? "";
    if (known.has(base)) {
      return base;
    }
  }
  return "en";
});

export type I18n = { locale: string; dir: "ltr" | "rtl"; texts: Dictionary; t: Translate };

/** Translator for server components: `const { t } = await getI18n(); t("Hello {name}", { name })`. */
export const getI18n = cache(async (): Promise<I18n> => {
  const locale = await getLocale();
  try {
    const { dir, texts } = await getDictionary(locale);
    return { locale, dir, texts, t: makeTranslate(texts) };
  } catch (error) {
    // Without the API the site still works, in English.
    console.error(error);
    return { locale: "en", dir: "ltr", texts: {}, t: makeTranslate({}) };
  }
});
