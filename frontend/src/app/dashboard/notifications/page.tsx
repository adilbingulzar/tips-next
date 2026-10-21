import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/account";
import { ActionButton } from "@/components/app/ActionButton";
import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import type { NotificationList } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications" };

export default function Page({ searchParams }: PageProps<"/dashboard/notifications">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <Notifications searchParams={searchParams} />
    </Suspense>
  );
}

async function Notifications({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireVerifiedUser();
  const query = plainQuery(await searchParams, ["page"]);
  const notifications = await api<NotificationList>("/me/notifications", { token: await requireToken(), query });
  const unread = notifications.meta.unread_count;
  const { t } = await getI18n();

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread === 0 ? "You are all caught up." : t("{count} unread", { count: unread })}
        actions={
          <>
            {unread > 0 && (
              <ActionButton action={markAllNotificationsRead} pendingText="Marking…">
                {t("Mark all as read")}
              </ActionButton>
            )}
            <Link href="/dashboard/notification-settings" className="btn btn-ghost btn-sm">
              {t("Settings")}
            </Link>
          </>
        }
      />

      {notifications.data.length === 0 ? (
        <EmptyState>No notifications yet. Tips, ratings and team news show up here.</EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 overflow-hidden card">
          {notifications.data.map((notification) => (
            <li key={notification.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${notification.is_read ? "" : "bg-orange-50/60"}`}>
              <div className="flex min-w-0 gap-3">
                <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? "bg-transparent" : "bg-orange-500"}`} />
                <div className="min-w-0">
                  <p className="font-bold text-stone-900">
                    {notification.title}
                    {!notification.is_read && <span className="sr-only"> ({t("unread")})</span>}
                  </p>
                  <p className="text-sm break-words text-stone-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-stone-400">{dateTime(notification.created_at)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 ps-5 sm:ps-0">
                {notification.link?.startsWith("/dashboard") && (
                  <Link href={notification.link} className="btn btn-outline btn-sm">
                    {t("Open")}
                  </Link>
                )}
                {!notification.is_read && (
                  <ActionButton action={markNotificationRead.bind(null, notification.id)} className="btn btn-ghost btn-sm">
                    {t("Mark as read")}
                  </ActionButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={notifications.meta.current_page} lastPage={notifications.meta.last_page} basePath="/dashboard/notifications" query={{}} />
    </>
  );
}
