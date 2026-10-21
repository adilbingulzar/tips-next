"use client";

import { useActionState, useState } from "react";

import { updateAccount } from "@/app/actions/account";
import type { FormState } from "@/app/actions/auth";
import { PasswordInput } from "@/components/auth/FormBits";
import { useT } from "@/components/i18n/I18nProvider";
import { COUNTRIES } from "@/lib/countries";
import type { CurrentUser } from "@/lib/types";

import { Feedback, SaveButton } from "./forms";

const DIAL_CODES = [...new Set(COUNTRIES.map((country) => country.dial))].sort((a, b) => Number(a) - Number(b));

function Error({ state, name }: { state: FormState; name: string }) {
  const message = state.errors?.[name]?.[0];
  return message ? <p className="field-error">{message}</p> : null;
}

/** The old "Account" page: one form for email, phone, password and account status. */
export function AccountForm({ user }: { user: CurrentUser }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(updateAccount, {});
  const [status, setStatus] = useState<string>(user.status === "deactivated" ? "deactivated" : "active");

  return (
    <form action={action} className="card mx-auto max-w-2xl">
      <div className="card-body space-y-5">
        <Feedback state={state} />

        <div className="field">
          <label className="label" htmlFor="email">
            {t("Email id")}
          </label>
          <input id="email" name="email" type="email" defaultValue={user.email} placeholder={t("Your email")} required autoComplete="email" className="input" />
          <Error state={state} name="email" />
        </div>

        <div className="field">
          <label className="label" htmlFor="phone">
            {t("Phone number")}
          </label>
          <div className="flex gap-2">
            <select name="country_code" defaultValue={user.country_code ?? ""} aria-label={t("Country code")} className="input w-28 shrink-0">
              <option value="">–</option>
              {DIAL_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={user.phone ?? ""}
              placeholder={t("Enter phone number")}
              autoComplete="tel-national"
              className="input"
            />
          </div>
          <Error state={state} name="phone" />
          <Error state={state} name="country_code" />
        </div>

        <div className="field">
          <label className="label" htmlFor="old_password">
            {t("Old password")}
          </label>
          <PasswordInput id="old_password" name="old_password" autoComplete="current-password" placeholder="Enter password" invalid={Boolean(state.errors?.old_password)} />
          <Error state={state} name="old_password" />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            {t("New password")}
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Enter new password" invalid={Boolean(state.errors?.password)} />
          <Error state={state} name="password" />
        </div>

        <div className="field">
          <label className="label" htmlFor="password_confirmation">
            {t("Repeat new password")}
          </label>
          <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" placeholder="Enter repeat password" />
        </div>

        <div className="field">
          <label className="label" htmlFor="status">
            {t("Account Status")}
          </label>
          <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value)} className="input">
            <option value="active">{t("Active")}</option>
            <option value="deactivated">{t("Temporary Deactive")}</option>
            <option value="delete">{t("Permanently Delete")}</option>
          </select>
          {status === "deactivated" && <p className="text-xs text-stone-500">{t("While deactivated you get no share of team and spot tips.")}</p>}
        </div>

        {status === "delete" && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
            <label className="flex items-start gap-3 text-sm text-stone-700">
              <input type="checkbox" name="confirm_delete" className="mt-0.5 h-4 w-4 accent-red-600" />
              <span>{t("I confirm to permanently delete my account")}</span>
            </label>
            {user.account_type === "business" && <p className="text-xs text-red-700">{t("Your business is closed and its team and spot pages stop working.")}</p>}
            <Error state={state} name="confirm_delete" />
          </div>
        )}
      </div>

      <div className="border-t border-stone-100 p-6">
        <SaveButton className={`btn btn-lg btn-block ${status === "delete" ? "bg-red-600 text-white hover:bg-red-700" : "btn-primary"}`}>Update Account</SaveButton>
      </div>
    </form>
  );
}
