"use client";

import { useActionState, useState } from "react";

import { type FormState, register } from "@/app/actions/auth";
import { useLocale, useT } from "@/components/i18n/I18nProvider";
import { COUNTRIES } from "@/lib/countries";

import { FieldError, FormMessage, PasswordInput, SubmitButton } from "./FormBits";

function TextField({ state, name, label, ...input }: { state: FormState; name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const t = useT();
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {t(label)}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={state.values?.[name]}
        className="input"
        aria-invalid={Boolean(state.errors?.[name])}
        aria-describedby={state.errors?.[name] ? `${name}-error` : undefined}
        {...input}
      />
      <FieldError state={state} name={name} />
    </div>
  );
}

export function RegisterForm({ referral }: { referral?: string }) {
  const t = useT();
  const { locale } = useLocale();
  const regionName = (code: string) => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(code);
    } catch {
      return undefined;
    }
  };
  const [state, action] = useActionState<FormState, FormData>(register, {});
  const [accountType, setAccountType] = useState(state.values?.account_type ?? "private");
  const [country, setCountry] = useState(state.values?.country ?? "");
  const [dialCode, setDialCode] = useState(state.values?.country_code ?? "31");
  const dialCodes = [...new Set(COUNTRIES.map((entry) => entry.dial))].sort((a, b) => Number(a) - Number(b));

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />

      <fieldset>
        <legend className="label">{t("Account type")}</legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
          {[
            { value: "private", label: "Private" },
            { value: "business", label: "Business" },
          ].map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg px-4 py-2 text-center text-sm font-bold transition ${accountType === option.value ? "bg-menu text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
            >
              <input type="radio" name="account_type" value={option.value} checked={accountType === option.value} onChange={() => setAccountType(option.value)} className="sr-only" />
              {t(option.label)}
            </label>
          ))}
        </div>
        <FieldError state={state} name="account_type" />
      </fieldset>

      {accountType === "business" && <TextField state={state} name="business_name" label="Business name" autoComplete="organization" required />}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField state={state} name="first_name" label="First name" placeholder={t("First name")} autoComplete="given-name" required />
        <TextField state={state} name="last_name" label="Last name" placeholder={t("Last name")} autoComplete="family-name" required />
      </div>

      <TextField state={state} name="email" label="Email id" placeholder={t("Your email")} type="email" autoComplete="email" required />

      <div className="field">
        <label className="label" htmlFor="country">
          {t("Select country")}
        </label>
        <select
          id="country"
          name="country"
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setDialCode(COUNTRIES.find((entry) => entry.code === event.target.value)?.dial ?? dialCode);
          }}
          className="input"
          required
        >
          <option value="" disabled>
            {t("Select Country")}
          </option>
          {COUNTRIES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {regionName(entry.code) ?? entry.name}
            </option>
          ))}
        </select>
        <FieldError state={state} name="country" />
      </div>

      <div className="field">
        <label className="label" htmlFor="phone">
          {t("Phone with country code")}
        </label>
        <div className="flex gap-2">
          <select name="country_code" value={dialCode} onChange={(event) => setDialCode(event.target.value)} aria-label={t("Country code")} className="input w-28 shrink-0">
            {dialCodes.map((code) => (
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
            autoComplete="tel-national"
            required
            defaultValue={state.values?.phone}
            placeholder={t("Enter phone number")}
            className="input"
            aria-invalid={Boolean(state.errors?.phone)}
            aria-describedby={state.errors?.phone ? "phone-error" : undefined}
          />
        </div>
        <FieldError state={state} name="phone" />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          {t("Choose a good unique password")}
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Enter password" invalid={Boolean(state.errors?.password)} />
        <FieldError state={state} name="password" />
      </div>

      <div className="field">
        <label className="label" htmlFor="password_confirmation">
          {t("Repeat password")}
        </label>
        <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" placeholder="Enter repeat password" />
      </div>

      <TextField state={state} name="referral" label="Referral ID (optional)" placeholder={t("Enter referral id")} defaultValue={state.values?.referral ?? referral} autoComplete="off" />

      <div>
        <label className="flex items-start gap-3 text-sm text-stone-600">
          <input type="checkbox" name="accept_terms" className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500" required />
          <span>
            {t("I agree with terms & conditions")}{" "}
            <a href="/terms" target="_blank" className="font-semibold text-orange-600 hover:underline">
              {t("Term And Conditions")}
            </a>
          </span>
        </label>
        <FieldError state={state} name="accept_terms" />
      </div>

      <SubmitButton pendingText="Creating account…">Register Account</SubmitButton>
    </form>
  );
}
