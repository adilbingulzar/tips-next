import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { pinReview } from "@/app/actions/business";
import { ActionButton } from "@/components/app/ActionButton";
import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import type { MyReview, Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Reviews" };

type ReviewList = Paginated<MyReview> & { meta: { is_business: boolean } };

export default function Page({ searchParams }: PageProps<"/dashboard/reviews">) {
  return (
    <>
      <PageHeader title="Reviews" description="Manage ratings and reviews" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Reviews searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Reviews({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireVerifiedUser();
  const query = plainQuery(await searchParams, ["page", "rating", "source"]);
  const { t } = await getI18n();
  const reviews = await api<ReviewList>("/me/reviews", { token: await requireToken(), query });
  const filterLink = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams({ ...query, ...Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== null)) } as Record<string, string>);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        next.delete(key);
      }
    }
    next.delete("page");
    const search = next.toString();
    return search ? `/dashboard/reviews?${search}` : "/dashboard/reviews";
  };
  const chip = (active: boolean) => `rounded-full border px-3 py-1.5 text-sm font-bold ${active ? "border-orange-500 bg-orange-50 text-orange-700" : "border-stone-200 bg-surface text-stone-600 hover:border-stone-300"}`;

  return (
    <>
      <p className="mb-3 text-sm text-stone-500">{t("Pinned reviews are shown on your tip page and business card.")}</p>
      <nav aria-label={t("Filter reviews")} className="mb-6 flex flex-wrap gap-2">
        <Link href={filterLink({ rating: null })} className={chip(!query.rating)}>
          {t("All stars")}
        </Link>
        {[5, 4, 3, 2, 1].map((stars) => (
          <Link key={stars} href={filterLink({ rating: String(stars) })} className={chip(query.rating === String(stars))}>
            {stars} ★
          </Link>
        ))}
        {reviews.meta.is_business && (
          <>
            <span className="mx-1 hidden w-px bg-stone-200 sm:block" aria-hidden="true" />
            <Link href={filterLink({ source: null })} className={chip(!query.source)}>
              {t("Everyone")}
            </Link>
            <Link href={filterLink({ source: "person" })} className={chip(query.source === "person")}>
              {t("Team members")}
            </Link>
            <Link href={filterLink({ source: "spot" })} className={chip(query.source === "spot")}>
              {t("Spots")}
            </Link>
          </>
        )}
      </nav>

      {reviews.data.length === 0 ? (
        <EmptyState>Sorry, no reviews found.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.data.map((review) => (
            <li key={review.id} className={`card p-5 ${review.is_pinned ? "border-orange-300 ring-2 ring-orange-100" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {review.rating !== null && (
                    <p className="text-amber-500" aria-label={t("{rating} out of 5 stars", { rating: review.rating })}>
                      {"★".repeat(review.rating)}
                      <span className="text-stone-300">{"★".repeat(5 - review.rating)}</span>
                    </p>
                  )}
                  <p className="mt-1 break-words whitespace-pre-line text-stone-800">{review.review}</p>
                  <p className="mt-2 text-xs text-stone-500">
                    {review.name ?? t("A customer")}
                    {review.email ? ` · ${review.email}` : ""} · {dateTime(review.created_at)}
                    {reviews.meta.is_business && (review.spot ? ` · ${t("Spot: {name}", { name: review.spot })}` : review.recipient ? ` · ${t("For {name}", { name: review.recipient })}` : "")}
                  </p>
                </div>
                <ActionButton action={pinReview.bind(null, review.id, !review.is_pinned)} className={review.is_pinned ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} pendingText="…">
                  {review.is_pinned ? "Pinned" : "Pin"}
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={reviews.meta.current_page} lastPage={reviews.meta.last_page} basePath="/dashboard/reviews" query={query} />
    </>
  );
}
