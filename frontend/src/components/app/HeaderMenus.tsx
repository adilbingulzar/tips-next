"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { logout } from "@/app/actions/auth";
import { setLocale } from "@/app/actions/locale";
import { useLocale, useT } from "@/components/i18n/I18nProvider";
import type { UserNotification } from "@/lib/types";

import { NavGlyph } from "./NavIcons";

/** Closes a dropdown when the visitor clicks elsewhere or presses Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** The language in the bar: the current language and a caret; opens a searchable list. */
export function LanguagePill({ locales }: { locales: { code: string; name: string }[] }) {
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const ref = useDismiss(open, () => setOpen(false));
  const shown = locales.filter((option) => `${option.name} ${option.code}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("Language")}
        className="pz-bar-btn"
      >
        <NavGlyph name="globe" className="h-[18px] w-[18px]" />
        <span className="pz-bar-label">{locales.find((option) => option.code === locale)?.name ?? locale.toUpperCase()}</span>
        <span className="pz-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="menu-panel w-64">
          <div className="pb-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search")} aria-label={t("Search")} className="input min-h-10" autoFocus />
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {shown.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setOpen(false);
                    startTransition(() => setLocale(option.code));
                  }}
                  className={`menu-item justify-between ${option.code === locale ? "menu-item-active" : ""}`}
                >
                  {option.name}
                  <span className="text-xs text-stone-400 uppercase">{option.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** The bell with the latest notifications, as in the old app's top bar. */
export function NotificationBell({ unread, latest }: { unread: number; latest: UserNotification[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread > 0 ? t("Notifications, {count} unread", { count: unread }) : t("Latest Notifications")}
        className="pz-bell"
      >
        <NavGlyph name="bell" className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
      {open && (
        <div className="menu-panel w-80 max-w-[calc(100vw-2rem)] p-0">
          <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
            <NavGlyph name="bell" className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-stone-900">{t("Latest Notifications")}</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {latest.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-400">{t("No more notifications")}</p>
            ) : (
              latest.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link?.startsWith("/dashboard") ? notification.link : "/dashboard/notifications"}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 border-b border-stone-100 px-4 py-3 transition-colors last:border-0 hover:bg-stone-50"
                >
                  <NavGlyph name="bell" className="mt-0.5 h-5 w-6 shrink-0 text-orange-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-900">{t(notification.title)}</p>
                    <p className="text-sm text-stone-500">{t(notification.message)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                      <NavGlyph name="clock" className="h-3 w-3" />
                      {new Date(notification.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-stone-100 p-2">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="btn btn-outline btn-sm btn-block">
              {t("View all")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** The account chip: initial, name and a caret; opens Profile, Account and Logout. */
export function UserMenu({ name }: { name: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="true" aria-label={t("Account")} className="pz-bar-btn">
        <span className="pz-avatar" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="pz-bar-label max-w-40 truncate">{name}</span>
        <span className="pz-caret max-sm:hidden" aria-hidden="true" />
      </button>
      {open && (
        <div className="menu-panel">
          <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="menu-item">
            <NavGlyph name="user" />
            {t("Profile")}
          </Link>
          <Link href="/dashboard/account" onClick={() => setOpen(false)} className="menu-item">
            <NavGlyph name="badge" />
            {t("Account")}
          </Link>
          <div className="my-2 border-t border-stone-200" />
          <form action={logout}>
            <button type="submit" className="menu-item">
              <NavGlyph name="logout" />
              {t("Logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
