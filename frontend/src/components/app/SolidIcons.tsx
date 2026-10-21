/**
 * Filled icons in the style of the old app (Font Awesome solid), drawn inline
 * so no icon font is needed.
 */
const PATHS = {
  userGear:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-2 2h4c.6 0 1.1.1 1.6.2A6 6 0 0 0 13.6 21H3a1 1 0 0 1-1-1v-1a6 6 0 0 1 5-6zm11 0 .5 1.2 1.3.2.2 1.3 1.2.5-.5 1.2.5 1.2-1.2.5-.2 1.3-1.3.2L18 21l-1.2-.5-1.2.5-.5-1.2-1.3-.2-.2-1.3-1.2-.5.5-1.2-.5-1.2 1.2-.5.2-1.3 1.3-.2.5-1.2 1.2.5zm0 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  bank: "M12 2 2 7v2h20V7L12 2zM4 11v7h3v-7H4zm6.5 0v7h3v-7h-3zM17 11v7h3v-7h-3zM2 20v2h20v-2H2z",
  briefcase:
    "M9 3h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v4H2V8a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2zm0 3h6V5H9v1zM2 14h8v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h8v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z",
  money:
    "M2 6h20v12H2V6zm4 2a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h12a2 2 0 0 1 2-2v-4a2 2 0 0 1-2-2H6zm6 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z",
  fileLines:
    "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V9h5.5L13 3.5zM8 12v2h8v-2H8zm0 4v2h8v-2H8z",
  userCheck:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-2 2h4a6 6 0 0 1 6 6v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a6 6 0 0 1 6-6zm15.7-4.3-4.2 4.2-2.2-2.2 1.4-1.4.8.8 2.8-2.8 1.4 1.4z",
  arrowRight: "M13.3 5.3 20 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.2l-4.3-4.3 1.4-1.4z",
  star: "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z",
  caretUp: "M12 7l7 9H5z",
  caretDown: "M12 17 5 8h14z",
  clock: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 5v6l5 3 1-1.6-4-2.4V7h-2z",
  database:
    "M12 2c4.4 0 8 1.3 8 3v2c0 1.7-3.6 3-8 3S4 8.7 4 7V5c0-1.7 3.6-3 8-3zM4 9.5C5.6 10.6 8.6 11 12 11s6.4-.4 8-1.5V13c0 1.7-3.6 3-8 3s-8-1.3-8-3V9.5zm0 6C5.6 16.6 8.6 17 12 17s6.4-.4 8-1.5V19c0 1.7-3.6 3-8 3s-8-1.3-8-3v-3.5z",
} as const;

export type SolidIconName = keyof typeof PATHS;

export function SolidIcon({ name, className = "h-5 w-5" }: { name: SolidIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d={PATHS[name]} />
    </svg>
  );
}

export function CircleCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}
