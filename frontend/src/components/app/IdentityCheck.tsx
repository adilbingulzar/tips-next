"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getVerificationToken } from "@/app/actions/account";
import { useLocale, useT } from "@/components/i18n/I18nProvider";

type SumsubSdk = {
  init: (token: string, refresh: () => Promise<string>) => {
    withConf: (conf: Record<string, string>) => { on: (event: string, handler: (payload: unknown) => void) => { build: () => { launch: (selector: string) => void } } };
  };
};

declare global {
  interface Window {
    snsWebSdk?: SumsubSdk;
  }
}

/** Runs the Sumsub identity check in the page: photo of an ID document and a selfie. */
export function IdentityCheck() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const first = await getVerificationToken();
    if (!first.token || !window.snsWebSdk) {
      setError(first.message ?? "Identity verification could not be started. Please try again later.");
      return;
    }
    setStarted(true);
    window.snsWebSdk
      .init(first.token, async () => (await getVerificationToken()).token ?? "")
      .withConf({ lang: locale, theme: "light" })
      .on("idCheck.onApplicantSubmitted", () => router.refresh())
      .build()
      .launch("#sumsub-websdk-container");
  }

  return (
    <div className="space-y-4">
      <Script src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js" strategy="afterInteractive" onReady={() => setReady(true)} />
      {error && (
        <p role="alert" className="alert alert-error">
          {t(error)}
        </p>
      )}
      {!started && (
        <button type="button" onClick={start} disabled={!ready} className="btn btn-primary">
          {ready ? t("Start verification") : t("Loading…")}
        </button>
      )}
      <div id="sumsub-websdk-container" className="min-h-0" />
    </div>
  );
}
