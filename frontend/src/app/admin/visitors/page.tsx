import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, PageHeader, Pagination, dateTime, plainQuery } from "@/components/app/ui";
import type { AdminVisitList } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireAdmin, requireToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Visitor Logs" };

const PAGE_TYPES: Record<string, string> = { paytip: "Tip page", review: "Review page", paytip_spot: "Spot tip page", review_spot: "Spot review page" };

export default function Page({ searchParams }: PageProps<"/admin/visitors">) {
  return (
    <>
      <PageHeader title="Visitor Logs" description="Visits to the public tip and review pages." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Visitors searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Visitors({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = plainQuery(await searchParams, ["page", "page_type", "from", "until"]);
  const visits = await api<AdminVisitList>("/admin/visitor-logs", { token: await requireToken(), query });

  return (
    <>
      <form method="get" className="mb-6 flex flex-wrap items-end gap-2">
        <select name="page_type" defaultValue={query.page_type ?? ""} aria-label="Page" className="input w-auto">
          <option value="">All pages</option>
          {Object.entries(PAGE_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={query.from ?? ""} aria-label="From" className="input w-auto" />
        <input type="date" name="until" defaultValue={query.until ?? ""} aria-label="Until" className="input w-auto" />
        <button type="submit" className="btn btn-outline">
          Show
        </button>
      </form>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PAGE_TYPES).map(([value, label]) => (
          <div key={value} className="card p-5">
            <p className="text-sm font-semibold text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{visits.meta.by_type[value] ?? 0}</p>
          </div>
        ))}
      </div>
      {visits.data.length === 0 ? (
        <EmptyState>No visits in this period.</EmptyState>
      ) : (
        <div className="table-card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {visits.data.map((visit) => (
                <tr key={visit.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(visit.created_at)}</td>
                  <td className="px-4 py-3 text-stone-900">{PAGE_TYPES[visit.page_type] ?? visit.page_type}</td>
                  <td className="max-w-md truncate px-4 py-3 text-stone-600" title={visit.page_url}>
                    {visit.page_url}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{visit.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={visits.meta.current_page} lastPage={visits.meta.last_page} basePath="/admin/visitors" query={query} />
    </>
  );
}
