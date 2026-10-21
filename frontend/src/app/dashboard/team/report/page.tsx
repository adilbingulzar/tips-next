import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DurationSelect } from "@/components/app/PeriodFilter";
import { EmptyState, PageHeader, plainQuery } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { requireBusinessOwner } from "@/lib/business";
import { money } from "@/lib/format";
import type { BusinessReport } from "@/lib/types";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Spot Tip Report" };

export default function Page({ searchParams }: PageProps<"/dashboard/team/report">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <Report searchParams={searchParams} />
    </Suspense>
  );
}

async function Report({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t } = await getI18n();
  await requireBusinessOwner();
  const query = plainQuery(await searchParams, ["period", "from", "until"]);
  // As in the old report, no duration chosen means all time.
  const { data } = await api<{ data: BusinessReport }>("/me/business/report", { token: await requireToken(), query: { period: "all", ...query } });

  return (
    <>
      <PageHeader
        title="Spot Tip Report"
        actions={
          <>
            <a href={`/dashboard/spots/tips-export?${new URLSearchParams({ period: "all", ...query })}`} className="btn btn-secondary btn-sm" download>
              {t("Export Excel")}
            </a>
            <Link href="/dashboard/spots" className="btn btn-secondary btn-sm">
              ‹ {t("Manage Spot")}
            </Link>
            <Link href="/dashboard/tips" className="btn btn-secondary btn-sm">
              ‹ {t("Tip Report")}
            </Link>
          </>
        }
      />
      <div className="mb-6">
        <DurationSelect period={query.period} />
      </div>

      <div className="mb-6 rounded-2xl border border-orange-500 bg-orange-500 p-6 text-white shadow-sm shadow-orange-500/25">
        <p className="text-sm font-semibold text-white/80">{t("Total paid tips")}</p>
        <p className="mt-2 text-3xl font-bold">{money(data.total.amount)}</p>
        <p className="text-sm text-white/80">{data.total.count} tips</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportTable title="Per team member" rows={data.per_member.map((row) => ({ key: row.user_id, ...row }))} empty="No tips for team members in this period." />
        <ReportTable title="Per spot" rows={data.per_spot.map((row) => ({ key: row.spot_id, ...row }))} empty="No tips at spots in this period." />
      </div>
    </>
  );
}

async function ReportTable({ title, rows, empty }: { title: string; rows: { key: number; name: string; amount: string; count: number }[]; empty: string }) {
  const { t } = await getI18n();
  return (
    <section>
      <h2 className="mb-3 text-lg">{t(title)}</h2>
      {rows.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <div className="overflow-hidden card">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{row.name}</td>
                  <td className="px-4 py-3 text-stone-500">{t("{count} tips", { count: row.count })}</td>
                  <td className="px-4 py-3 text-end font-bold text-stone-900">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
