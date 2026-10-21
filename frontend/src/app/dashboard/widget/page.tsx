import type { Metadata } from "next";
import { Suspense } from "react";

import { WidgetSettings, type WidgetSettingsData } from "@/components/app/business/WidgetSettings";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { requireBusinessOwner } from "@/lib/business";

export const metadata: Metadata = { title: "Review widget" };

export default function Page() {
  return (
    <>
      <PageHeader title="Review widget" description="Show your reviews on your own website: copy the code into a page of your site." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Widget />
      </Suspense>
    </>
  );
}

async function Widget() {
  await requireBusinessOwner();
  const { data } = await api<{ data: WidgetSettingsData }>("/me/business/widget", { token: await requireToken() });
  return <WidgetSettings settings={data} siteUrl={(process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "")} />;
}
