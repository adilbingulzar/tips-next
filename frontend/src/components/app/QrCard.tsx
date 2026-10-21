"use client";

import QRCode from "qrcode";
import { useActionState, useEffect, useState } from "react";

import type { FormState } from "@/app/actions/auth";
import { updateQr } from "@/app/actions/settings";
import { useT } from "@/components/i18n/I18nProvider";

import { Feedback, SaveButton } from "./forms";

type Props = { url: string; header: string; title: string };

/** Colours of the five faces on the old printed card, from unhappy to delighted. */
const FACES = [
  { color: "#D83D56", mouth: "M8 17c1.5-2 6.5-2 8 0" },
  { color: "#EE7457", mouth: "M8.5 16.5c1.5-1 5.5-1 7 0" },
  { color: "#FBC721", mouth: "M8.5 15.5h7" },
  { color: "#2FA18D", mouth: "M8.5 14.5c1.5 1.5 5.5 1.5 7 0" },
  { color: "#51B477", mouth: "M8 14c1.5 3 6.5 3 8 0" },
];

/**
 * The old "Business QR" page: a printable card (heading, name, faces and
 * the QR code) with the two texts to customise next to it. The QR code is
 * drawn in the browser from the user's review page URL.
 */
export function QrCard({ url, header, title }: Props) {
  const t = useT();
  const [svg, setSvg] = useState("");
  const [state, action] = useActionState<FormState, FormData>(updateQr, {});
  const [heading, setHeading] = useState(header);
  const [name, setName] = useState(title);

  useEffect(() => {
    QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#1c1917", light: "#ffffff" } }).then(setSvg);
  }, [url]);

  async function download() {
    const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: 1200 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    link.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="grid place-items-center rounded-2xl border border-stone-200 bg-stone-100 p-6 print:border-0 print:bg-white print:p-0">
        <div id="qr-card" data-theme="light" className="flex aspect-[1/1.3] w-full max-w-sm flex-col items-center justify-center border-2 border-dashed border-stone-900 bg-white px-6 py-10 text-center">
          <p className="font-display text-xl font-extrabold text-stone-900">{heading}</p>
          <p className="mt-3 font-bold text-stone-900">{name}</p>
          <div className="mt-4 flex gap-2" aria-hidden="true">
            {FACES.map((face) => (
              <svg key={face.color} viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="11" fill={face.color} stroke="none" />
                <circle cx="9" cy="10" r="1.2" fill="#fff" stroke="none" />
                <circle cx="15" cy="10" r="1.2" fill="#fff" stroke="none" />
                <path d={face.mouth} />
              </svg>
            ))}
          </div>
          <div className="mt-6 w-32" role="img" aria-label={t("QR code for {url}", { url })} dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      </section>

      <form action={action} className="card self-start print:hidden">
        <div className="card-header">
          <h2 className="card-title">{t("Customize")}</h2>
        </div>
        <div className="card-body space-y-4">
          <Feedback state={state} />
          <div className="field">
            <label className="label" htmlFor="header">
              {t("Page header")}
            </label>
            <input id="header" name="header" value={heading} onChange={(event) => setHeading(event.target.value)} maxLength={100} className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="title">
              {t("Business or User Name")}
            </label>
            <input id="title" name="title" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="input" />
          </div>
          <p className="text-xs text-stone-500">{t("The code always opens your review page, so cards you printed before keep working.")}</p>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-stone-100 p-6">
          <SaveButton className="btn btn-primary flex-1">Update</SaveButton>
          <button type="button" onClick={() => window.print()} className="btn btn-secondary flex-1">
            {t("Print")}
          </button>
          <button type="button" onClick={download} className="btn btn-outline btn-block">
            {t("Download PNG")}
          </button>
        </div>
      </form>
    </div>
  );
}
