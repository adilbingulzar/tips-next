import { Suspense } from "react";

import { AppShell, AppShellPlaceholder } from "@/components/app/AppShell";

/** Frame of the signed-in area (same as the old app's). */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<AppShellPlaceholder />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
