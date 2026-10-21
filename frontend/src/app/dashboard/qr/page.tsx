import type { Metadata } from "next";
import { Suspense } from "react";

import { QrCard } from "@/components/app/QrCard";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile QR" };

export default function Page() {
  return (
    <>
      <PageHeader title="Business QR" description="Print this and put it where your customers can see it" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Qr />
      </Suspense>
    </>
  );
}

async function Qr() {
  await requireVerifiedUser();
  const { data } = await api<{ data: { header: string; title: string; url: string } }>("/me/qr", { token: await requireToken() });

  return <QrCard url={data.url} header={data.header} title={data.title} />;
}
