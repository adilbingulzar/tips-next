import type { Metadata } from "next";
import { Suspense } from "react";

import { TranslationRow } from "@/components/admin/AdminForms";
import { EmptyState, PageHeader, Pagination, plainQuery } from "@/components/app/ui";
import type { AdminTranslationList } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";

export const metadata: Metadata = { title: "App Translation" };

export default function Page({ searchParams }: PageProps<"/admin/translations">) {
  return (
    <>
      <PageHeader title="App Translation" description="Every English text of the site, with its translation. Empty translations show the English text." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Translations searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Translations({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "locale", "q", "missing"]);
  const rows = await api<AdminTranslationList>("/admin/translations", { token: await requireToken(), query });
  const languageName = (code: string) => new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;

  return (
    <>
      <form method="get" className="mb-6 flex flex-wrap items-end gap-2">
        <select name="locale" defaultValue={rows.meta.locale} aria-label="Language" className="input w-auto">
          {rows.meta.locales
            .filter((locale) => locale !== "en")
            .map((locale) => (
              <option key={locale} value={locale}>
                {languageName(locale)} ({locale})
              </option>
            ))}
        </select>
        <input name="q" defaultValue={query.q ?? ""} placeholder="Search text" aria-label="Search" className="input max-w-xs" />
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input type="checkbox" name="missing" value="1" defaultChecked={query.missing === "1"} className="h-4 w-4 accent-orange-500" />
          Only missing
        </label>
        <button type="submit" className="btn btn-outline">
          Show
        </button>
      </form>
      {rows.data.length === 0 ? (
        <EmptyState>No texts found.</EmptyState>
      ) : (
        <div className="card">
          <div className="hidden grid-cols-2 gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold tracking-wide text-stone-500 uppercase md:grid">
            <span>English</span>
            <span>{languageName(rows.meta.locale)}</span>
          </div>
          {rows.data.map((row) => (
            <TranslationRow key={`${rows.meta.locale}-${row.key}`} locale={rows.meta.locale} translationKey={row.key} source={row.source} text={row.text} />
          ))}
        </div>
      )}
      <Pagination page={rows.meta.current_page} lastPage={rows.meta.last_page} basePath="/admin/translations" query={query} />
    </>
  );
}
