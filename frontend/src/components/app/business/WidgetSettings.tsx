"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/actions/auth";
import { saveWidgetSettings } from "@/app/actions/business";
import { Feedback, SaveButton } from "@/components/app/forms";
import { useT } from "@/components/i18n/I18nProvider";

export type WidgetSettingsData = { business_id: number; frame: "full" | "fixed"; width: number; height: number; dark: boolean; scrollable: boolean };

/** Size and look of the review widget, with the code to paste into a website and a preview. */
export function WidgetSettings({ settings, siteUrl }: { settings: WidgetSettingsData; siteUrl: string }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(saveWidgetSettings, {});
  const [frame, setFrame] = useState(settings.frame);
  const [width, setWidth] = useState(settings.width);
  const [height, setHeight] = useState(settings.height);
  const [scrollable, setScrollable] = useState(settings.scrollable);
  const [copied, setCopied] = useState(false);

  const src = `${siteUrl}/widgets/review/${settings.business_id}`;
  const embed = `<iframe src="${src}" title="Reviews" width="${width}${frame === "full" ? "%" : ""}" height="${height}" style="border:0;max-width:100%" scrolling="${scrollable ? "yes" : "no"}" loading="lazy"></iframe>`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="card space-y-4 p-6">
        <h2 className="text-lg">{t("Widget settings")}</h2>
        <Feedback state={state} />
        <div className="field">
          <label className="label" htmlFor="frame">
            {t("Width")}
          </label>
          <select
            id="frame"
            name="frame"
            value={frame}
            onChange={(event) => {
              const next = event.target.value === "fixed" ? "fixed" : "full";
              setFrame(next);
              setWidth(next === "full" ? 100 : 400);
            }}
            className="input"
          >
            <option value="full">{t("Full width (percent)")}</option>
            <option value="fixed">{t("Fixed width (pixels)")}</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor="width">
              {frame === "full" ? t("Width in %") : t("Width in pixels")}
            </label>
            <input id="width" name="width" type="number" min={10} max={frame === "full" ? 100 : 2000} value={width} onChange={(event) => setWidth(Number(event.target.value))} className="input" required />
          </div>
          <div className="field">
            <label className="label" htmlFor="height">
              {t("Height in pixels")}
            </label>
            <input id="height" name="height" type="number" min={200} max={3000} value={height} onChange={(event) => setHeight(Number(event.target.value))} className="input" required />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-stone-800">
          <input type="checkbox" name="dark" defaultChecked={settings.dark} className="h-5 w-5 accent-orange-500" />
          {t("Dark theme")}
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-stone-800">
          <input type="checkbox" name="scrollable" checked={scrollable} onChange={(event) => setScrollable(event.target.checked)} className="h-5 w-5 accent-orange-500" />
          {t("Scrollable")}
        </label>
        <div className="field">
          <label className="label" htmlFor="embed">
            {t("Code for your website (HTML)")}
          </label>
          <textarea id="embed" readOnly value={embed} rows={4} className="textarea font-mono text-xs" onFocus={(event) => event.target.select()} />
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(embed);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2500);
            }}
            className="btn btn-outline btn-sm mt-2 self-start"
          >
            <span aria-live="polite">{copied ? t("Copied") : t("Copy code")}</span>
          </button>
        </div>
        <div className="flex justify-end">
          <SaveButton />
        </div>
      </form>
      <section className="space-y-3">
        <h2 className="text-lg">{t("Preview")}</h2>
        <p className="text-sm text-stone-500">{t("Save to see a new theme here.")}</p>
        <iframe src={src} title={t("Preview")} className="w-full card" style={{ height: Math.min(height, 700) }} />
      </section>
    </div>
  );
}
