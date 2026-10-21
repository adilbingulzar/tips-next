import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Avatar } from "@/components/tips/Avatar";
import { ApiError, api } from "@/lib/api";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Reviews", robots: { index: false } };

type Widget = {
  data: {
    business: { name: string; address: string | null; logo: string | null; review_url: string | null };
    rating: { average: number; count: number };
    theme: "light" | "dark";
    reviews: { id: number; rating: number | null; review: string; name: string | null; date: string | null }[];
  };
  meta: { current_page: number; last_page: number; total: number };
};

/**
 * The review widget businesses put on their own website in an iframe (same
 * address as in the old app). Plain page: no menus, no cookies needed.
 */
export default function Page({ params, searchParams }: PageProps<"/widgets/review/[business]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <ReviewWidget params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReviewWidget({ params, searchParams }: { params: Promise<{ business: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { business } = await params;
  const page = Number((await searchParams).page ?? 1) || 1;
  if (!/^\d+$/.test(business)) {
    notFound();
  }

  const widget = await api<Widget>(`/public/widgets/review/${business}`, { query: { page } }).catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });
  const { t, locale } = await getI18n();
  const { data, meta } = widget;
  const dark = data.theme === "dark";
  const muted = dark ? "text-stone-400" : "text-stone-500";

  return (
    <main data-theme="light" className={`min-h-dvh p-4 ${dark ? "bg-stone-900 text-white" : "bg-white text-stone-900"}`}>
      <header className="flex items-center gap-3">
        <div className="[&_.tip-avatar]:h-14 [&_.tip-avatar]:w-14 [&_.tip-avatar]:border-2 [&_.tip-avatar]:text-lg">
          <Avatar name={data.business.name} src={data.business.logo} />
        </div>
        <div className="min-w-0">
          <h1 className={`truncate text-lg ${dark ? "text-white" : ""}`}>{data.business.name}</h1>
          {data.business.address && <p className={`truncate text-xs ${muted}`}>{data.business.address}</p>}
          {data.rating.count > 0 && (
            <p className="text-sm">
              <span className="text-amber-400" aria-hidden="true">
                {"★".repeat(Math.round(data.rating.average))}
              </span>{" "}
              <span className="font-bold">{data.rating.average.toFixed(1)}</span> <span className={muted}>{t("({count} ratings)", { count: data.rating.count })}</span>
            </p>
          )}
        </div>
      </header>

      {data.reviews.length === 0 ? (
        <p className={`mt-6 text-sm ${muted}`}>{t("No reviews yet.")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.reviews.map((review) => (
            <li key={review.id} className={`rounded-2xl border p-4 ${dark ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-stone-50"}`}>
              {review.rating !== null && (
                <p className="text-amber-400" aria-label={t("{rating} out of 5 stars", { rating: review.rating })}>
                  {"★".repeat(review.rating)}
                  <span className={dark ? "text-stone-600" : "text-stone-300"}>{"★".repeat(5 - review.rating)}</span>
                </p>
              )}
              <p dir="auto" className="mt-1 text-sm break-words whitespace-pre-line">
                {review.review}
              </p>
              <p className={`mt-2 text-xs ${muted}`}>
                {review.name ?? t("A customer")}
                {review.date ? ` · ${new Date(`${review.date}T12:00:00Z`).toLocaleDateString(locale, { dateStyle: "medium" })}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <nav className="mt-4 flex items-center justify-between gap-3 text-sm">
        {page > 1 ? (
          <a href={`?page=${page - 1}`} className="font-semibold text-orange-500 hover:underline">
            ← {t("Newer reviews")}
          </a>
        ) : (
          <span />
        )}
        {page < meta.last_page && (
          <a href={`?page=${page + 1}`} className="font-semibold text-orange-500 hover:underline">
            {t("Older reviews")} →
          </a>
        )}
      </nav>

      {data.business.review_url && (
        <a href={data.business.review_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-pill btn-block mt-4">
          {t("Write a review")}
        </a>
      )}
    </main>
  );
}
