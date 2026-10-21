"use client";

import { useState, useTransition } from "react";

import { setEmploymentLive } from "@/app/actions/dashboard";
import { useT } from "@/components/i18n/I18nProvider";

type Employment = { id: number; business_name: string; is_live: boolean };

/**
 * The old dashboard's "Select Live Business" switch: pick the business you are
 * working at now (you go live there and offline everywhere else), or go offline.
 */
export function LiveBusinessSelect({ employments }: { employments: Employment[] }) {
  const t = useT();
  const [liveIds, setLiveIds] = useState(() => new Set(employments.filter((employment) => employment.is_live).map((employment) => employment.id)));
  const liveId = liveIds.size > 0 ? [...liveIds][0]! : null;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const live = employments.find((employment) => employment.id === liveId);

  function choose(id: number | null) {
    setOpen(false);
    setError(null);
    startTransition(async () => {
      const changes = employments.filter((employment) => liveIds.has(employment.id) !== (employment.id === id));
      const results = await Promise.all(changes.map((employment) => setEmploymentLive(employment.id, employment.id === id)));
      const next = new Set(liveIds);
      changes.forEach((employment, index) => {
        if (results[index]?.ok) {
          if (employment.id === id) {
            next.add(employment.id);
          } else {
            next.delete(employment.id);
          }
        }
      });
      setLiveIds(next);
      const failed = results.find((result) => !result.ok);
      if (failed) {
        setError(failed.message ?? "Could not change your status.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={liveId !== null}
        aria-label={t("Live")}
        disabled={liveId === null || pending}
        onClick={() => choose(null)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${liveId !== null ? "bg-emerald-500" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${liveId !== null ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
      </button>

      <div className="relative">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} disabled={pending} className="btn btn-outline btn-sm capitalize">
          {live ? live.business_name : t("Select Live Business")}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3 opacity-60" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="menu-panel absolute end-0 z-20 mt-2 max-h-72 w-60 overflow-y-auto">
            {liveId !== null && (
              <button type="button" onClick={() => choose(null)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-stone-300" />
                {t("Go offline")}
              </button>
            )}
            {employments.map((employment) => (
              <button key={employment.id} type="button" onClick={() => choose(employment.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm capitalize hover:bg-stone-50">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${employment.id === liveId ? "bg-emerald-500" : "bg-stone-300"}`} />
                {employment.business_name}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="field-error">{t(error)}</p>}
    </div>
  );
}
