"use client";

import type { ReactNode } from "react";

import { useT } from "@/components/i18n/I18nProvider";

/** Dashed box for an empty list. A plain text child is translated. */
export function EmptyState({ children }: { children: ReactNode }) {
  const t = useT();
  return <div className="rounded-2xl border border-dashed border-stone-300 bg-surface px-6 py-16 text-center text-sm text-stone-500">{typeof children === "string" ? t(children) : children}</div>;
}
