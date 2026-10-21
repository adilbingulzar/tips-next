"use client";

import { useState, useTransition } from "react";

import type { FormState } from "@/app/actions/auth";
import { useT } from "@/components/i18n/I18nProvider";

type Props = {
  action: () => Promise<FormState>;
  children: string;
  pendingText?: string;
  /** Ask before running, e.g. for removing someone. */
  confirm?: string;
  className?: string;
};

/** A button that runs a server action and shows its error, if any. */
export function ActionButton({ action, children, pendingText = "…", confirm, className = "btn btn-outline btn-sm" }: Props) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          if (confirm && !window.confirm(t(confirm))) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await action();
            if (result.message) {
              setError(result.message);
            }
          });
        }}
      >
        {pending ? t(pendingText) : t(children)}
      </button>
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {t(error)}
        </span>
      )}
    </span>
  );
}
