import type { Metadata } from "next";
import { Suspense } from "react";

import { SettingsForm } from "@/components/admin/AdminForms";
import { PageHeader } from "@/components/app/ui";
import type { AdminSettings } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Settings" description="Fees, plans, the payout account, support and terms." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  await requireAdmin();
  const { data } = await api<{ data: AdminSettings }>("/admin/settings", { token: await requireToken() });
  return <SettingsForm settings={data} />;
}
