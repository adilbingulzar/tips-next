import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import type { AdminFeeList } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Fees" };

export default function Page({ searchParams }: PageProps<"/admin/fees">) {
  return (
    <>
      <PageHeader title="Service Fees" description="The fee taken from every paid tip. Payout fees are on the Payouts page (Paid)." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Fees searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Fees({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "from", "until"]);
  const fees = await api<AdminFeeList>("/admin/fees", { token: await requireToken(), query });

  return (
    <>
      <form method="get" className="mb-6 flex flex-wrap items-end gap-2">
        <div className="field">
          <label className="label" htmlFor="from">
            From
          </label>
          <input id="from" type="date" name="from" defaultValue={query.from ?? ""} className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="until">
            Until
          </label>
          <input id="until" type="date" name="until" defaultValue={query.until ?? ""} className="input" />
        </div>
        <button type="submit" className="btn btn-outline">
          Show
        </button>
      </form>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Fees", money(fees.meta.totals.fees)],
          ["On tips worth", money(fees.meta.totals.tips)],
          ["Paid tips", String(fees.meta.totals.count)],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm font-semibold text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
          </div>
        ))}
      </div>
      {fees.data.length === 0 ? (
        <EmptyState>No fees in this period.</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tip for</th>
                <th className="px-4 py-3">Paid by</th>
                <th className="px-4 py-3 text-end">Tip</th>
                <th className="px-4 py-3 text-end">Fee</th>
              </tr>
            </thead>
            <tbody>
              {fees.data.map((fee) => (
                <tr key={fee.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(fee.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-stone-900">{fee.user?.name ?? "–"}</span>
                    {(fee.business || fee.spot) && <p className="text-xs text-stone-500">{[fee.business, fee.spot].filter(Boolean).join(" · ")}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{fee.paid_by === "customer" ? "Customer" : "Recipient"}</td>
                  <td className="px-4 py-3 text-end text-stone-600">{money(fee.tip_amount)}</td>
                  <td className="px-4 py-3 text-end font-bold text-stone-900">{money(fee.fee_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={fees.meta.current_page} lastPage={fees.meta.last_page} basePath="/admin/fees" query={query} />
    </>
  );
}
