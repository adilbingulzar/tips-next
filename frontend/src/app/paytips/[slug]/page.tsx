import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { TipForm } from "@/components/tips/TipForm";
import { RecipientHeader, TipPageShell, TipPageSkeleton, TipsUnavailable } from "@/components/tips/TipPageShell";
import { getProfile } from "@/lib/public";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Leave a tip" };

/** /paytips/{slug}: the tip page of a person. */
export default function Page({ params }: PageProps<"/paytips/[slug]">) {
  return (
    <Suspense fallback={<TipPageSkeleton />}>
      <TipPage params={params} />
    </Suspense>
  );
}

async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug, "tip");
  const { t } = await getI18n();

  if (!profile) {
    notFound();
  }
  if (profile.page.mode === "review") {
    redirect(`/review/${profile.slug}`);
  }

  return (
    <TipPageShell page={profile.page}>
      <RecipientHeader page={profile.page} name={profile.name} avatar={profile.avatar} bio={profile.bio} heading={<>{t("We")} <span className="text-red-500" aria-label="♥">❤</span> {t("Tips")}</>} />
      {profile.can_receive_tips ? (
        <TipForm target={{ kind: "person", slug: profile.slug }} page={profile.page} options={profile.tips} />
      ) : (
        <TipsUnavailable page={profile.page} />
      )}
    </TipPageShell>
  );
}
