"use client";

import { useTransition } from "react";

import { setLocale } from "@/app/actions/locale";

import { useLocale, useT } from "./I18nProvider";

/** Language menu; the choice is kept in a cookie. */
export function LanguageSwitcher({ locales, className = "" }: { locales: { code: string; name: string }[]; className?: string }) {
  const t = useT();
  const { locale } = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">{t("Language")}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => startTransition(() => setLocale(event.target.value))}
        className="max-w-36 cursor-pointer rounded-full border-0 bg-transparent py-1 ps-1 pe-2 text-[15px] font-medium"
      >
        {locales.map((option) => (
          <option key={option.code} value={option.code} className="bg-menu text-stone-900">
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
