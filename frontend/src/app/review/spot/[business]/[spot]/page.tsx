import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ReviewForm } from "@/components/tips/ReviewForm";
import { RecipientHeader, TipPageShell, TipPageSkeleton } from "@/components/tips/TipPageShell";
import { getSpot } from "@/lib/public";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Leave a review" };

/** /review/spot/{business id}/{spot}: review page of a spot (table, bar). */
export default function Page({ params }: PageProps<"/review/spot/[business]/[spot]">) {
  return (
    <Suspense fallback={<TipPageSkeleton />}>
      <SpotReviewPage params={params} />
    </Suspense>
  );
}

async function SpotReviewPage({ params }: { params: Promise<{ business: string; spot: string }> }) {
  const { business, spot: spotSlug } = await params;
  const spot = await getSpot(business, spotSlug, "review");
  const { t } = await getI18n();

  if (!spot) {
    notFound();
  }

  const tipHref = `/paytips/spot/${spot.business.id}/${spot.slug}`;
  if (spot.page.mode === "tip") {
    redirect(tipHref);
  }
  const next = spot.page.mode === "review" || !spot.can_receive_tips ? "/paytips/thanks-review" : tipHref;

  return (
    <TipPageShell page={spot.page}>
      <RecipientHeader page={spot.page} name={spot.business.name} avatar={spot.business.avatar} bio={spot.name} heading={spot.page.header ?? t("How did you like our service ?")} />
      <ReviewForm target={{ kind: "spot", businessId: spot.business.id, spotSlug: spot.slug }} page={spot.page} nextHref={next} />
    </TipPageShell>
  );
}
