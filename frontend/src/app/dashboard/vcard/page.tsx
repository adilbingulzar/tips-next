import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/app/ui";
import { VcardSettings } from "@/components/app/VcardForms";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import type { MyVcard, WeeklyHours } from "@/lib/types";

export const metadata: Metadata = { title: "Card Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Card Settings" description="vCard info" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Vcard />
      </Suspense>
    </>
  );
}

async function Vcard() {
  const user = await requireVerifiedUser();
  const token = await requireToken();
  const [{ data: card }, { data: hours }] = await Promise.all([
    api<{ data: MyVcard }>("/me/vcard", { token }),
    api<{ data: WeeklyHours }>("/me/vcard-hours", { token }),
  ]);

  return <VcardSettings card={card} hours={hours} slug={user.slug} bio={user.bio} />;
}
