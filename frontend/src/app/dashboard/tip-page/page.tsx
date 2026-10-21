import type { Metadata } from "next";
import { Suspense } from "react";

import { TipPageEditor, type TipPageSettings } from "@/components/app/TipPageForms";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Tip Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Page Area" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <TipPageSettingsPage />
      </Suspense>
    </>
  );
}

async function TipPageSettingsPage() {
  const user = await requireVerifiedUser();
  const { data } = await api<{ data: TipPageSettings }>("/me/tip-page", { token: await requireToken() });

  return <TipPageEditor settings={data} owner={{ name: user.name, avatar: user.avatar, bio: user.bio }} />;
}
