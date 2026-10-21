import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Thank you" };

/** Shown after a review when the page does not ask for a tip (old URL: /paytips/thanks-review). */
export default async function Page() {
  const { t } = await getI18n();
  return (
    <div data-theme="light" className="tip-page">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="tip-panel w-full max-w-xl motion-safe:animate-fade-up px-6 py-14 text-center">
          <p className="text-5xl" aria-hidden="true">
            🙏
          </p>
          <h1 className="mt-4 text-2xl">{t("Thank you for your review!")}</h1>
          <p className="mt-2 text-sm text-stone-500">{t("Your feedback helps us serve you better.")}</p>
        </section>
      </main>
    </div>
  );
}
