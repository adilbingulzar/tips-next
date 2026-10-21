import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ReviewForm } from "@/components/tips/ReviewForm";
import { RecipientHeader, TipPageShell, TipPageSkeleton } from "@/components/tips/TipPageShell";
import { getProfile } from "@/lib/public";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Leave a review" };

/** /review/{slug}: the rating and review page, usually what a printed QR code opens. */
export default function Page({ params }: PageProps<"/review/[slug]">) {
  return (
    <Suspense fallback={<TipPageSkeleton />}>
      <ReviewPage params={params} />
    </Suspense>
  );
}

async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug, "review");
  const { t } = await getI18n();

  if (!profile) {
    notFound();
  }
  if (profile.page.mode === "tip") {
    redirect(`/paytips/${profile.slug}`);
  }

  const next = profile.page.mode === "review" || !profile.can_receive_tips ? "/paytips/thanks-review" : `/paytips/${profile.slug}`;

  return (
    <TipPageShell page={profile.page}>
      <RecipientHeader page={profile.page} name={profile.name} avatar={profile.avatar} heading={profile.page.header ?? t("How did you like my service ?")} />
      <ReviewForm target={{ kind: "person", slug: profile.slug }} page={profile.page} nextHref={next} pinned={profile.pinned_reviews} />
    </TipPageShell>
  );
}
