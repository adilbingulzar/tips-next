"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/actions/auth";
import { requestPayout, updateBankAccount, updatePayoutSettings } from "@/app/actions/settings";
import { money } from "@/lib/format";

import { SolidIcon, type SolidIconName } from "./SolidIcons";
import { Feedback, Field, SaveButton } from "./forms";
import { useT } from "@/components/i18n/I18nProvider";

export type PayoutOverview = {
  balance: string;
  fee: string;
  net: string;
  minimum: string;
  can_request: boolean;
  reason: string | null;
  subscription?: { required: boolean; allows_payout: boolean; trial_ends_on: string | null };
  settings: { schedule: "manual" | "daily" | "weekly" | "monthly"; platform_fee_paid_by: "recipient" | "customer" };
  fees: Record<string, { percent: string; fixed: string }>;
  bank_account: { bank_name: string; account_name: string; account_type: number; account_number: string; swift_code: string | null } | null;
  breakdown: { tips: string; spots: string; referrals: string };
  processing: string;
  recent_withdrawals: { id: number; amount: string; status: "requested" | "paid"; requested_at: string | null }[];
  recent_referrals: { id: number; amount: string; created_at: string | null }[];
};

/** The old "Transfer Balance" card: the button says why a transfer is not possible yet. */
export function TransferCard({ overview }: { overview: PayoutOverview }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(requestPayout, {});
  const error = state.errors?.payout?.[0];
  const autoPay = overview.settings.schedule !== "manual";
  const needsPlan = overview.subscription ? !overview.subscription.allows_payout : false;
  const needsBank = overview.bank_account === null;

  const label = autoPay ? "Auto Pay Active" : needsPlan ? "Get Subscription" : needsBank ? "Update Bank" : "Transfer Balance";
  const note = autoPay
    ? "Your autopay settings is active"
    : needsPlan
      ? "You need to get subscription plan to transfer balance"
      : needsBank
        ? "You need to update the bank account to transfer the balance"
        : overview.subscription?.trial_ends_on
          ? t("Your free trial ends on {date}.", { date: overview.subscription.trial_ends_on })
          : (overview.reason ?? "");

  return (
    <div className="stat flex flex-col">
      <p className="stat-label flex items-center gap-1">
        <SolidIcon name="bank" className="h-4 w-4 text-orange-500" /> {t("Transfer Balance")}
      </p>
      <p className="mt-2 flex-1 text-sm text-stone-500">{t("Transfer balance to your bank account")}</p>
      {needsPlan && !autoPay ? (
        <a href="/dashboard/plan" className="btn btn-primary mt-4">
          {t(label)}
        </a>
      ) : needsBank && !autoPay ? (
        <a href="/dashboard/bank#bank-account" className="btn btn-primary mt-4">
          {t(label)}
        </a>
      ) : (
        <form action={action} className="mt-4">
          <SaveButton className="btn btn-primary btn-block disabled:opacity-60" pendingText="Requesting…" disabled={autoPay || !overview.can_request}>
            {label}
          </SaveButton>
        </form>
      )}
      {(state.success || state.message || error) && (
        <p role="status" className="mt-3 text-sm font-semibold text-stone-700">
          {t(state.success ?? error ?? state.message ?? "")}
        </p>
      )}
      {note && <p className="mt-3 text-xs text-stone-500">ⓘ {t(note)}</p>}
      {overview.can_request && !autoPay && (
        <p className="mt-1 text-xs text-stone-500">{t("{fee} payout fee, {net} reaches your bank.", { fee: money(overview.fee), net: money(overview.net) })}</p>
      )}
    </div>
  );
}

/** Copies the user's referral sign-up link, as the old "Invitation Link" button did. */
export function InvitationLinkButton({ link }: { link: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={t("Referrer and earn reward money")}
      onClick={() => {
        void navigator.clipboard.writeText(link).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="btn btn-secondary btn-sm"
    >
      🔗 {t(copied ? "Copied!" : "Invitation Link")}
    </button>
  );
}

/** Two-option switch in the old style, such as manual or automatic transfer. */
function Segmented<T extends string>({ name, value, options, onChange }: { name: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
      {options.map((option) => (
        <label key={option.value} className={`cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-bold transition ${value === option.value ? "bg-menu text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
          {t(option.label)}
        </label>
      ))}
    </div>
  );
}

function SettingsCard({ icon, title, children, footer }: { icon: SolidIconName; title: string; children: React.ReactNode; footer: React.ReactNode }) {
  const t = useT();
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center gap-2">
          <SolidIcon name={icon} className="h-5 w-5 text-orange-500" />
          {t(title)}
        </h2>
      </div>
      <div className="card-body space-y-4">{children}</div>
      <div className="border-t border-stone-100 p-6">{footer}</div>
    </section>
  );
}

/** "Payout Settings": pay out by hand, or automatically on a schedule. */
export function PayoutScheduleForm({ overview }: { overview: PayoutOverview }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updatePayoutSettings, {});
  const [mode, setMode] = useState<"manual" | "auto">(overview.settings.schedule === "manual" ? "manual" : "auto");
  const fee = (schedule: string) => {
    const rate = overview.fees[schedule];
    return rate ? `${rate.percent}%${Number(rate.fixed) > 0 ? ` + ${money(rate.fixed)}` : ""}` : "";
  };

  return (
    <form action={action}>
      <SettingsCard icon="money" title="Payout Settings" footer={<SaveButton className="btn btn-primary btn-lg btn-block">Update Settings</SaveButton>}>
        <Feedback state={state} />
        <input type="hidden" name="platform_fee_paid_by" value={overview.settings.platform_fee_paid_by} />
        <Segmented
          name="mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "manual", label: "Manual Transfer" },
            { value: "auto", label: "Auto Transfer" },
          ]}
        />
        {mode === "manual" ? (
          <>
            <input type="hidden" name="schedule" value="manual" />
            <p className="text-sm text-stone-500">{t("This option allows you to make your payout at any time, by yourself")}</p>
            <p className="text-xs text-stone-400">{t("Payout fee: {fee}", { fee: fee("manual") })}</p>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-500">{t("Payment will be done automatically on a scheduled basis.")}</p>
            <div className="field">
              <label className="label" htmlFor="schedule">
                {t("Payout duration")}
              </label>
              <select id="schedule" name="schedule" defaultValue={overview.settings.schedule === "manual" ? "weekly" : overview.settings.schedule} className="input">
                <option value="daily">
                  {t("Daily Transfer")} ({fee("daily")})
                </option>
                <option value="weekly">
                  {t("Weekly Transfer")} ({fee("weekly")})
                </option>
                <option value="monthly">
                  {t("Monthly Transfer")} ({fee("monthly")})
                </option>
              </select>
            </div>
          </>
        )}
      </SettingsCard>
    </form>
  );
}

/** "Tax": who pays the platform fee on tips. */
export function TaxForm({ overview }: { overview: PayoutOverview }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updatePayoutSettings, {});
  const [payer, setPayer] = useState(overview.settings.platform_fee_paid_by);

  return (
    <form action={action}>
      <SettingsCard icon="fileLines" title="Tax" footer={<SaveButton className="btn btn-primary btn-lg btn-block">Update Settings</SaveButton>}>
        <Feedback state={state} />
        <input type="hidden" name="schedule" value={overview.settings.schedule} />
        <Segmented
          name="platform_fee_paid_by"
          value={payer}
          onChange={setPayer}
          options={[
            { value: "recipient", label: "Waiter" },
            { value: "customer", label: "Customer" },
          ]}
        />
        <p className="text-sm text-stone-500">{t(payer === "recipient" ? "Fees will be deducted from waiter's account" : "Fees will be deducted from customer's account")}</p>
      </SettingsCard>
    </form>
  );
}

/** "Bank account settings", with the account number typed twice as in the old app. */
export function BankAccountForm({ account }: { account: PayoutOverview["bank_account"] }) {
  const [state, action] = useActionState<FormState, FormData>(updateBankAccount, {});

  return (
    <form action={action}>
      <SettingsCard icon="bank" title="Bank account settings" footer={<SaveButton className="btn btn-primary btn-lg btn-block">Update Account</SaveButton>}>
        <Feedback state={state} />
        <input type="hidden" name="account_type" value={account?.account_type ?? 1} />
        <Field state={state} name="account_name" label="Name on bank account" defaultValue={account?.account_name ?? ""} required autoComplete="name" />
        <Field state={state} name="bank_name" label="Bank Name" defaultValue={account?.bank_name ?? ""} required />
        <Field state={state} name="swift_code" label="Swift BIC" defaultValue={account?.swift_code ?? ""} autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            state={state}
            name="account_number"
            label="Account Number"
            required
            placeholder={account?.account_number ?? "NL91 ABNA 0417 1643 00"}
            autoComplete="off"
            spellCheck={false}
            hint={account ? "Enter the full account number again to change it." : undefined}
          />
          <Field state={state} name="account_number_confirmation" label="Re-Type Account Number" required autoComplete="off" spellCheck={false} onPaste={(event) => event.preventDefault()} />
        </div>
      </SettingsCard>
    </form>
  );
}
