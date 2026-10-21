"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const t = useT();
  const message = state.errors?.[name]?.[0];
  return message ? (
    <p id={`${name}-error`} className="field-error">
      {t(message)}
    </p>
  ) : null;
}

export function FormMessage({ state }: { state: FormState }) {
  const t = useT();
  if (state.success) {
    return (
      <p role="status" className="alert alert-success">
        {t(state.success)}
      </p>
    );
  }
  if (state.message) {
    return (
      <p role="alert" className="alert alert-error">
        {t(state.message)}
      </p>
    );
  }
  return null;
}

export function SubmitButton({ children, pendingText }: { children: string; pendingText: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-block">
      {pending ? t(pendingText) : t(children)}
    </button>
  );
}

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  invalid?: boolean;
  placeholder?: string;
};

export function PasswordInput({ id, name, autoComplete, invalid, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const t = useT();

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        placeholder={placeholder ? t(placeholder) : undefined}
        className="input pe-12"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-stone-400 hover:text-stone-700"
        aria-label={visible ? t("Hide password") : t("Show password")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
