import Link from "next/link";

import { PublicHeader } from "@/components/auth/PublicHeader";
import { getI18n } from "@/lib/i18n";

/** Front page: what the site is, and the way in. */
export default async function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "TIQS";
  const { t } = await getI18n();

  return (
    <div className="public-page">
      <PublicHeader />
      <main className="l26">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <span className="l26-badge">
            <i className="l26-dot" aria-hidden="true" />
            {appName}
          </span>
          <h1 className="l26-title mx-auto max-w-none">{t("Tips and reviews, with one QR code")}</h1>
          <p className="l26-lead mx-auto">{t("Receive tips and reviews from your customers with a simple QR code.")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary btn-lg">
              {t("Create a free account")}
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              {t("Log in")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
