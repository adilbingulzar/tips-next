import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PayoutSelection } from "@/components/admin/AdminForms";
import { EmptyState, PageHeader, Pagination, plainQuery } from "@/components/app/ui";
import type { AdminPayoutList } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Payout List" };

export default function Page({ searchParams }: PageProps<"/admin/payouts">) {
  return (
    <>
      <PageHeader title="Payout List" description="Download the transfers for the bank, then mark them as paid." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Payouts searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Payouts({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "status", "q"]);
  const isOpen = (query.status ?? "requested") === "requested";
  const payouts = await api<AdminPayoutList>("/admin/payouts", { token: await requireToken(), query });
  const tab = (active: boolean) => `tab ${active ? "tab-active" : ""}`;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Payout status" className="flex gap-2">
          <Link href="/admin/payouts" className={tab(isOpen)}>
            Open
          </Link>
          <Link href="/admin/payouts?status=paid" className={tab(!isOpen)}>
            Paid
          </Link>
        </nav>
        <form method="get" className="flex gap-2">
          {!isOpen && <input type="hidden" name="status" value="paid" />}
          <input name="q" defaultValue={query.q ?? ""} placeholder="Name, email or reference" aria-label="Search" className="input" />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>
      </div>
      <p className="mb-4 text-sm text-stone-600">
        {payouts.meta.total} payout(s) · {money(payouts.meta.totals.amount)} to transfer · {money(payouts.meta.totals.fee)} in payout fees
      </p>
      {payouts.data.length === 0 ? (
        <EmptyState>{isOpen ? "No payouts are waiting." : "No paid payouts found."}</EmptyState>
      ) : (
        <PayoutSelection key={`${query.status}-${query.page}-${query.q}`} payouts={payouts.data} isOpen={isOpen} />
      )}
      <Pagination page={payouts.meta.current_page} lastPage={payouts.meta.last_page} basePath="/admin/payouts" query={query} />
    </>
  );
}
