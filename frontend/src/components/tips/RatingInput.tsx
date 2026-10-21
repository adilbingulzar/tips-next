"use client";

import { useId } from "react";

import { useT } from "@/components/i18n/I18nProvider";

/** Default colours of the five faces in the old app, from unhappy to delighted. */
const FACE_COLORS = ["#D83D56", "#EE7457", "#FBC721", "#2FA18D", "#51B477"];
const STAR_COLOR = "#FBC721";
const LABELS = ["Very bad", "Bad", "Okay", "Good", "Excellent"];

/** Mouth curve per rating: frown to big smile. */
const MOUTHS = ["M8 17c1.5-2 6.5-2 8 0", "M8.5 16.5c1.5-1 5.5-1 7 0", "M8.5 15.5h7", "M8.5 14.5c1.5 1.5 5.5 1.5 7 0", "M8 14c1.5 3 6.5 3 8 0"];

function Face({ rating }: { rating: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" stroke="none" />
      <circle cx="9" cy="10" r="1.2" fill="#fff" stroke="none" />
      <circle cx="15" cy="10" r="1.2" fill="#fff" stroke="none" />
      <path d={MOUTHS[rating - 1]} />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}

type Props = {
  value: number;
  onChange: (rating: number) => void;
  /** 0 = faces, 1 = stars, as chosen by the user. */
  emojiType: number;
  /** User's own colour for the faces or stars. */
  color?: string;
};

export function RatingInput({ value, onChange, emojiType, color }: Props) {
  const name = useId();
  const t = useT();

  return (
    <div role="radiogroup" aria-label={t("Your rating")} className="flex items-center justify-center gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5].map((rating) => {
        // As in the old app, everything up to the chosen rating is coloured.
        const active = rating <= value;
        const activeColor = color ?? (emojiType === 1 ? STAR_COLOR : FACE_COLORS[rating - 1]);

        return (
          <label key={rating} className="cursor-pointer transition-transform hover:scale-110 has-focus-visible:scale-110">
            <input
              type="radio"
              name={name}
              value={rating}
              checked={rating === value}
              onChange={() => onChange(rating)}
              className="sr-only"
              aria-label={t(LABELS[rating - 1] ?? "")}
            />
            <span style={{ color: active ? activeColor : "#d6d3d1" }}>{emojiType === 1 ? <Star /> : <Face rating={rating} />}</span>
          </label>
        );
      })}
    </div>
  );
}
