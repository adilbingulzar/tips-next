import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { endSubscription } from "@/app/actions/admin";
import { ActivateFreePlan, SubscribedFilter } from "@/components/admin/AdminForms";
import { ActionButton } from "@/components/app/ActionButton";
import { EmptyState, PageHeader, Pagination, plainQuery } from "@/components/app/ui";
import type { AdminSubscription, AdminUserRow } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";
import type { Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Subscription List" };

const TABS = [
  ["active", "Active"],
  ["pending", "Not paid"],
  ["expired", "Expired"],
  ["all", "All"],
] as const;

export default function Page({ searchParams }: PageProps<"/admin/subscriptions">) {
  return (
    <>
      <PageHeader title="Subscription List" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <SubscriptionPage searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const VIEW_TAB = (active: boolean) => `tab ${active ? "tab-active" : ""}`;

async function SubscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const view = params.view === "plans" ? "plans" : "users";
  return (
    <>
      <nav aria-label="View" className="mb-6 flex gap-2">
        <Link href="/admin/subscriptions" className={VIEW_TAB(view === "users")}>
          Users
        </Link>
        <Link href="/admin/subscriptions?view=plans" className={VIEW_TAB(view === "plans")}>
          Plan history
        </Link>
      </nav>
      {view === "plans" ? <Plans searchParams={Promise.resolve(params)} /> : <Users searchParams={Promise.resolve(params)} />}
    </>
  );
}

/** The old list: every user, filtered by whether a plan is running, with "Activate Free Plan". */
async function Users({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "subscribed", "q"]);
  const users = await api<Paginated<AdminUserRow>>("/admin/users", { token: await requireToken(), query });
  const { current_page, per_page, total } = users.meta;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SubscribedFilter value={query.subscribed ?? ""} />
        <p className="text-sm font-semibold text-stone-500">
          Result {total === 0 ? 0 : (current_page - 1) * per_page + 1} - {Math.min(current_page * per_page, total)} / {total}
        </p>
      </div>
      {users.data.length === 0 ? (
        <EmptyState>Sorry, no data found!</EmptyState>
      ) : (
        <ul className="card divide-y divide-stone-100">
          {users.data.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-48 flex-1">
                <Link href={`/admin/users/${user.id}`} className="font-bold text-stone-900 hover:underline">
                  {user.name}
                </Link>
                {user.account_type === "business" && <span className="badge badge-primary ms-2">Business</span>}
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
              {user.plan_ends_on ? (
                <span className="badge bg-emerald-100 text-emerald-700">Subscribed until {user.plan_ends_on}</span>
              ) : (
                <ActivateFreePlan userId={user.id} />
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination page={current_page} lastPage={users.meta.last_page} basePath="/admin/subscriptions" query={query} />
    </>
  );
}

async function Plans({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "status", "q", "view"]);
  const status = query.status ?? "active";
  const plans = await api<Paginated<AdminSubscription>>("/admin/subscriptions", { token: await requireToken(), query });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Plan status" className="tabs">
          {TABS.map(([value, label]) => (
            <Link key={value} href={`/admin/subscriptions?view=plans&status=${value}`} className={`tab ${status === value ? "tab-active" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
        <form method="get" className="flex gap-2">
          <input type="hidden" name="view" value="plans" />
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={query.q ?? ""} placeholder="Name or email" aria-label="Search" className="input" />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>
      </div>
      {plans.data.length === 0 ? (
        <EmptyState>No plans here.</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-end">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {plans.data.map((plan) => (
                <tr key={plan.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    {plan.user ? (
                      <Link href={`/admin/users/${plan.user.id}`} className="font-bold text-stone-900 hover:underline">
                        {plan.user.name}
                      </Link>
                    ) : (
                      "–"
                    )}
                    <p className="text-xs text-stone-500">{plan.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {plan.granted ? "Given by admin" : plan.plan}
                    {!plan.is_active && <span className="ms-2 text-xs text-amber-700">({plan.payment_status})</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{plan.starts_on ? `${plan.starts_on} – ${plan.ends_on}` : "–"}</td>
                  <td className="px-4 py-3 text-end text-stone-900">{money(plan.amount)}</td>
                  <td className="px-4 py-3 text-end">
                    {plan.is_active && plan.ends_on && plan.ends_on >= new Date().toISOString().slice(0, 10) && (
                      <ActionButton action={endSubscription.bind(null, plan.id)} confirm={`End this plan of ${plan.user?.name ?? "the user"} today?`} className="btn btn-ghost btn-sm text-red-600">
                        End plan
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={plans.meta.current_page} lastPage={plans.meta.last_page} basePath="/admin/subscriptions" query={query} />
    </>
  );
}
