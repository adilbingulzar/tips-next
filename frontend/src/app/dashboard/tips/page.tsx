import type { Metadata } from "next";
import { Suspense } from "react";

import { DurationSelect } from "@/components/app/PeriodFilter";
import { EmptyState, PageHeader, Pagination, StatusBadge, dateTime, plainQuery } from "@/components/app/ui";
import { ApiError, api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import type { OwnTip, Paginated } from "@/lib/types";

export const metadata: Metadata = { title: "Tip Report" };

const QUERY_KEYS = ["period", "from", "until", "status", "type", "page"];

export default function Page({ searchParams }: PageProps<"/dashboard/tips">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <TipReport searchParams={searchParams} />
    </Suspense>
  );
}

type Report = Paginated<OwnTip> & { summary: { paid_amount: string; paid_count: number } };

async function TipReport({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireVerifiedUser();
  const query = plainQuery(await searchParams, QUERY_KEYS);
  const filters = { ...query };
  const { t } = await getI18n();
  delete filters.page;

  let report: Report;
  try {
    // As in the old report: paid tips only, and no duration chosen means all time.
    report = await api<Report>("/me/tips", { token: await requireToken(), query: { period: "all", type: "online", ...query } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      return (
        <>
          <PageHeader title="Tip Report" />
          <DurationSelect period={query.period} />
          <p className="alert alert-error">{t(Object.values(error.errors)[0]?.[0] ?? error.message)}</p>
        </>
      );
    }
    throw error;
  }

  const exportHref = `/dashboard/tips/export?${new URLSearchParams({ period: "all", type: "online", ...filters })}`;
  const { current_page, per_page, total } = report.meta;
  const first = total === 0 ? 0 : (current_page - 1) * per_page + 1;

  return (
    <>
      <PageHeader
        title="Tip Report"
        actions={
          <>
            {user.business && (
              <a href="/dashboard/team/report" className="btn btn-secondary btn-sm">
                ‹ {t("Spot Report")}
              </a>
            )}
            <a href={exportHref} className="btn btn-secondary btn-sm" download>
              {t("Export Excel")}
            </a>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <DurationSelect period={query.period} />
        <p className="text-sm font-semibold text-stone-500">
          {t("Result {from} - {to} / {total}", { from: first, to: Math.min(current_page * per_page, total), total })} · {money(report.summary.paid_amount)}
        </p>
      </div>

      {report.data.length === 0 ? (
        <EmptyState>Sorry, no data found!</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("From")}</th>
                <th className="px-4 py-3">{t("Rating & review")}</th>
                <th className="px-4 py-3">{t("Where")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3 text-end">{t("Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((tip) => (
                <tr key={tip.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(tip.paid_at ?? tip.created_at)}</td>
                  <td className="px-4 py-3 text-stone-900">{tip.reviewer_name ?? <span className="text-stone-400">{t("Anonymous")}</span>}</td>
                  <td className="max-w-xs px-4 py-3">
                    {tip.rating && <span className="text-amber-500">{"★".repeat(tip.rating)}</span>}
                    {tip.review && <p className="truncate text-stone-600" title={tip.review}>{tip.review}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{[tip.business, tip.spot].filter(Boolean).join(" · ") || "–"}</td>
                  <td className="px-4 py-3">
                    {tip.type === "rating" ? <span className="text-xs text-stone-500">{t("Review")}</span> : <StatusBadge status={tip.payment_status} />}
                    {tip.paid_out && <span className="ms-2 text-xs text-stone-500">{t("paid out")}</span>}
                  </td>
                  <td className="px-4 py-3 text-end font-bold whitespace-nowrap text-stone-900">{tip.type === "online" ? money(tip.amount, tip.currency) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={report.meta.current_page} lastPage={report.meta.last_page} basePath="/dashboard/tips" query={filters} />
    </>
  );
}
