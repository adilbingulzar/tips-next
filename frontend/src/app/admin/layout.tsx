import { Suspense } from "react";

import { AppShell, AppShellPlaceholder } from "@/components/app/AppShell";

/**
 * The admin pages share the frame of the signed-in area, with the
 * Administration and System groups in the menu, as in the old app.
 * Every admin page checks the role itself (requireAdmin).
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<AppShellPlaceholder />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
