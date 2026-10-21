/** Small line icons of the business card (decorative: always next to text). */

const PATHS = {
  briefcase: "M4 7h16v12H4zM9 7V5h6v2M4 12h16",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  bookmark: "M6 4h12v17l-6-4-6 4z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  share: "M4 12v7h16v-7M12 3v12M7 8l5-5 5 5",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z",
  pencil: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  ticket: "M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  wallet: "M4 7h15a1 1 0 0 1 1 1v11H4zM4 7l12-3v3M16 13h2",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

const NETWORKS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X",
  x: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
  telegram: "Telegram",
  pinterest: "Pinterest",
  reddit: "Reddit",
  twitch: "Twitch",
  wa: "WhatsApp",
  whatsapp: "WhatsApp",
};

/** "Instagram" for https://www.instagram.com/…, otherwise the site's address. */
export function networkName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return NETWORKS[host.split(".")[0] ?? ""] ?? host;
  } catch {
    return "Website";
  }
}
