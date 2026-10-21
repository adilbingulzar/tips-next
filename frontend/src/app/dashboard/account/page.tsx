import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountForm } from "@/components/app/AccountForm";
import { PageHeader } from "@/components/app/ui";
import { requireVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Account" };

/** The old "Account" page: email, phone, password and account status in one form. */
export default function Page() {
  return (
    <>
      <PageHeader title="Account" description="Update your account details" />
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Account />
      </Suspense>
    </>
  );
}

async function Account() {
  return <AccountForm user={await requireVerifiedUser()} />;
}
