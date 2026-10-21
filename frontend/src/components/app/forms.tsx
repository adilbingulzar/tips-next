"use client";

import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * Form helpers of the signed-in pages. Labels, hints, button texts and
 * messages are English texts and are translated here.
 */

export function SaveButton({
  children = "Save changes",
  pendingText = "Saving…",
  className = "btn btn-primary",
  disabled = false,
}: {
  children?: string;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? t(pendingText) : t(children)}
    </button>
  );
}

export function Feedback({ state }: { state: FormState }) {
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

type FieldProps = {
  state: FormState;
  name: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ state, name, label, hint, placeholder, ...input }: FieldProps) {
  const t = useT();
  const error = state.errors?.[name]?.[0];
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {t(label)}
      </label>
      <input
        id={name}
        name={name}
        className="input"
        placeholder={placeholder ? t(placeholder) : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...input}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs text-stone-500">
          {t(hint)}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export function TextArea({ state, name, label, hint, placeholder, ...textarea }: { state: FormState; name: string; label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const t = useT();
  const error = state.errors?.[name]?.[0];
  return (
    <div className="field">
      <label className="label" htmlFor={name}>
        {t(label)}
      </label>
      <textarea
        id={name}
        name={name}
        className="textarea"
        placeholder={placeholder ? t(placeholder) : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...textarea}
      />
      {hint && !error && <p className="text-xs text-stone-500">{t(hint)}</p>}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked: boolean }) {
  const t = useT();
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500" />
      <span>
        <span className="block text-sm font-semibold text-stone-800">{t(label)}</span>
        {hint && <span className="block text-xs text-stone-500">{t(hint)}</span>}
      </span>
    </label>
  );
}
