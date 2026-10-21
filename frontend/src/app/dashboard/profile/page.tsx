import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileDetailsForm } from "@/components/app/ProfileForms";
import { PageHeader } from "@/components/app/ui";
import { requireVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return (
    <>
      <PageHeader title="Profile" description="Profile Details" />
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Profile />
      </Suspense>
    </>
  );
}

async function Profile() {
  const user = await requireVerifiedUser();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^https?:\/\//, "");

  return <ProfileDetailsForm user={user} appUrl={appUrl} />;
}
