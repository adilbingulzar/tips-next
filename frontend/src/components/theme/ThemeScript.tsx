/** Name of the cookie that keeps the visitor's theme ("light" or "dark"). */
export const THEME_COOKIE = "theme";

/**
 * Sets <html data-theme> from the cookie before the first paint, so a dark page
 * never flashes light. The layout is static, so this cannot be done on the server.
 */
export function ThemeScript() {
  const html = `try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)/);document.documentElement.dataset.theme=m?m[1]:"light"}catch(e){}`;
  return <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
