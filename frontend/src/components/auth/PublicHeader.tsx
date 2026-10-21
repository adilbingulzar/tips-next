import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { LanguageMenu } from "@/components/i18n/LanguageMenu";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";

/** Top of the sign-in and front pages: the logo, the language and the theme switch. */
export function PublicHeader() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";
  return (
    <header className="public-header">
      <Link href="/" aria-label={appName}>
        <Logo alt={appName} width={138} height={46} priority />
      </Link>
      <div className="public-controls">
        <LanguageMenu />
        <ThemeSwitch />
      </div>
    </header>
  );
}
