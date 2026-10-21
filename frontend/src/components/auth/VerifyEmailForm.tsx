"use client";

import { useActionState, useTransition, useState } from "react";

import { type FormState, resendVerificationCode, verifyEmail } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

import { FieldError, FormMessage, SubmitButton } from "./FormBits";

export function VerifyEmailForm() {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(verifyEmail, {});
  const [resendState, setResendState] = useState<FormState>({});
  const [resending, startResend] = useTransition();

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <div className="field">
          <label className="label" htmlFor="code">
            {t("Verification code")}
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="123456"
            className="input text-center font-display text-2xl tracking-[0.5em]"
            aria-invalid={Boolean(state.errors?.code)}
            aria-describedby={state.errors?.code ? "code-error" : undefined}
          />
          <FieldError state={state} name="code" />
        </div>
        <SubmitButton pendingText="Checking…">Confirm email</SubmitButton>
      </form>

      <FormMessage state={resendState} />
      <button
        type="button"
        disabled={resending}
        onClick={() => startResend(async () => setResendState(await resendVerificationCode()))}
        className="btn btn-ghost btn-block"
      >
        {resending ? t("Sending…") : t("Send me a new code")}
      </button>
    </div>
  );
}
