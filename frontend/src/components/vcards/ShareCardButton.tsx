"use client";

import { useState } from "react";

import { useT } from "@/components/i18n/I18nProvider";

import { Icon } from "./icons";

/** Opens the phone's share sheet, or copies the link where sharing is not available. */
export function ShareCardButton({ name, className, style }: { name: string; className: string; style: React.CSSProperties }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("#")[0] ?? window.location.href;
    if (navigator.share) {
      await navigator.share({ title: name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button type="button" onClick={share} className={className} style={style}>
      <Icon name="share" />
      <span aria-live="polite">{copied ? t("Link copied") : t("Share card")}</span>
    </button>
  );
}
