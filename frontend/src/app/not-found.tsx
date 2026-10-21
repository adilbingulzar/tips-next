import Link from "next/link";

import { getI18n } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="public-page">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="l26-card mx-auto px-6 py-16 text-center">
          <p className="text-6xl font-bold text-orange-500">404</p>
          <h1 className="mt-4 text-xl">{t("The page you were looking for could not be found")}</h1>
          <Link href="/" className="btn btn-outline btn-pill mt-6">
            {t("Go to the home page")}
          </Link>
        </section>
      </main>
    </div>
  );
}
