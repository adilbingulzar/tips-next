"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type FormState, login } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

import { FieldError, FormMessage, PasswordInput, SubmitButton } from "./FormBits";

export function LoginForm({ next, notice, error }: { next?: string; notice?: string; error?: string }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(login, { success: notice, message: error });

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />

      <div className="field">
        <label className="label" htmlFor="email">
          {t("Email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          placeholder={t("Enter email")}
          className="input"
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
        />
        <FieldError state={state} name="email" />
      </div>

      <div className="field">
        <div className="flex items-baseline justify-between gap-3">
          <label className="label" htmlFor="password">
            {t("Password")}
          </label>
          <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:underline">
            {t("Forgot password?")}
          </Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Enter password" invalid={Boolean(state.errors?.password)} />
        <FieldError state={state} name="password" />
      </div>

      <SubmitButton pendingText="Logging in…">Login</SubmitButton>
    </form>
  );
}
