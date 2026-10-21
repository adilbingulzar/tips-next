import type { Metadata } from "next";
import { Suspense } from "react";

import { IdentityCheck } from "@/components/app/IdentityCheck";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Verification" };

type Verification = { available: boolean; status: "none" | "pending" | "verified" | "rejected"; checked_at: string | null };

export default function Page() {
  return (
    <>
      <PageHeader title="Verification" description="Confirm your identity with a photo of your ID and a selfie. It takes a few minutes." />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <VerificationStatus />
      </Suspense>
    </>
  );
}

async function VerificationStatus() {
  await requireVerifiedUser();
  const { data } = await api<{ data: Verification }>("/me/verification", { token: await requireToken() });
  const { t } = await getI18n();

  if (!data.available) {
    return <p className="alert alert-info">{t("Identity verification is not available right now.")}</p>;
  }

  const status = {
    none: { tone: "border-stone-200 bg-surface text-stone-700", text: t("You have not verified your identity yet.") },
    pending: { tone: "border-amber-200 bg-amber-50 text-amber-900", text: t("Your verification is in progress. We let you know when it is done.") },
    verified: { tone: "border-emerald-200 bg-emerald-50 text-emerald-900", text: t("Your identity is verified.") },
    rejected: { tone: "border-red-200 bg-red-50 text-red-900", text: t("Your verification was not accepted. Please try again with a clear photo of a valid ID.") },
  }[data.status];

  return (
    <div className="space-y-6">
      <p className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${status.tone}`}>{status.text}</p>
      {data.status !== "verified" && (
        <section className="card p-6">
          <IdentityCheck />
        </section>
      )}
    </div>
  );
}
