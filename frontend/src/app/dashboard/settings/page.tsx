import type { Metadata } from "next";
import Link from "next/link";

import { NavGlyph } from "@/components/app/NavIcons";
import { PageHeader } from "@/components/app/ui";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Settings" };

/** The old "Settings" page: the way to payout settings and the bank account. */
export default async function Page() {
  const { t } = await getI18n();
  const cards = [
    { title: "Payout Settings", text: "Set payout duration and tax deduction", icon: "money" as const, href: "/dashboard/bank#payout-settings" },
    { title: "Bank Account", text: "Update your bank account details", icon: "euro" as const, href: "/dashboard/bank#bank-account" },
  ];

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card.title} className="card flex flex-col">
            <div className="p-6">
              <h2 className="text-lg">{t(card.title)}</h2>
              <p className="text-sm text-stone-500">{t(card.text)}</p>
            </div>
            <div className="mx-6 grid flex-1 place-items-center rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
              <div>
                <NavGlyph name={card.icon} className="mx-auto mb-3 h-8 w-8 text-stone-400" />
                {t(card.text)}
              </div>
            </div>
            <div className="p-6">
              <Link href={card.href} className="btn btn-primary btn-sm">
                {t("Setup")}
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
