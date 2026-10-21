import type { ReactNode } from "react";

import { LanguageMenu } from "@/components/i18n/LanguageMenu";
import { getI18n } from "@/lib/i18n";
import type { TipPage } from "@/lib/types";

import { Avatar } from "./Avatar";
import { pageStyle, panelStyle, textStyle } from "./branding";

/** "itsmycontactinfo.com": the site's own address, as the old footer showed it. */
function siteName(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "").hostname.replace(/^www\./, "");
  } catch {
    return process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";
  }
}

/** Full-page frame of a public tip or review page, with the user's branding and a language menu. */
export async function TipPageShell({ page, children }: { page: TipPage; children: ReactNode }) {
  const { t } = await getI18n();
  return (
    <div data-theme="light" className="tip-page" style={pageStyle(page)}>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl motion-safe:animate-fade-up">
          <section className="tip-panel" style={panelStyle(page)}>
            <div className="px-6 py-10 sm:px-10" style={textStyle(page)}>
              {children}
            </div>
          </section>
        </div>
      </main>
      <footer className="tip-footer flex flex-wrap items-center justify-center gap-4 text-stone-600">
        <span>
          {siteName()} © {t("All rights reserved.")}
        </span>
        <LanguageMenu className="text-xs text-stone-500" />
      </footer>
    </div>
  );
}

export function RecipientHeader({ page, name, avatar, bio, heading }: { page: TipPage; name: string; avatar: string | null; bio?: string | null; heading: ReactNode }) {
  return (
    <header className="text-center">
      <h1 className="text-xl" style={textStyle(page)}>
        {heading}
      </h1>
      <div className="mt-6">
        <Avatar name={name} src={avatar} />
      </div>
      <p className="mt-4 font-display text-lg font-extrabold" style={textStyle(page)}>
        {name}
      </p>
      {bio && (
        <blockquote dir="auto" className="mx-auto mt-2 max-w-sm text-sm italic opacity-80">
          “{bio}”
        </blockquote>
      )}
    </header>
  );
}

export function TipPageSkeleton() {
  return (
    <div data-theme="light" className="tip-page">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="tip-panel w-full max-w-xl px-6 py-10" aria-busy="true">
          <div className="mx-auto h-6 w-48 animate-pulse rounded-full bg-stone-200" />
          <div className="mx-auto mt-6 h-24 w-24 animate-pulse rounded-full bg-stone-200" />
          <div className="mx-auto mt-4 h-5 w-32 animate-pulse rounded-full bg-stone-200" />
          <div className="mx-auto mt-10 h-12 w-64 animate-pulse rounded-full bg-stone-200" />
        </div>
      </main>
    </div>
  );
}

export async function TipsUnavailable({ page }: { page: TipPage }) {
  const { t } = await getI18n();
  return (
    <p className="alert alert-info mt-8 justify-center text-center" style={textStyle(page)}>
      {t("Tips can’t be received here right now. You can still leave a review.")}
    </p>
  );
}
