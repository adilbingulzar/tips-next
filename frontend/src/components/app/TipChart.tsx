"use client";

import { useState } from "react";

import { useLocale, useT } from "@/components/i18n/I18nProvider";
import { money } from "@/lib/format";

type Bar = { key: string; label: string; amount: string };

/** Tips per day or per week as bars, with the old dashboard's Daily / Weekly switch. */
export function TipChart({ daily, weekly, today }: { daily: { date: string; amount: string }[]; weekly: { week_start: string; amount: string }[]; today: string }) {
  const t = useT();
  const { locale } = useLocale();
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const bars: Bar[] =
    view === "daily"
      ? daily.map((day) => ({ key: day.date, label: new Date(`${day.date}T12:00:00`).toLocaleDateString(locale, { weekday: "short" }), amount: day.amount }))
      : weekly.map((week) => ({ key: week.week_start, label: new Date(`${week.week_start}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" }), amount: week.amount }));
  const max = Math.max(...bars.map((bar) => Number(bar.amount)), 1);
  const headline = view === "daily" ? today : (weekly.at(-1)?.amount ?? "0");

  return (
    <div className="card">
      <div className="card-header">
        <p className="text-xl font-bold text-stone-900">{money(headline)}</p>
        <div className="flex rounded-xl bg-stone-100 p-1">
          {(["daily", "weekly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${view === option ? "bg-menu text-stone-900 shadow-sm" : "text-stone-600"}`}
            >
              {t(option === "daily" ? "Daily" : "Weekly")}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <div className="flex h-52 items-end gap-2" role="img" aria-label={bars.map((bar) => `${bar.label} ${money(bar.amount)}`).join(", ")}>
          {bars.map((bar) => {
            const value = Number(bar.amount);
            return (
              <div key={bar.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className={`w-full rounded-t-lg ${value > 0 ? "bg-orange-500" : "bg-stone-200"}`} style={{ height: `${Math.max((value / max) * 100, value > 0 ? 4 : 1)}%` }} />
                <span className="text-[11px] text-stone-500">{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
