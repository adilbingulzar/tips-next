import type { Metadata } from "next";
import { Suspense } from "react";

import { AgreementList } from "@/components/app/business/AgreementsPage";
import { PageHeader } from "@/components/app/ui";
import { businessAgreements, businessRoles, requireBusinessOwner } from "@/lib/business";

export const metadata: Metadata = { title: "Agreements" };

export default function Page() {
  return (
    <>
      <PageHeader title="Agreements" description="How tips are shared between roles in your team." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Agreements />
      </Suspense>
    </>
  );
}

async function Agreements() {
  await requireBusinessOwner();
  const [agreements, roles] = await Promise.all([businessAgreements(), businessRoles()]);

  return <AgreementList agreements={agreements} roles={roles} />;
}
