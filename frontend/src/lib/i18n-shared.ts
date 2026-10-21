/** Translation helpers usable on the server and in the browser. */

export const LOCALE_COOKIE = "tiqs_locale";

export type Dictionary = Record<string, string>;

export type Translate = (text: string, values?: Record<string, string | number>) => string;

/**
 * Returns the translation of an English text, or the English text itself when
 * there is none yet, with {placeholders} filled in.
 */
export function makeTranslate(dictionary: Dictionary): Translate {
  return (text, values) => {
    const translated = dictionary[text] || text;
    return values ? translated.replace(/\{([a-z_]+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match)) : translated;
  };
}
