import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { TipForm } from "@/components/tips/TipForm";
import { RecipientHeader, TipPageShell, TipPageSkeleton, TipsUnavailable } from "@/components/tips/TipPageShell";
import { getSpot } from "@/lib/public";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Leave a tip" };

/** /paytips/spot/{business id}/{spot}: tip page of a spot, as printed on its QR code. */
export default function Page({ params }: PageProps<"/paytips/spot/[business]/[spot]">) {
  return (
    <Suspense fallback={<TipPageSkeleton />}>
      <SpotTipPage params={params} />
    </Suspense>
  );
}

async function SpotTipPage({ params }: { params: Promise<{ business: string; spot: string }> }) {
  const { business, spot: spotSlug } = await params;
  const spot = await getSpot(business, spotSlug, "tip");
  const { t } = await getI18n();

  if (!spot) {
    notFound();
  }
  if (spot.page.mode === "review") {
    redirect(`/review/spot/${spot.business.id}/${spot.slug}`);
  }

  return (
    <TipPageShell page={spot.page}>
      <RecipientHeader page={spot.page} name={spot.business.name} avatar={spot.business.avatar} bio={spot.name} heading={<>{t("We")} <span className="text-red-500" aria-label="♥">❤</span> {t("Tips")}</>} />
      {spot.can_receive_tips ? (
        <TipForm target={{ kind: "spot", businessId: spot.business.id, spotSlug: spot.slug }} page={spot.page} options={spot.tips} />
      ) : (
        <TipsUnavailable page={spot.page} />
      )}
    </TipPageShell>
  );
}
