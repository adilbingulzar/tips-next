import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/app/ui";
import type { AdminDashboard } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default function Page() {
  return (
    <>
      <PageHeader title="Overview" description="The platform at a glance." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  await requireAdmin();
  const { data } = await api<{ data: AdminDashboard }>("/admin/dashboard", { token: await requireToken() });
  const tiles = [
    { label: "Open payouts", value: money(data.payouts.open_amount), hint: `${data.payouts.open_count} requests waiting`, href: "/admin/payouts", highlight: data.payouts.open_count > 0 },
    { label: "Tips this month", value: money(data.tips.this_month), hint: `${money(data.tips.total)} in total, ${data.tips.count} tips`, href: "/admin/users?sort=tips" },
    { label: "Platform fees this month", value: money(data.platform_fees.this_month), hint: `${money(data.platform_fees.total)} in total`, href: "/admin/fees" },
    { label: "Payout fees", value: money(data.payouts.fees_total), hint: `${money(data.payouts.paid_this_month)} paid out this month`, href: "/admin/payouts?status=paid" },
    { label: "Users", value: String(data.users.total), hint: `${data.users.business} businesses · ${data.users.new_this_month} new this month`, href: "/admin/users" },
    { label: "Active plans", value: String(data.subscriptions_active), hint: "Paid or given", href: "/admin/subscriptions" },
    { label: "Page visits", value: String(data.visits_last_30_days), hint: "Tip and review pages, last 30 days", href: "/admin/visitors" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.label}
          href={tile.href}
          className={`rounded-2xl border p-6 shadow-sm transition-colors ${tile.highlight ? "border-orange-500 bg-orange-500 text-white" : "border-stone-200 bg-surface hover:border-stone-300"}`}
        >
          <p className={`text-sm font-semibold ${tile.highlight ? "text-white/80" : "text-stone-500"}`}>{tile.label}</p>
          <p className={`mt-2 text-3xl font-bold ${tile.highlight ? "text-white" : "text-stone-900"}`}>{tile.value}</p>
          <p className={`mt-1 text-xs ${tile.highlight ? "text-white/80" : "text-stone-500"}`}>{tile.hint}</p>
        </Link>
      ))}
    </div>
  );
}
