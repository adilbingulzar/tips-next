import type { Metadata } from "next";
import { Suspense } from "react";

import { PushToggle } from "@/components/app/PushToggle";
import { NotificationPreferencesForm } from "@/components/app/SettingsForms";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import type { NotificationPreference } from "@/lib/types";

export const metadata: Metadata = { title: "Notification Settings" };

/** The old "Notification Settings" page, plus notifications on this device. */
export default function Page() {
  return (
    <>
      <PageHeader title="Notification Settings" description="Choose what you want to be told about" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <NotificationSettings />
      </Suspense>
    </>
  );
}

async function NotificationSettings() {
  await requireVerifiedUser();
  const token = await requireToken();
  const [{ data: preferences }, { data: push }] = await Promise.all([
    api<{ data: NotificationPreference[] }>("/me/notification-preferences", { token }),
    api<{ data: { available: boolean; public_key: string | null } }>("/me/push", { token }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <NotificationPreferencesForm preferences={preferences} />
      {push.available && push.public_key && <PushToggle publicKey={push.public_key} />}
    </div>
  );
}
