"use client";

import { useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { deleteAgreement, makeDefaultAgreement, saveAgreement } from "@/app/actions/business";
import { EmptyState } from "@/components/app/EmptyState";
import { Feedback, SaveButton } from "@/components/app/forms";
import { SolidIcon } from "@/components/app/SolidIcons";
import type { Agreement, Role } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";

export function AgreementForm({ agreement, roles, onDone }: { agreement: Agreement | null; roles: Role[]; onDone?: () => void }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await saveAgreement(agreement?.id ?? null, previous, formData);
    if (result.success) {
      onDone?.();
    }
    return result;
  }, {});
  const initial = Object.fromEntries((agreement?.role_shares ?? []).map((share) => [share.role_id, String(share.percent)]));
  const [percents, setPercents] = useState<Record<number, string>>(initial);
  const total = roles.reduce((sum, role) => sum + (Number((percents[role.id] ?? "").replace(",", ".")) || 0), 0);

  if (roles.length === 0) {
    return <p className="alert alert-info">{t("Add roles on the Team page first; agreements share tips per role.")}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <div className="field">
        <label className="label" htmlFor={`title-${agreement?.id ?? "new"}`}>
          {t("Title")}
        </label>
        <input id={`title-${agreement?.id ?? "new"}`} name="title" defaultValue={agreement?.title} required maxLength={150} className="input" />
      </div>

      <fieldset>
        <legend className="label">{t("Share of each tip per role")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-2">
              <span className="text-sm font-semibold text-stone-800">{role.name}</span>
              <input type="hidden" name="share_role" value={role.id} />
              <span className="flex items-center gap-1">
                <input
                  name="share_percent"
                  inputMode="decimal"
                  value={percents[role.id] ?? ""}
                  onChange={(event) => setPercents((current) => ({ ...current, [role.id]: event.target.value.replace(/[^\d.,]/g, "") }))}
                  placeholder="0"
                  className="input w-20 py-1.5 text-end"
                  aria-label={`${role.name} percent`}
                />
                <span className="text-sm text-stone-500">%</span>
              </span>
            </label>
          ))}
        </div>
        <p className={`mt-2 text-sm font-semibold ${Math.abs(total - 100) < 0.001 ? "text-emerald-600" : "text-amber-700"}`} aria-live="polite">
          {t("Total: {percent}%", { percent: total.toLocaleString("nl-NL") })} {Math.abs(total - 100) < 0.001 ? "✓" : t("(must be 100%)")}
        </p>
      </fieldset>

      <label className="flex items-start gap-3">
        <input type="checkbox" name="is_for_spots" defaultChecked={agreement?.is_for_spots} className="mt-0.5 h-5 w-5 accent-orange-500" />
        <span>
          <span className="block text-sm font-semibold text-stone-800">{t("Use for tips at spots")}</span>
          <span className="block text-xs text-stone-500">{t("Tips at a table or bar are shared by the staff working there with these shares.")}</span>
        </span>
      </label>

      <div className="field">
        <label className="label" htmlFor={`content-${agreement?.id ?? "new"}`}>
          {t("Agreement text (shown to team members)")}
        </label>
        <textarea id={`content-${agreement?.id ?? "new"}`} name="content" defaultValue={agreement?.content} rows={4} maxLength={20000} className="textarea" />
      </div>

      <div className="flex justify-end">
        <SaveButton>{agreement ? "Save agreement" : "Create agreement"}</SaveButton>
      </div>
    </form>
  );
}

/** One agreement in the old list style: title, date, how many people use it, Edit and a menu. */
export function AgreementCard({ agreement, roles }: { agreement: Agreement; roles: Role[] }) {
  const t = useT();
  const [panel, setPanel] = useState<"edit" | "view" | null>(null);
  const [menu, setMenu] = useState(false);
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();
  const roleName = (id: number) => roles.find((role) => role.id === id)?.name ?? t("Deleted role");
  const item = "block w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50";

  return (
    <li className="card">
      <div className="flex flex-wrap items-start gap-4 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
          <SolidIcon name="fileLines" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-stone-900">
            {agreement.title} {agreement.is_default && <span className="font-normal text-stone-500">({t("default")})</span>}
          </p>
          {agreement.created_at && (
            <p className="mt-0.5 flex items-center gap-1 text-stone-500">
              <SolidIcon name="clock" className="h-3.5 w-3.5" />
              {new Date(agreement.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Europe/Amsterdam" })}
            </p>
          )}
          <p className="mt-0.5 text-stone-500">{t("{count} employees are using this agreement", { count: agreement.employees ?? 0 })}</p>
          <p className="mt-0.5 text-stone-500">{t(agreement.is_for_spots ? "Spot Agreement" : "Business Agreement")}</p>
          {(state.message || state.success) && <p className={`mt-1 text-xs ${state.success ? "text-emerald-700" : "text-red-600"}`}>{t(state.message ?? state.success ?? "")}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className="btn btn-secondary btn-sm">
            {t(panel === "edit" ? "Close" : "Edit")}
          </button>
          <div className="relative">
            <button type="button" disabled={pending} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={t("Options")} className="grid h-9 w-9 place-items-center rounded-full text-orange-500 hover:bg-stone-100">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menu && (
              <div className="menu-panel absolute end-0 z-20 mt-2 w-48">
                {!agreement.is_default && !agreement.is_for_spots && (
                  <button type="button" onClick={() => (setMenu(false), startTransition(async () => setState(await makeDefaultAgreement(agreement.id))))} className={item}>
                    {t("Set Default")}
                  </button>
                )}
                <button type="button" onClick={() => (setMenu(false), setPanel("view"))} className={item}>
                  {t("View Agreement")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    if (window.confirm(t("Delete “{name}”?", { name: agreement.title }))) {
                      startTransition(async () => setState(await deleteAgreement(agreement.id)));
                    }
                  }}
                  className={`${item} text-red-600`}
                >
                  {t("Delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {panel === "edit" && (
        <div className="border-t border-stone-100 p-5">
          <AgreementForm agreement={agreement} roles={roles} onDone={() => setPanel(null)} />
        </div>
      )}
      {panel === "view" && (
        <div className="space-y-3 border-t border-stone-100 p-5">
          <ul className="flex flex-wrap gap-2">
            {agreement.role_shares.map((share) => (
              <li key={share.role_id} className="rounded-xl bg-stone-100 px-3 py-1.5 text-sm">
                <span className="font-semibold text-stone-800">{roleName(share.role_id)}</span> <span className="text-stone-600">{share.percent}%</span>
              </li>
            ))}
          </ul>
          {agreement.content && <div className="rounded-xl bg-stone-50 p-4 text-sm whitespace-pre-line text-stone-700">{agreement.content}</div>}
          <button type="button" onClick={() => setPanel(null)} className="btn btn-secondary btn-sm">
            {t("Close")}
          </button>
        </div>
      )}
    </li>
  );
}

/** The old list with its Compose button; the form opens above the list. */
export function AgreementList({ agreements, roles }: { agreements: Agreement[]; roles: Role[] }) {
  const t = useT();
  const [composing, setComposing] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-500">{t("Result {count}", { count: agreements.length })}</p>
        <button type="button" onClick={() => setComposing(!composing)} className="btn btn-primary btn-sm btn-pill">
          {composing ? t("Close") : `＋ ${t("Compose")}`}
        </button>
      </div>
      {composing && (
        <section className="card mb-6 p-6">
          <h2 className="mb-4 text-lg">{t("New agreement")}</h2>
          <AgreementForm agreement={null} roles={roles} onDone={() => setComposing(false)} />
        </section>
      )}
      {agreements.length === 0 ? (
        <EmptyState>No agreements yet. Without one, the person who is tipped keeps the whole tip.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {agreements.map((agreement) => (
            <AgreementCard key={agreement.id} agreement={agreement} roles={roles} />
          ))}
        </ul>
      )}
    </>
  );
}
