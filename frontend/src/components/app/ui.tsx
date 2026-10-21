import Link from "next/link";
import type { ReactNode } from "react";

import { getI18n } from "@/lib/i18n";
import type { PaymentStatus } from "@/lib/types";

/** Shared building blocks of the signed-in pages. */

/** Page title and introduction; both are English texts and are translated here. */
export async function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="page-head print:hidden">
      <div className="min-w-0 flex-[1_1_320px]">
        <h1 className="page-title">{t(title)}</h1>
        {description && <p className="page-subtitle">{t(description)}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  authorised: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-800",
  verify: "bg-amber-100 text-amber-800",
  requested: "bg-amber-100 text-amber-800",
  cancelled: "bg-stone-100 text-stone-600",
  expired: "bg-stone-100 text-stone-600",
  denied: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-sky-100 text-sky-700",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  authorised: "Authorised",
  pending: "Pending",
  verify: "Being checked",
  requested: "Requested",
  cancelled: "Cancelled",
  expired: "Expired",
  denied: "Denied",
  failed: "Failed",
  refunded: "Refunded",
};

export async function StatusBadge({ status }: { status: PaymentStatus | "requested" }) {
  const { t } = await getI18n();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600"}`}>{t(STATUS_LABELS[status] ?? status)}</span>
  );
}

export { EmptyState } from "./EmptyState";

/** Previous / next links that keep the other query parameters. */
export async function Pagination({ page, lastPage, basePath, query }: { page: number; lastPage: number; basePath: string; query: Record<string, string> }) {
  if (lastPage <= 1) {
    return null;
  }
  const { t } = await getI18n();

  const href = (target: number) => `${basePath}?${new URLSearchParams({ ...query, page: String(target) })}`;

  return (
    <nav aria-label={t("Pages")} className="mt-6 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-outline btn-sm">
          ← {t("Previous")}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-stone-500">
        {t("Page {page} of {total}", { page, total: lastPage })}
      </span>
      {page < lastPage ? (
        <Link href={href(page + 1)} className="btn btn-outline btn-sm">
          {t("Next")} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export { dateTime } from "@/lib/format";

/** Query parameters as plain strings (first value of each). */
export function plainQuery(params: Record<string, string | string[] | undefined>, keys: string[]): Record<string, string> {
  const query: Record<string, string> = {};
  for (const key of keys) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) {
      query[key] = first;
    }
  }
  return query;
}
