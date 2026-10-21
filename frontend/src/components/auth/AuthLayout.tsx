import type { ReactNode } from "react";

import { NavGlyph } from "@/components/app/NavIcons";
import { getI18n } from "@/lib/i18n";

import { PublicHeader } from "./PublicHeader";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** The two parts of the line under the headline. */
  tagline?: [string, string];
};

const CHIPS = [
  ["euro", "Tips"],
  ["star", "Reviews"],
  ["card", "Business card"],
  ["money", "Payouts"],
] as const;

/**
 * Two columns as on Alfred's sign-in screens: a headline with what the site does,
 * and the form in a card. On a narrow screen only the card is shown.
 */
export async function AuthLayout({ title, subtitle, children, footer, tagline = ["Turn every great service into", "a tip worth giving."] }: Props) {
  const { t } = await getI18n();
  const short = (subtitle ?? "").length <= 40;
  const headline = subtitle && short ? subtitle : title;

  return (
    <div className="public-page">
      <PublicHeader />
      <main className="l26">
        <div className="l26-grid">
          <div className="l26-intro">
            {headline !== title && (
              <span className="l26-badge">
                <i className="l26-dot" aria-hidden="true" />
                {t(title)}
              </span>
            )}
            <h1 className="l26-title">{t(headline)}</h1>
            <p className="l26-lead">
              {t(tagline[0])} {t(tagline[1])}
            </p>
            <ul className="l26-chips">
              {CHIPS.map(([icon, label]) => (
                <li key={label} className="l26-chip">
                  <NavGlyph name={icon} />
                  <span>{t(label)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="l26-card">
            <div className="l26-card-head">
              <h2 className="text-2xl">{t(headline)}</h2>
            </div>
            {subtitle && !short && <p className="mb-5 text-sm text-stone-600">{t(subtitle)}</p>}
            {children}
            {footer && <div className="l26-foot">{footer}</div>}
            <p className="l26-secure">
              <i className="l26-dot" aria-hidden="true" />
              <NavGlyph name="shield" className="h-3.5 w-3.5" />
              {t("Secure login — Your data is safe with us.")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
