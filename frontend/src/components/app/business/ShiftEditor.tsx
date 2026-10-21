"use client";

import { useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { type Shifts, saveShifts } from "@/app/actions/business";
import { Feedback } from "@/components/app/forms";
import { useT } from "@/components/i18n/I18nProvider";

const DAYS = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
] as const;

/**
 * Weekly shift hours. During a shift the person shares in team tips without
 * having to go live. A range ending before it starts runs past midnight.
 * Also edits the opening hours on a business card (kind "opening").
 */
export function ShiftEditor({ path, initial, kind = "shift" }: { path: string; initial: Shifts; kind?: "shift" | "opening" }) {
  const t = useT();
  const words = kind === "opening" ? { empty: "Closed", remove: "Remove {day} opening hours", save: "Save opening hours" } : { empty: "No shift", remove: "Remove {day} shift", save: "Save shifts" };
  const [days, setDays] = useState<Shifts>(initial);
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  const update = (day: string, ranges: { from: string; to: string }[]) => setDays((current) => ({ ...current, [day]: ranges }));

  return (
    <div className="card p-6">
      <Feedback state={state} />
      <ul className="divide-y divide-stone-100">
        {DAYS.map(([day, label]) => {
          const ranges = days[day] ?? [];
          return (
            <li key={day} className="flex flex-wrap items-start gap-3 py-3">
              <span className="w-28 pt-2 text-sm font-bold text-stone-900">{t(label)}</span>
              <div className="flex flex-1 flex-col gap-2">
                {ranges.length === 0 && <span className="pt-2 text-sm text-stone-400">{t(words.empty)}</span>}
                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={range.from}
                      onChange={(event) => update(day, ranges.map((item, i) => (i === index ? { ...item, from: event.target.value } : item)))}
                      className="input w-32 py-2"
                      aria-label={t("{day} from", { day: t(label) })}
                    />
                    <span className="text-stone-400">–</span>
                    <input
                      type="time"
                      value={range.to}
                      onChange={(event) => update(day, ranges.map((item, i) => (i === index ? { ...item, to: event.target.value } : item)))}
                      className="input w-32 py-2"
                      aria-label={t("{day} until", { day: t(label) })}
                    />
                    {range.to !== "" && range.from !== "" && range.to < range.from && <span className="text-xs text-stone-500">{t("until next day")}</span>}
                    <button type="button" onClick={() => update(day, ranges.filter((_, i) => i !== index))} className="btn btn-ghost btn-sm" aria-label={t(words.remove, { day: t(label) })}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {ranges.length < 3 && (
                <button type="button" onClick={() => update(day, [...ranges, { from: "09:00", to: "17:00" }])} className="btn btn-outline btn-sm">
                  {t("+ Add")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setState(await saveShifts(path, days)))}
          className="btn btn-primary"
        >
          {pending ? t("Saving…") : t(words.save)}
        </button>
      </div>
    </div>
  );
}
