"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitReview } from "@/app/actions/tips";
import { useT } from "@/components/i18n/I18nProvider";
import type { TipPage, TipTarget } from "@/lib/types";

import { buttonClass, emojiColor, inputStyle, textStyle } from "./branding";
import { RatingInput } from "./RatingInput";

type Props = {
  target: TipTarget;
  page: TipPage;
  /** Where to go after the review: the tip page, or the thank-you page when the user only asks for reviews. */
  nextHref: string;
  /** Reviews the user pinned, shown under the form ("What customers think about me ?"). */
  pinned?: { rating: number | null; review: string }[];
};

const DEFAULT_RATING = 3;

export function ReviewForm({ target, page, nextHref, pinned = [] }: Props) {
  const router = useRouter();
  const t = useT();
  const [rating, setRating] = useState(DEFAULT_RATING);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitReview(target, {
        rating,
        review: String(formData.get("review") ?? "") || undefined,
        name: String(formData.get("name") ?? "") || undefined,
        email: String(formData.get("email") ?? "") || undefined,
      });

      if (!result.ok) {
        setError(result.message);
        setFieldErrors(result.errors);
        return;
      }

      router.push(nextHref);
    });
  }

  return (
    <form action={onSubmit} className="mt-8" noValidate>
      <p className="text-center text-sm font-semibold" style={textStyle(page)}>
        {page.title ?? t("Please rate your experience below")}
      </p>
      <div className="mt-4">
        <RatingInput value={rating} onChange={setRating} emojiType={page.theme.emoji_type} color={emojiColor(page)} />
      </div>

      <div className="mx-auto mt-8 max-w-sm space-y-4">
        {page.show_review_field && (
          <>
            <div className="field">
              <label className="label" htmlFor="review" style={textStyle(page)}>
                {t("Your review (optional)")}
              </label>
              <textarea id="review" name="review" rows={3} maxLength={2000} className="textarea" placeholder={t("Your review")} style={inputStyle(page)} />
              {fieldErrors.review && <p className="field-error">{t(fieldErrors.review[0] ?? "")}</p>}
            </div>
            <div className="field">
              <label className="label" htmlFor="name" style={textStyle(page)}>
                {t("Your name (optional)")}
              </label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="currentColor" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true">
                  <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM3.5 21a8.5 8.5 0 0 1 17 0z" />
                </svg>
                <input id="name" name="name" maxLength={100} className="input ps-10" placeholder={t("Your Name")} autoComplete="name" style={inputStyle(page)} />
              </div>
            </div>
          </>
        )}
        {page.show_email_field && (
          <div className="field">
            <label className="label" htmlFor="email" style={textStyle(page)}>
              {t("Your email (optional)")}
            </label>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="currentColor" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true">
                <path d="M3 5h18v14H3zM3.5 6l8.5 6.5L20.5 6" />
              </svg>
              <input id="email" name="email" type="email" className="input ps-10" placeholder={t("Email ID")} autoComplete="email" style={inputStyle(page)} />
            </div>
            {fieldErrors.email && <p className="field-error">{t(fieldErrors.email[0] ?? "")}</p>}
          </div>
        )}

        {error && (
          <p role="alert" className="alert alert-error">
            {t(error)}
          </p>
        )}

        <button type="submit" disabled={pending} className={`btn btn-pill btn-block ${buttonClass(page)}`}>
          {pending ? t("Sending…") : <>{t("Next")} ›</>}
        </button>
      </div>

      {pinned.length > 0 && (
        <div className="mt-10 border-t border-stone-200/60 pt-6">
          <h2 className="text-center text-base" style={textStyle(page)}>
            {t("What customers think about me ?")}
          </h2>
          <div className={`mt-4 ${page.theme.review_style === 1 ? "flex flex-col gap-4" : "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"}`}>
            {pinned.map((review, index) => (
              <figure
                key={index}
                className={`rounded-2xl bg-white/70 p-4 text-start shadow-sm ${page.theme.review_style === 1 ? "" : page.theme.review_style === 3 ? "w-64 shrink-0 snap-start" : "w-full shrink-0 snap-start"}`}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the old placeholder photo */}
                  <img src="/images/user-image.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <figcaption className="text-sm font-bold text-stone-900">{t("Anonymous")}</figcaption>
                    <div className="flex gap-0.5 text-xs text-amber-400" aria-label={`${review.rating ?? 0}/5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= (review.rating ?? 0) ? "" : "opacity-30"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote dir="auto" className="mt-3 text-sm text-stone-600">
                  {review.review}
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
