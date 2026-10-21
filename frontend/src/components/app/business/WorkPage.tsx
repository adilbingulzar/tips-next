"use client";

import { useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { answerInvitation, joinBusiness, leaveBusiness, loadOwnShifts, type Shifts } from "@/app/actions/business";
import { Feedback } from "@/components/app/forms";
import { SolidIcon } from "@/components/app/SolidIcons";
import { useT } from "@/components/i18n/I18nProvider";
import type { Employment } from "@/lib/types";

import { ShiftEditor } from "./ShiftEditor";

/** The old search bar: type the business ID and press "Get Business" to send a join request. */
export function JoinBusinessForm() {
  const t = useT();
  const [state, action, pending] = useActionState<FormState, FormData>(joinBusiness, {});

  return (
    <form action={action} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input name="business_code" required autoComplete="off" placeholder={t("Search by business id")} aria-label={t("Business ID")} className="input ps-10" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-secondary shrink-0">
          {t(pending ? "Sending…" : "Get Business")}
        </button>
      </div>
      {state.errors?.business_code && <p className="field-error">{t(state.errors.business_code[0] ?? "")}</p>}
      <Feedback state={state.errors?.business_code ? {} : state} />
    </form>
  );
}

export function EmploymentList({ employments }: { employments: Employment[] }) {
  const t = useT();

  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-stone-500">{t("Total {count}", { count: employments.length })}</p>
      {employments.length === 0 ? (
        <div className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 py-12 text-stone-400">
          <SolidIcon name="database" className="h-8 w-8" />
          <p className="text-sm">{t("You are not part of a business yet.")}</p>
        </div>
      ) : (
        <ul className="mt-2 space-y-3">
          {employments.map((employment) => (
            <EmploymentRow key={employment.id} employment={employment} />
          ))}
        </ul>
      )}
    </div>
  );
}

type Panel = "hours" | "agreement" | null;

function EmploymentRow({ employment }: { employment: Employment }) {
  const t = useT();
  const [menu, setMenu] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [hours, setHours] = useState<Shifts | null>(null);
  const [message, setMessage] = useState<FormState>({});
  const [pending, startTransition] = useTransition();
  const invited = employment.status === "pending" && employment.requested_by === "business";

  function open(next: Panel) {
    setMenu(false);
    setPanel(panel === next ? null : next);
    if (next === "hours" && hours === null) {
      startTransition(async () => setHours(await loadOwnShifts(employment.id)));
    }
  }

  function remove() {
    setMenu(false);
    if (window.confirm(t("Leave {name}?", { name: employment.business.name }))) {
      startTransition(async () => setMessage(await leaveBusiness(employment.id)));
    }
  }

  return (
    <li className="card">
      <div className="flex items-center gap-4 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
          <SolidIcon name="briefcase" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-stone-900 capitalize">{employment.business.name}</p>
          <p className="text-sm text-stone-500">
            {t("ID")} - {employment.business.code}
            {employment.role && ` · ${t(employment.role)}`}
          </p>
        </div>
        <Status employment={employment} />
        <div className="relative">
          <button type="button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={t("Options")} className="grid h-9 w-9 place-items-center rounded-full text-orange-500 hover:bg-stone-100">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {menu && (
            <div className="menu-panel absolute end-0 z-20 mt-2 w-52">
              {employment.status === "accepted" && (
                <button type="button" onClick={() => open("hours")} className="block w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50">
                  {t("Set Working Hours")}
                </button>
              )}
              {(employment.agreement || invited) && (
                <button type="button" onClick={() => open("agreement")} className="block w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-stone-50">
                  {t("Agreement")}
                </button>
              )}
              <button type="button" onClick={remove} className="block w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50">
                {t(employment.status === "pending" && employment.requested_by === "employee" ? "Withdraw request" : "Remove")}
              </button>
            </div>
          )}
        </div>
      </div>

      {(message.success || message.message) && (
        <div className="px-5 pb-4">
          <Feedback state={message} />
        </div>
      )}

      {panel === "hours" && (
        <div className="border-t border-stone-100 p-5">
          <h3 className="mb-3 text-sm">{t("Set Business Hours")}</h3>
          {hours ? <ShiftEditor path={`/me/employments/${employment.id}/shifts`} initial={hours} /> : <p className="text-sm text-stone-500">{t(pending ? "Loading…" : "Could not load your hours.")}</p>}
        </div>
      )}

      {panel === "agreement" && <AgreementPanel employment={employment} onDone={setMessage} />}

      {employment.status === "rejected" && employment.reason && (
        <p className="px-5 pb-4 text-sm text-stone-500">
          {t("Reason:")} {employment.reason}
        </p>
      )}
    </li>
  );
}

/** The old "Business Agreement" dialog: read it, then accept, or reject with a reason. */
function AgreementPanel({ employment, onDone }: { employment: Employment; onDone: (state: FormState) => void }) {
  const t = useT();
  const [agree, setAgree] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const invited = employment.status === "pending" && employment.requested_by === "business";

  return (
    <div className="space-y-4 border-t border-stone-100 p-5">
      <h3 className="text-sm">{employment.agreement?.title ?? t("Business Agreement")}</h3>
      {employment.agreement ? (
        <div className="max-h-72 overflow-y-auto rounded-xl bg-stone-50 p-4 text-sm whitespace-pre-line text-stone-700">{employment.agreement.content}</div>
      ) : (
        <p className="text-sm text-stone-500">{t("No agreement has been set yet.")}</p>
      )}

      {invited && !rejecting && (
        <>
          <label className="flex items-start gap-3 text-sm text-stone-700">
            <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" />
            {t("I agree with terms & conditions")}
          </label>
          {error && <p className="field-error">{t(error)}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setRejecting(true)} className="btn btn-outline btn-sm text-red-600">
              {t("Reject")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!agree) {
                  setError("Please tick checkbox if you agree with contract");
                  return;
                }
                startTransition(async () => onDone(await answerInvitation(employment.id, "accept")));
              }}
              className="btn btn-primary btn-sm"
            >
              {t("Accept")}
            </button>
          </div>
        </>
      )}

      {invited && rejecting && (
        <>
          <div className="field">
            <label className="label" htmlFor={`reason-${employment.id}`}>
              {t("Reason for reject agreement")}
            </label>
            <textarea id={`reason-${employment.id}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} className="textarea" />
          </div>
          {error && <p className="field-error">{t(error)}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRejecting(false)} className="btn btn-secondary btn-sm">
              {t("Back")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!reason.trim()) {
                  setError("Reason for reject agreement");
                  return;
                }
                startTransition(async () => onDone(await answerInvitation(employment.id, "decline", reason.trim())));
              }}
              className="btn btn-primary btn-sm"
            >
              {t("Submit")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Status({ employment }: { employment: Employment }) {
  const t = useT();
  if (employment.status === "accepted") {
    return <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline">{t("Team member")}</span>;
  }
  if (employment.status === "rejected") {
    return <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{t("Declined")}</span>;
  }
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{employment.requested_by === "business" ? t("Invitation for you") : t("Waiting for the business")}</span>
  );
}
