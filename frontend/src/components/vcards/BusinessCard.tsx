import Link from "next/link";
import type { CSSProperties } from "react";

import { Avatar } from "@/components/tips/Avatar";
import { LanguageMenu } from "@/components/i18n/LanguageMenu";
import type { PublicVcard } from "@/lib/types";
import { getI18n } from "@/lib/i18n";

import { Icon, networkName } from "./icons";
import { ShareCardButton } from "./ShareCardButton";

const DAY_NAMES: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

/**
 * The public business card, in the owner's colours: primary colours for the
 * header and highlighted blocks, secondary colours for the rest.
 */
export async function BusinessCard({ card }: { card: PublicVcard }) {
  const { t } = await getI18n();
  const { colors } = card;
  const primary: CSSProperties = { backgroundColor: colors.primary_background, color: colors.primary_text };
  const secondary: CSSProperties = { backgroundColor: colors.secondary_background, color: colors.secondary_text };
  const primaryButton: CSSProperties = { backgroundColor: colors.primary_button, color: colors.primary_button_text };
  const secondaryButton: CSSProperties = { backgroundColor: colors.secondary_button, color: colors.secondary_button_text };
  const button = "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-bold shadow-sm transition-opacity hover:opacity-90";
  const hero: CSSProperties = card.business.banner
    ? { ...primary, backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url("${card.business.banner}")`, backgroundSize: "cover", backgroundPosition: "center", color: "#ffffff" }
    : primary;
  const openingDays = card.opening_hours ? Object.entries(card.opening_hours) : [];
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";

  return (
    <main data-theme="light" className="min-h-dvh bg-stone-900 sm:py-6">
      <article className="mx-auto max-w-md overflow-hidden shadow-2xl sm:rounded-3xl" style={secondary}>
        <header className="relative px-6 pt-10 pb-24 text-center" style={hero}>
          {card.business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- user uploads on another host, any size
            <img src={card.business.logo} alt={card.business.name ?? t("Logo")} className="mx-auto mb-4 max-h-28 max-w-60 object-contain" />
          ) : (
            card.business.name && <p className="mb-2 font-display text-2xl font-extrabold">{card.business.name}</p>
          )}
          <h1 className="text-inherit font-display text-3xl font-extrabold">{card.name}</h1>
          {card.business.title && (
            <p className="mt-1 flex items-center justify-center gap-2 font-semibold opacity-90">
              {card.icons.business && <Icon name="briefcase" className="h-4 w-4" />}
              {card.business.title}
            </p>
          )}
          {card.bio && card.bio.trim() !== "-" && <p className="mx-auto mt-4 max-w-xs text-sm whitespace-pre-line opacity-90">{card.bio}</p>}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white [&_.tip-avatar]:h-32 [&_.tip-avatar]:w-32 [&_.tip-avatar]:border-0 [&_.tip-avatar]:text-3xl">
            <Avatar name={card.name} src={card.avatar} />
          </div>
        </header>

        <section className="space-y-4 px-6 pt-20 pb-8" style={secondary}>
          <a href={`/vcards/${card.slug}/vcf`} className={button} style={secondaryButton}>
            <Icon name="bookmark" />
            {t("Save card")}
          </a>
          {(card.wallets.apple || card.wallets.google) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {card.wallets.apple && (
                <a href={`/vcards/${card.slug}/wallet/apple`} className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white">
                  <Icon name="wallet" />
                  {t("Add to Apple Wallet")}
                </a>
              )}
              {card.wallets.google && (
                <a href={`/vcards/${card.slug}/wallet/google`} className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white">
                  <Icon name="wallet" />
                  {t("Add to Google Wallet")}
                </a>
              )}
            </div>
          )}
          <ul className="divide-y" style={{ borderColor: colors.border }}>
            {card.business.email && (
              <li className="py-3">
                <a href={`mailto:${card.business.email}`} className="flex items-center gap-3 break-all hover:underline">
                  {card.icons.email && <Icon name="mail" className="h-5 w-5 shrink-0" />}
                  {card.business.email}
                </a>
              </li>
            )}
            {card.phone && (
              <li className="py-3">
                <a href={`tel:${card.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:underline">
                  {card.icons.phone && <Icon name="phone" className="h-5 w-5 shrink-0" />}
                  {card.phone}
                </a>
              </li>
            )}
            {card.business.address && (
              <li className="flex items-start gap-3 py-3">
                {card.icons.address && <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0" />}
                <span className="whitespace-pre-line">{card.business.address}</span>
              </li>
            )}
          </ul>
        </section>

        {card.business.address && (
          <section className="px-6 pb-8" style={secondary}>
            <h2 className="text-inherit mb-4 text-xl font-bold">{t("Location")}</h2>
            <iframe
              title={t("Map of {address}", { address: card.business.address })}
              src={`https://www.google.com/maps?q=${encodeURIComponent(card.business.address)}&output=embed`}
              className="aspect-square w-full rounded-2xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.business.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold underline"
            >
              {t("Open in Maps")}
            </a>
          </section>
        )}

        {openingDays.some(([, ranges]) => ranges.length > 0) && (
          <section className="px-6 py-8" style={primary}>
            <h2 className="text-inherit mb-4 text-xl font-bold">{t("Opening hours")}</h2>
            <dl className="divide-y" style={{ borderColor: colors.border }}>
              {openingDays.map(([day, ranges]) => (
                <div key={day} className="flex justify-between gap-4 py-2 text-sm">
                  <dt className="font-semibold">{t(DAY_NAMES[day] ?? day)}</dt>
                  <dd className="text-end">{ranges.length === 0 ? t("Closed") : ranges.map((range) => `${range.from} – ${range.to}`).join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {card.links.appointment && (
          <section className="px-6 py-8" style={secondary}>
            <h2 className="text-inherit mb-4 text-xl font-bold">{t("Make an appointment")}</h2>
            <a href={card.links.appointment} target="_blank" rel="noopener noreferrer" className={button} style={secondaryButton}>
              <Icon name="calendar" />
              {t("Book an appointment")}
            </a>
          </section>
        )}

        <section className="space-y-3 px-6 py-8" style={{ background: `linear-gradient(180deg, ${colors.primary_background} 0%, ${colors.secondary_background} 100%)`, color: colors.primary_text }}>
          <h2 className="text-inherit text-xl font-bold">{t("More")}</h2>
          <ShareCardButton name={card.name} className={button} style={secondaryButton} />
          {card.phone && (
            <a href={`tel:${card.phone.replace(/\s/g, "")}`} className={button} style={secondaryButton}>
              <Icon name="phone" />
              {t("Contact me")}
            </a>
          )}
        </section>

        {card.reviews.length > 0 && (
          <section className="px-6 py-8" style={primary}>
            <h2 className="text-inherit mb-4 text-xl font-bold">{t("Reviews")}</h2>
            <ul className="space-y-3">
              {card.reviews.map((review, index) => (
                <li key={index} className="rounded-2xl border border-current/25 p-4">
                  {review.rating !== null && (
                    <p className="flex gap-0.5" aria-label={t("{rating} out of 5 stars", { rating: review.rating })}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ color: star <= (review.rating ?? 0) ? colors.return_button : undefined, opacity: star <= (review.rating ?? 0) ? 1 : 0.3 }}>
                          <Icon name="star" filled className="h-4 w-4" />
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="mt-2 text-sm break-words whitespace-pre-line">{review.review}</p>
                  {review.name && <p className="mt-2 text-xs font-bold opacity-75">{review.name}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(card.can_review || card.links.google_review || card.links.tickets) && (
          <section className="space-y-3 px-6 py-8" style={primary}>
            {card.can_review && (
              <Link href={`/review/${card.slug}`} className={button} style={primaryButton}>
                <Icon name="pencil" />
                {t("Write a review")}
              </Link>
            )}
            {card.links.google_review && (
              <a href={card.links.google_review} target="_blank" rel="noopener noreferrer" className={button} style={primaryButton}>
                <Icon name="star" />
                {t("Review us on Google")}
              </a>
            )}
            {card.links.tickets && (
              <a href={card.links.tickets} target="_blank" rel="noopener noreferrer" className={button} style={primaryButton}>
                <Icon name="ticket" />
                {t("Buy tickets")}
              </a>
            )}
          </section>
        )}

        {card.social_links.length > 0 && (
          <section className="px-6 py-8 text-center" style={secondary}>
            <h2 className="text-inherit mb-4 text-xl font-bold">{t("Social")}</h2>
            <ul className="flex flex-wrap justify-center gap-2">
              {card.social_links.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:opacity-80" style={{ borderColor: colors.border }}>
                    <Icon name="link" className="h-4 w-4" />
                    {networkName(link) === "Website" ? t("Website") : networkName(link)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-wrap items-center justify-center gap-4 px-6 py-6 text-center text-xs" style={primary}>
          <LanguageMenu />
          <span className="opacity-80">
          {t("Made with")}{" "}
          <Link href="/" className="font-bold underline">
            {appName}
          </Link>
          </span>
        </footer>
      </article>
    </main>
  );
}
