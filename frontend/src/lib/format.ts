const formatters = new Map<string, Intl.NumberFormat>();

/** "5.5" -> "€ 5,50" in Dutch formatting, as customers in the Netherlands expect. */
export function money(amount: string | number, currency = "EUR", locale = "nl-NL"): string {
  const key = `${locale}:${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
    formatters.set(key, formatter);
  }
  return formatter.format(Number(amount));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** "9 okt. 2026 14:05" in the business timezone. */
export function dateTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }) : "–";
}
