"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import {
  grantSubscription,
  type ImportState,
  importAccounts,
  markPayoutsPaid,
  resetEmailTemplate,
  saveEmailTemplate,
  saveTranslation,
  sendSms,
  updateSettings,
  updateUserFees,
} from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { ActionButton } from "@/components/app/ActionButton";
import { Feedback, Field, SaveButton, TextArea, Toggle } from "@/components/app/forms";
import { dateTime } from "@/lib/format";
import type { AdminBusiness, AdminEmailTemplate, AdminPayout, AdminSettings, AdminUser, FeeRate } from "@/lib/admin-types";
import { money } from "@/lib/format";

/* Payouts */

export function PayoutSelection({ payouts, isOpen }: { payouts: AdminPayout[]; isOpen: boolean }) {
  const [selected, setSelected] = useState<number[]>(isOpen ? payouts.map((payout) => payout.id) : []);
  const [state, action] = useActionState<FormState, FormData>(markPayoutsPaid, {});
  const total = payouts.filter((payout) => selected.includes(payout.id)).reduce((sum, payout) => sum + Number(payout.amount), 0);
  const toggle = (id: number) => setSelected((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));

  return (
    <div className="space-y-4">
      <Feedback state={state} />
      {isOpen && (
        <div className="flex flex-wrap items-center justify-between gap-3 card p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={selected.length === payouts.length && payouts.length > 0}
              onChange={(event) => setSelected(event.target.checked ? payouts.map((payout) => payout.id) : [])}
              className="h-4 w-4 accent-orange-500"
            />
            Check All
            <span className="font-normal text-stone-500">
              · <strong className="text-stone-900">{selected.length}</strong> selected · {money(total.toFixed(2))}
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(["sepa", "csv"] as const).map((format) => (
              <form key={format} method="post" action="/admin/payouts/export">
                <input type="hidden" name="format" value={format} />
                {selected.map((id) => (
                  <input key={id} type="hidden" name="ids" value={id} />
                ))}
                <button type="submit" disabled={selected.length === 0} className="btn btn-outline btn-sm">
                  {format === "sepa" ? "Download SEPA file" : "Export Excel"}
                </button>
              </form>
            ))}
            <form action={action} onSubmit={(event) => !window.confirm(`Mark ${selected.length} payout(s) as transferred? The users are told.`) && event.preventDefault()}>
              {selected.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
              <SaveButton className="btn btn-primary btn-sm" pendingText="Saving…">
                Update Status
              </SaveButton>
            </form>
          </div>
        </div>
      )}
      <div className="table-card">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {isOpen && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={selected.length === payouts.length && payouts.length > 0}
                    onChange={(event) => setSelected(event.target.checked ? payouts.map((payout) => payout.id) : [])}
                    className="h-4 w-4 accent-orange-500"
                  />
                </th>
              )}
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Bank account</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">{isOpen ? "Requested" : "Paid"}</th>
              <th className="px-4 py-3 text-end">Fee</th>
              <th className="px-4 py-3 text-end">To transfer</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-stone-100 last:border-0">
                {isOpen && (
                  <td className="px-4 py-3">
                    <input type="checkbox" aria-label={`Select payout ${payout.reference}`} checked={selected.includes(payout.id)} onChange={() => toggle(payout.id)} className="h-4 w-4 accent-orange-500" />
                  </td>
                )}
                <td className="px-4 py-3">
                  <a href={`/admin/users/${payout.user.id}`} className="font-bold text-stone-900 hover:underline">
                    {payout.user.name ?? `#${payout.user.id}`}
                  </a>
                  <p className="text-xs text-stone-500">{payout.user.email}</p>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {payout.bank_account ? (
                    <>
                      {payout.bank_account.account_name}
                      <p className="font-mono text-xs">{payout.bank_account.account_number}</p>
                    </>
                  ) : (
                    <span className="font-semibold text-red-600">No bank account</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{payout.reference}</td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-600">{dateTime(isOpen ? payout.requested_at : payout.paid_at)}</td>
                <td className="px-4 py-3 text-end text-stone-600">{money(payout.fee)}</td>
                <td className="px-4 py-3 text-end font-bold text-stone-900">{money(payout.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Users */

function FeeRow({ prefix, label, rate, fallback }: { prefix: string; label: string; rate: FeeRate; fallback: string }) {
  const [custom, setCustom] = useState(rate !== null);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 py-3 last:border-0">
      <label className="flex w-48 cursor-pointer items-center gap-2 text-sm font-semibold text-stone-800">
        <input type="checkbox" name={`${prefix}_custom`} checked={custom} onChange={(event) => setCustom(event.target.checked)} className="h-4 w-4 accent-orange-500" />
        {label}
      </label>
      {custom ? (
        <div className="flex items-center gap-2 text-sm">
          <input name={`${prefix}_percent`} type="number" step="0.01" min="0" max="100" defaultValue={rate?.percent ?? "0"} aria-label={`${label} percent`} className="input w-24 py-2" />%
          <span className="text-stone-400">+ €</span>
          <input name={`${prefix}_fixed`} type="number" step="0.01" min="0" max="100" defaultValue={rate?.fixed ?? "0"} aria-label={`${label} fixed`} className="input w-24 py-2" />
        </div>
      ) : (
        <span className="text-sm text-stone-500">Platform fee: {fallback}</span>
      )}
    </div>
  );
}

export function UserFeesForm({ user, tipFee }: { user: AdminUser; tipFee: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateUserFees.bind(null, user.id), {});
  const describe = (fee?: { percent: string; fixed: string }) => (fee ? `${fee.percent}% + ${money(fee.fixed)}` : "–");

  return (
    <form action={action} className="card space-y-3 p-6">
      <div>
        <h2 className="text-lg">Own fees</h2>
        <p className="text-sm text-stone-500">Tick a fee to replace the platform fee for this user only.</p>
      </div>
      <Feedback state={state} />
      <FeeRow prefix="tip" label="Tip fee" rate={user.fees.tip} fallback={tipFee} />
      {(["manual", "daily", "weekly", "monthly"] as const).map((schedule) => (
        <FeeRow key={schedule} prefix={`payout_${schedule}`} label={`Payout fee (${schedule})`} rate={user.fees.payout[schedule]} fallback={describe(user.default_fees.payout[schedule])} />
      ))}
      <div className="flex justify-end">
        <SaveButton>Save fees</SaveButton>
      </div>
    </form>
  );
}

export function GrantPlanForm({ userId }: { userId: number }) {
  const [state, action] = useActionState<FormState, FormData>(grantSubscription.bind(null, userId), {});

  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="field">
          <label className="label" htmlFor="months">
            Free plan for
          </label>
          <select id="months" name="months" defaultValue="1" className="input">
            {[1, 3, 6, 12, 24].map((months) => (
              <option key={months} value={months}>
                {months} month{months === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>
        <SaveButton className="btn btn-outline" pendingText="Giving…">
          Give plan
        </SaveButton>
      </div>
    </form>
  );
}

/* Settings */

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const [state, action] = useActionState<FormState, FormData>(updateSettings, {});
  const numberField = (name: keyof AdminSettings, label: string, step = "0.01", hint?: string) => (
    <Field state={state} name={name} label={label} type="number" step={step} min="0" defaultValue={String(settings[name] ?? "")} required hint={hint} />
  );

  return (
    <form action={action} className="space-y-6">
      <Feedback state={state} />
      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Tip fee</h2>
        <p className="text-sm text-stone-500">Charged on every tip, unless a user has an own fee.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("tip_fee_percent", "Percentage")}
          {numberField("tip_fee_fixed", "Fixed amount (€)")}
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Plans</h2>
        <p className="text-sm text-stone-500">A plan is needed only to transfer the balance, and only for the account types switched on here.</p>
        <Toggle name="user_subscription_required" label="Personal accounts need a plan" defaultChecked={settings.user_subscription_required} />
        <Toggle name="business_subscription_required" label="Business accounts need a plan" defaultChecked={settings.business_subscription_required} />
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("user_plan_monthly", "Personal, per month (€)")}
          {numberField("user_plan_yearly", "Personal, per year (€)")}
          {numberField("business_plan_monthly", "Business, per month (€)")}
          {numberField("business_plan_yearly", "Business, per year (€)")}
          {numberField("free_trial_days", "Free trial (days)", "1", "New accounts can transfer without a plan this long.")}
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Account payouts are paid from</h2>
        <p className="text-sm text-stone-500">Used in the SEPA file of the Payouts page.</p>
        <Field state={state} name="payout_debtor_name" label="Account holder" defaultValue={settings.payout_debtor_name ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field state={state} name="payout_debtor_iban" label="IBAN" defaultValue={settings.payout_debtor_iban ?? ""} autoComplete="off" spellCheck={false} />
          <Field state={state} name="payout_debtor_bic" label="BIC (optional)" defaultValue={settings.payout_debtor_bic ?? ""} autoComplete="off" />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg">Support and terms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field state={state} name="support_email" label="Support email" type="email" defaultValue={settings.support_email ?? ""} />
          <Field state={state} name="support_url" label="Support page" type="url" defaultValue={settings.support_url ?? ""} placeholder="https://" />
        </div>
        <TextArea
          state={state}
          name="terms_and_conditions"
          label="Terms and conditions (HTML)"
          rows={14}
          defaultValue={settings.terms_and_conditions ?? ""}
          hint="Paragraphs, lists, bold, headings and links are kept; anything else is removed when shown."
          className="textarea font-mono text-xs"
        />
      </section>

      <div className="flex justify-end">
        <SaveButton>Save settings</SaveButton>
      </div>
    </form>
  );
}

/* Translations */

export function TranslationRow({ locale, translationKey, source, text }: { locale: string; translationKey: string; source: string; text: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveTranslation.bind(null, locale, translationKey), {});

  return (
    <form action={action} className="grid gap-2 border-b border-stone-100 px-4 py-3 last:border-0 md:grid-cols-2">
      <p className="text-sm text-stone-600" dir="auto">
        {source}
      </p>
      <div className="flex items-start gap-2">
        <textarea
          name="text"
          defaultValue={text ?? ""}
          rows={Math.min(4, Math.max(1, Math.ceil(source.length / 60)))}
          dir="auto"
          aria-label={`Translation of: ${source}`}
          className={`textarea min-h-0 flex-1 py-2 text-sm ${text ? "" : "border-amber-300 bg-amber-50"}`}
        />
        <SaveButton className="btn btn-outline btn-sm" pendingText="…">
          Save
        </SaveButton>
      </div>
      {(state.message || state.success) && <p className={`text-xs md:col-start-2 ${state.message ? "text-red-600" : "text-emerald-700"}`}>{state.message ?? state.success}</p>}
    </form>
  );
}

/* Email templates */

export function EmailTemplateEditor({ template }: { template: AdminEmailTemplate }) {
  const [state, action] = useActionState<FormState, FormData>(saveEmailTemplate.bind(null, template.name), {});
  const [html, setHtml] = useState(template.html);

  return (
    <details className="card overflow-hidden">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-5">
        <span className="font-bold text-stone-900">{template.label}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${template.is_custom ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-600"}`}>
          {template.is_custom ? "Edited" : "Built-in text"}
        </span>
      </summary>
      <div className="grid gap-6 border-t border-stone-100 p-5 lg:grid-cols-2">
        <form action={action} className="space-y-4">
          <Feedback state={state} />
          <Field state={state} name="subject" label="Subject" defaultValue={template.subject} required />
          <TextArea state={state} name="html" label="Text (HTML)" rows={12} value={html} onChange={(event) => setHtml(event.target.value)} className="textarea font-mono text-xs" required />
          <p className="text-xs text-stone-500">
            Placeholders:{" "}
            {template.placeholders.map((placeholder) => (
              <code key={placeholder} className="me-1 rounded bg-stone-100 px-1.5 py-0.5">
                {`{${placeholder}}`}
              </code>
            ))}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {template.is_custom && (
              <ActionButton action={() => resetEmailTemplate(template.name)} confirm="Go back to the built-in text?" className="btn btn-ghost btn-sm">
                Use built-in text
              </ActionButton>
            )}
            <SaveButton>Save template</SaveButton>
          </div>
        </form>
        <div>
          <p className="label">Preview</p>
          {/* Shown in a sandboxed frame: the HTML is the admin's own input and is cleaned again when saved. */}
          <iframe title={`Preview of ${template.label}`} sandbox="" srcDoc={`<div style="font-family:sans-serif;font-size:14px;padding:12px">${html}</div>`} className="mt-1 h-80 w-full rounded-xl border border-stone-200 bg-white" />
        </div>
      </div>
    </details>
  );
}

/* Text messages */

export function SmsForm() {
  const [state, action] = useActionState<FormState, FormData>(sendSms, {});
  const [audience, setAudience] = useState("numbers");
  const [message, setMessage] = useState("");

  return (
    <form
      action={action}
      onSubmit={(event) => audience !== "numbers" && !window.confirm("Send this message to all selected users?") && event.preventDefault()}
      className="card space-y-4 p-6"
    >
      <h2 className="text-lg">Compose SMS</h2>
      <Feedback state={state} />
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-3">
        <span className="text-sm font-semibold text-stone-700">All Tips User</span>
        <input type="checkbox" checked={audience === "tipped_users"} onChange={(event) => setAudience(event.target.checked ? "tipped_users" : "numbers")} className="h-5 w-5 accent-orange-500" />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-3">
        <span>
          <span className="block text-sm font-semibold text-stone-700">Unicode SMS</span>
          <span className="block text-xs text-stone-500">Off: accents and symbols are replaced by plain letters, so the message fits standard SMS.</span>
        </span>
        <input type="checkbox" name="unicode" defaultChecked className="h-5 w-5 accent-orange-500" />
      </label>
      <div className="field">
        <label className="label" htmlFor="audience">
          Send to
        </label>
        <select id="audience" name="audience" value={audience} onChange={(event) => setAudience(event.target.value)} className="input">
          <option value="numbers">Phone numbers</option>
          <option value="tipped_users">All Tips User (users who received tips)</option>
          <option value="all_users">All users with a phone number</option>
        </select>
      </div>
      {audience === "numbers" && (
        <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
          <Field state={state} name="country_code" label="Code" defaultValue="+31" required />
          <div className="field">
            <label className="label" htmlFor="phones">
              Sender number one by one with comma
            </label>
            <textarea id="phones" name="phones" rows={3} required placeholder="612345678, 687654321" className="textarea" />
            {state.errors?.phones && <p className="field-error">{state.errors.phones[0]}</p>}
          </div>
        </div>
      )}
      <div className="field">
        <label className="label" htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" rows={4} maxLength={480} value={message} onChange={(event) => setMessage(event.target.value)} className="textarea" required />
        <p className="text-xs text-stone-500">
          {message.length} / 480 characters · {Math.max(1, Math.ceil(message.length / 160))} SMS
        </p>
      </div>
      <div className="flex justify-end">
        <SaveButton pendingText="Sending…">Send SMS</SaveButton>
      </div>
    </form>
  );
}

/* Bulk sign-up */

export function ImportForm({ businesses, query }: { businesses: AdminBusiness[]; query: string }) {
  const [state, action] = useActionState<ImportState, FormData>(importAccounts, {});
  const [accountType, setAccountType] = useState<"private" | "business">("private");

  return (
    <div className="space-y-6">
      <form method="get" className="flex flex-wrap items-end gap-2">
        <div className="field">
          <label className="label" htmlFor="q">
            Find a business to add the people to
          </label>
          <input id="q" name="q" defaultValue={query} placeholder="Name or code" className="input" />
        </div>
        <button type="submit" className="btn btn-outline">
          Search
        </button>
      </form>

      <form action={action} className="card space-y-4 p-6">
        <Feedback state={state} />
        <fieldset>
          <legend className="label">Account type</legend>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
            {(["private", "business"] as const).map((type) => (
              <label key={type} className={`cursor-pointer rounded-lg px-4 py-2 text-center text-sm font-bold ${accountType === type ? "bg-menu text-stone-900 shadow-sm" : "text-stone-600"}`}>
                <input type="radio" name="account_type" value={type} checked={accountType === type} onChange={() => setAccountType(type)} className="sr-only" />
                {type === "private" ? "Private" : "Business"}
              </label>
            ))}
          </div>
          {accountType === "business" && <p className="mt-2 text-xs text-stone-500">The new accounts join the business you choose below.</p>}
        </fieldset>
        <fieldset>
          <legend className="label">{accountType === "business" ? "Select Business Name" : "Business (optional)"}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {accountType === "private" && (
              <label className="cursor-pointer rounded-xl border border-stone-200 px-4 py-3 has-checked:border-orange-500 has-checked:bg-orange-50">
                <input type="radio" name="business_id" value="" defaultChecked className="sr-only" />
                <span className="text-sm font-bold">No business</span>
              </label>
            )}
            {businesses.map((business) => (
              <label key={business.id} className="cursor-pointer rounded-xl border border-stone-200 px-4 py-3 has-checked:border-orange-500 has-checked:bg-orange-50">
                <input type="radio" name="business_id" value={business.id} required={accountType === "business"} className="sr-only" />
                <span className="block text-sm font-bold">{business.name}</span>
                <span className="block text-xs text-stone-500">
                  {business.code} · {business.team_size} in team
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field state={state} name="country_code" label="Phone country code" defaultValue="+31" required />
          <Field state={state} name="country" label="Country (2 letters)" defaultValue="NL" maxLength={2} required />
          <div className="field">
            <label className="label" htmlFor="theme">
              Business card design
            </label>
            <select id="theme" name="theme" defaultValue="1" className="input">
              <option value="1">Classic</option>
              <option value="2">Own colours</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="file">
            CSV file
          </label>
          <input id="file" type="file" name="file" accept=".csv,text/csv" required className="block w-full text-sm text-stone-600 file:me-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-bold" />
          {state.errors?.file && <p className="field-error">{state.errors.file[0]}</p>}
          <p className="text-xs text-stone-500">
            One person per line. <a href="/admin/import/template" className="font-semibold text-orange-600 underline">Download the column template</a>. Everyone gets an email to choose a password.
          </p>
        </div>
        <div className="field">
          <label className="label" htmlFor="import-message">
            Message
          </label>
          <textarea id="import-message" name="message" rows={3} maxLength={1000} placeholder="Message here" className="textarea" />
          <p className="text-xs text-stone-500">Added to the email everyone gets to choose a password.</p>
        </div>
        <div className="flex justify-end">
          <SaveButton pendingText="Creating accounts…">Create Users</SaveButton>
        </div>
      </form>

      {(state.created?.length || state.skipped?.length) && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card p-5">
            <h2 className="text-base">Created ({state.created?.length ?? 0})</h2>
            <ul className="mt-2 space-y-1 text-sm text-stone-600">
              {state.created?.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="text-base">Skipped ({state.skipped?.length ?? 0})</h2>
            <ul className="mt-2 space-y-1 text-sm text-stone-600">
              {state.skipped?.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

/** "Activate Free Plan" from the old Subscription List, with how many months to give. */
export function ActivateFreePlan({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(grantSubscription.bind(null, userId), {});

  if (state.success) {
    return <span className="badge bg-emerald-100 text-emerald-700">{state.success}</span>;
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
        Activate Free Plan
      </button>
    );
  }
  return (
    <form action={action} className="flex items-center gap-2">
      <select name="months" defaultValue={12} aria-label="Months" className="input w-28 py-1.5 text-sm">
        {[1, 3, 6, 12, 24, 60].map((months) => (
          <option key={months} value={months}>
            {months} {months === 1 ? "month" : "months"}
          </option>
        ))}
      </select>
      <SaveButton className="btn btn-primary btn-sm" pendingText="…">
        Activate
      </SaveButton>
      <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
        Cancel
      </button>
      {state.message && <span className="field-error">{state.message}</span>}
    </form>
  );
}

/** The old "All Users / Subscribed User / Unsubscribed User" dropdown. */
export function SubscribedFilter({ value }: { value: string }) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(event) => router.push(event.target.value ? `/admin/subscriptions?subscribed=${event.target.value}` : "/admin/subscriptions")}
      aria-label="Subscription List"
      className="input w-full sm:w-56"
    >
      <option value="">All Users</option>
      <option value="yes">Subscribed User</option>
      <option value="no">Unsubscribed User</option>
    </select>
  );
}
