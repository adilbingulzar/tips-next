import type { ReactNode } from "react";

import { ThemeSwitch } from "@/components/theme/ThemeSwitch";
import { api } from "@/lib/api";
import { requireToken, requireUser } from "@/lib/auth";
import { getI18n, getLocales } from "@/lib/i18n";
import type { NotificationList } from "@/lib/types";

import { LanguagePill, NotificationBell, UserMenu } from "./HeaderMenus";
import { buildNav } from "./navigation";
import { ShellFrame } from "./ShellFrame";

/**
 * Frame of every signed-in page, as in the Alfred back office: the menu in a panel
 * on the left, and a bar with the language, the theme switch, the bell and the
 * account menu. Admin pages use the same frame, with the admin groups in the menu.
 */
export async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const token = await requireToken();
  const { t } = await getI18n();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";

  const [notifications, plan, locales] = await Promise.all([
    user.email_verified ? api<NotificationList>("/me/notifications", { token }).catch(() => null) : Promise.resolve(null),
    user.email_verified ? api<{ data: { required: boolean } }>("/me/subscription", { token }).catch(() => null) : Promise.resolve(null),
    getLocales().catch(() => []),
  ]);

  const nav = buildNav({
    isBusiness: user.account_type === "business",
    isAdmin: user.role === "admin",
    slug: user.slug,
    showSubscription: Boolean(plan?.data.required),
    setupIncomplete: !user.avatar || !user.bio,
  });

  return (
    <ShellFrame
      items={nav}
      appName={appName}
      bar={
        <div className="pz-topbar-right">
          <LanguagePill locales={locales.map(({ code, name }) => ({ code, name }))} />
          <ThemeSwitch />
          <NotificationBell unread={notifications?.meta.unread_count ?? 0} latest={(notifications?.data ?? []).slice(0, 6)} />
          <UserMenu name={user.name} />
        </div>
      }
      footer={
        <>
          © 2018-{new Date().getFullYear()} {t("All Rights Reserved")}.
        </>
      }
    >
      {children}
    </ShellFrame>
  );
}

/** Shown for a moment while the frame reads the session. */
export function AppShellPlaceholder() {
  return (
    <div className="pz-wrap" aria-busy="true">
      <aside className="pz-sidebar max-lg:hidden">
        <div className="pz-brand">
          <div className="h-9 w-40 animate-pulse rounded-full bg-stone-200" />
        </div>
        <div className="pz-nav">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="h-12 shrink-0 animate-pulse rounded-full bg-stone-200/70" />
          ))}
        </div>
      </aside>
      <div className="pz-main">
        <div className="pz-topbar" />
        <div>
          <div className="h-96 animate-pulse rounded-[30px] bg-stone-200/70" />
        </div>
      </div>
    </div>
  );
}
