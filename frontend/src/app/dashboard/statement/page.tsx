import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, PageHeader, Pagination, StatusBadge, dateTime, plainQuery } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import type { Paginated, Withdrawal } from "@/lib/types";

export const metadata: Metadata = { title: "Statement" };

export default function Page({ searchParams }: PageProps<"/dashboard/statement">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <Statement searchParams={searchParams} />
    </Suspense>
  );
}

async function Statement({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireVerifiedUser();
  const query = plainQuery(await searchParams, ["page"]);
  const { t } = await getI18n();
  const statement = await api<Paginated<Withdrawal>>("/me/withdrawals", { token: await requireToken(), query });

  return (
    <>
      <PageHeader title="Statement" description="Your payout requests and when they were paid." />

      {statement.data.length === 0 ? (
        <EmptyState>No payouts yet. Once you request a payout of your balance, it shows up here.</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">{t("Requested")}</th>
                <th className="px-4 py-3">{t("Reference")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3">{t("Paid")}</th>
                <th className="px-4 py-3 text-end">{t("Fee")}</th>
                <th className="px-4 py-3 text-end">{t("Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {statement.data.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(withdrawal.requested_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{withdrawal.reference}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={withdrawal.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(withdrawal.paid_at)}</td>
                  <td className="px-4 py-3 text-end text-stone-600">{money(withdrawal.fee)}</td>
                  <td className="px-4 py-3 text-end font-bold text-stone-900">{money(withdrawal.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={statement.meta.current_page} lastPage={statement.meta.last_page} basePath="/dashboard/statement" query={{}} />
    </>
  );
}
