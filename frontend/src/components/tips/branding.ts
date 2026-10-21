import type { CSSProperties } from "react";

import type { TipPage } from "@/lib/types";

/**
 * Turns a user's saved tip page branding into styles. Values saved in the old
 * app are honoured; colours are only used when they are plain colour values.
 */

/** Only plain colour values are used as CSS, so stored text cannot inject other styles. */
function safeColor(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const color = value.trim();
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|[a-z]{3,20})$/i.test(color) ? color : undefined;
}

export function pageStyle(page: TipPage): CSSProperties {
  return { backgroundColor: safeColor(page.theme.page_color) };
}

export function panelStyle(page: TipPage): CSSProperties {
  const image = page.theme.background_image;
  if (image && /^https?:\/\//.test(image)) {
    // Patterns tile, as in the old app; photos cover the card.
    return image.includes("/images/pattern/") ? { backgroundImage: `url("${encodeURI(image)}")`, backgroundSize: "auto" } : { backgroundImage: `url("${encodeURI(image)}")` };
  }
  return { backgroundColor: safeColor(page.theme.panel_color) };
}

export function textStyle(page: TipPage): CSSProperties {
  return { color: safeColor(page.theme.text_color) };
}

export function inputStyle(page: TipPage): CSSProperties {
  const color = safeColor(page.theme.text_color);
  return color ? { color, borderColor: color } : {};
}

/** Colour of the emoji faces or stars; undefined keeps the default colours. */
export function emojiColor(page: TipPage): string | undefined {
  return safeColor(page.theme.emoji_color);
}

/** Button colours per style name (the API translates the old app's stored CSS classes). */
const BUTTON_CLASSES: Record<string, string> = {
  orange: "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600",
  red: "bg-red-600 text-white hover:bg-red-700",
  blue: "bg-sky-500 text-white hover:bg-sky-600",
  light: "bg-white text-stone-900 shadow-sm hover:bg-stone-100",
  dark: "bg-stone-900 text-white hover:bg-stone-800",
};

export function buttonClass(page: TipPage): string {
  return BUTTON_CLASSES[page.theme.button_style] ?? BUTTON_CLASSES.orange;
}
