"use client";

import { useActionState } from "react";

import { type FormState, forgotPassword, resetPassword } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

import { FieldError, FormMessage, PasswordInput, SubmitButton } from "./FormBits";

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(forgotPassword, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="field">
        <label className="label" htmlFor="email">
          {t("Email ID")}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} placeholder={t("Email ID")} className="input" />
        <FieldError state={state} name="email" />
      </div>
      <SubmitButton pendingText="Sending…">submit</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(resetPassword, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <FormMessage state={state} />
      <FieldError state={state} name="email" />
      <div className="field">
        <label className="label" htmlFor="password">
          {t("New password")}
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={Boolean(state.errors?.password)} />
        <p className="text-xs text-stone-500">{t("At least 8 characters, with letters and numbers.")}</p>
        <FieldError state={state} name="password" />
      </div>
      <div className="field">
        <label className="label" htmlFor="password_confirmation">
          {t("Repeat new password")}
        </label>
        <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" />
      </div>
      <SubmitButton pendingText="Saving…">Set new password</SubmitButton>
    </form>
  );
}
