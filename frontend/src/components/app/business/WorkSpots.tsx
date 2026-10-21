"use client";

import { useState, useTransition } from "react";

import { leaveSpot, setSpotLive } from "@/app/actions/business";
import { ActionButton } from "@/components/app/ActionButton";
import type { WorkSpot } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";
import type { Translate } from "@/lib/i18n-shared";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The spots a business put the user on. While live at a spot the user shares
 * in its tips; being live at one spot ends being live at the others.
 */
export function WorkSpots({ spots }: { spots: WorkSpot[] }) {
  const t = useT();
  if (spots.length === 0) {
    return null;
  }

  return (
    <section id="spots" className="scroll-mt-6 space-y-3">
      <div>
        <h2 className="text-lg">{t("My spots")}</h2>
        <p className="text-sm text-stone-500">{t("Go live at the spot where you work now to share in its tips. Shift hours count automatically.")}</p>
      </div>
      <ul className="space-y-3">
        {spots.map((assignment) => (
          <li key={assignment.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-stone-900">{assignment.spot.name}</p>
                <p className="text-sm text-stone-500">
                  {assignment.business.name}
                  {assignment.role ? ` · ${assignment.role}` : ""}
                </p>
                <p className="mt-1 text-xs text-stone-500">{shiftSummary(assignment.shifts, t)}</p>
              </div>
              <SpotSwitch assignment={assignment} />
            </div>
            <div className="mt-3 flex justify-end border-t border-stone-100 pt-3">
              <ActionButton action={() => leaveSpot(assignment.id)} confirm={t("Leave {name}?", { name: assignment.spot.name })} className="btn btn-ghost btn-sm text-red-600">
                {t("Leave spot")}
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpotSwitch({ assignment }: { assignment: WorkSpot }) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={assignment.is_live}
        aria-label={t("Live at {name}", { name: assignment.spot.name })}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setSpotLive(assignment.id, !assignment.is_live);
            if (result.message) {
              setError(result.message);
            }
          })
        }
        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${assignment.is_live ? "bg-orange-500" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${assignment.is_live ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
      </button>
      <span className="text-xs font-semibold text-stone-500">{assignment.is_live ? t("Live") : t("Offline")}</span>
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {t(error)}
        </span>
      )}
    </div>
  );
}

function shiftSummary(shifts: WorkSpot["shifts"], t: Translate): string {
  const days = DAYS.filter((day) => (shifts[day] ?? []).length > 0);
  return days.length === 0 ? t("No shift hours set") : t("Shifts on {days}", { days: days.map((day) => t(day)).join(", ") });
}
