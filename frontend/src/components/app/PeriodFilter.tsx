"use client";

import { usePathname, useRouter } from "next/navigation";

import { useT } from "@/components/i18n/I18nProvider";
import { useState } from "react";

const PERIODS = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["this_week", "This week"],
  ["last_week", "Last week"],
  ["this_month", "This month"],
  ["last_month", "Last month"],
  ["all", "All time"],
  ["custom", "Custom range"],
] as const;

const STATUSES = [
  ["", "Paid tips & reviews"],
  ["paid", "Paid"],
  ["pending", "Pending"],
  ["cancelled", "Cancelled"],
  ["expired", "Expired"],
  ["failed", "Failed"],
  ["refunded", "Refunded"],
] as const;

/** Report filters; changing them updates the URL, so filtered views can be bookmarked. */
export function PeriodFilter({ query, showStatus = true }: { query: Record<string, string>; showStatus?: boolean }) {
  const router = useRouter();
  const t = useT();
  const pathname = usePathname();
  const [period, setPeriod] = useState(query.period ?? "this_month");

  function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const next = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value !== "" && (period === "custom" || (key !== "from" && key !== "until"))) {
        next.set(key, value);
      }
    }
    router.push(`${pathname}?${next}`);
  }

  return (
    <form
      className="card mb-6 flex flex-wrap items-end gap-3 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget);
      }}
    >
      <div className="field min-w-40 flex-1">
        <label className="label" htmlFor="period">
          {t("Period")}
        </label>
        <select id="period" name="period" value={period} onChange={(event) => setPeriod(event.target.value)} className="input">
          {PERIODS.map(([value, label]) => (
            <option key={value} value={value}>
              {t(label)}
            </option>
          ))}
        </select>
      </div>
      {period === "custom" && (
        <>
          <div className="field">
            <label className="label" htmlFor="from">
              {t("From")}
            </label>
            <input id="from" name="from" type="date" defaultValue={query.from} required className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="until">
              {t("Until")}
            </label>
            <input id="until" name="until" type="date" defaultValue={query.until} required className="input" />
          </div>
        </>
      )}
      {showStatus && (
      <div className="field min-w-40 flex-1">
        <label className="label" htmlFor="status">
          {t("Show")}
        </label>
        <select id="status" name="status" defaultValue={query.status ?? ""} className="input">
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {t(label)}
            </option>
          ))}
        </select>
      </div>
      )}
      <button type="submit" className="btn btn-primary">
        {t("Apply")}
      </button>
    </form>
  );
}

const DURATIONS = [
  ["all", "Life Time"],
  ["this_month", "This Month"],
  ["last_month", "Last Month"],
  ["this_week", "This Week"],
  ["last_week", "Last Week"],
  ["yesterday", "Yesterday"],
  ["today", "Today"],
] as const;

/** The old reports' "Select Duration" dropdown: picking a period shows it straight away. */
export function DurationSelect({ period }: { period?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();

  return (
    <select
      value={period ?? ""}
      onChange={(event) => router.push(event.target.value ? `${pathname}?period=${event.target.value}` : pathname)}
      aria-label={t("Select Duration")}
      className="input w-full sm:w-56"
    >
      <option value="">{t("Select Duration")}</option>
      {DURATIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {t(label)}
        </option>
      ))}
    </select>
  );
}
