"use client";

import { useT } from "@/components/i18n/I18nProvider";

import { THEME_COOKIE } from "./ThemeScript";

/**
 * The light / dark switch. The knob (sun or moon) is drawn by the stylesheet from
 * <html data-theme>, so the switch is right before the page has loaded its scripts.
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const t = useT();

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }

  return (
    <button type="button" onClick={toggle} className={`theme-switch ${className}`} aria-label={t("Switch between light and dark")}>
      <span className="theme-switch-track" aria-hidden="true" />
      <span className="pz-bar-label">
        <span className="theme-word-light">{t("Light")}</span>
        <span className="theme-word-dark">{t("Dark")}</span>
      </span>
    </button>
  );
}
