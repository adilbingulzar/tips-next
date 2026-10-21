import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/brand/Logo";
import { api } from "@/lib/api";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Terms and conditions" };

/** The terms people accept when signing up. The API returns them already cleaned of anything but simple formatting. */
export default async function Page() {
  const { t } = await getI18n();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";

  return (
    <main className="min-h-dvh bg-stone-50 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm sm:p-10">
        <Link href="/" aria-label={appName}>
          <Logo alt={appName} width={108} height={36} className="h-9 w-auto" />
        </Link>
        <h1 className="mt-8 text-3xl">{t("Terms and conditions")}</h1>
        <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-stone-100" aria-busy="true" />}>
          <Terms />
        </Suspense>
      </article>
    </main>
  );
}

async function Terms() {
  const { data } = await api<{ data: { html: string; updated_at: string | null } }>("/public/terms");

  if (data.html === "") {
    const { t } = await getI18n();
    return <p className="mt-6 text-stone-500">{t("The terms are not available right now. Please try again later.")}</p>;
  }

  return (
    <div
      className="mt-6 space-y-4 text-stone-700 [&_a]:font-semibold [&_a]:text-orange-600 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:text-lg [&_li]:ms-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:space-y-1"
      // Sanitised by the API (App\Actions\Content\SanitizeHtml): only simple formatting tags, no attributes but safe links.
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}
