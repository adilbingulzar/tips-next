import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { InvitationLinkButton, type PayoutOverview, TransferCard } from "@/components/app/PayoutForms";
import { SolidIcon } from "@/components/app/SolidIcons";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getI18n } from "@/lib/i18n";
import type { Translate } from "@/lib/i18n-shared";

export const metadata: Metadata = { title: "Get Payment" };

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" }) : "");

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
      <Payouts />
    </Suspense>
  );
}

async function Payouts() {
  const user = await requireVerifiedUser();
  const { data } = await api<{ data: PayoutOverview }>("/me/payouts", { token: await requireToken() });
  const { t } = await getI18n();
  const invitation = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/register?ref=${encodeURIComponent(user.slug)}`;
  const needsPlan = data.subscription ? !data.subscription.allows_payout : false;

  return (
    <>
      <PageHeader title="Get Payment" description="Transfer balance to your bank account" actions={<InvitationLinkButton link={invitation} />} />

      {needsPlan && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-orange-500 to-orange-600 p-5 text-white shadow-lg shadow-orange-500/25">
          <p className="font-semibold">{t("Select best subscription plan for you")}</p>
          <Link href="/dashboard/plan" className="btn btn-pill bg-white text-[#ea580c] hover:bg-[#fff7ed]">
            {t("Get Subscription")}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="stat">
          <p className="stat-label flex items-center gap-1">
            <SolidIcon name="money" className="h-4 w-4 text-orange-500" /> {t("Balance")}
          </p>
          <p className="stat-value">{money(data.balance)}</p>
          <dl className="mt-4 space-y-1 text-sm">
            {(
              [
                ["Tip Amount", data.breakdown.tips],
                ["Spot Amount", data.breakdown.spots],
                ["Referral rewards", data.breakdown.referrals],
              ] as const
            ).map(([label, amount]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-stone-500">{t(label)}</dt>
                <dd className="font-semibold">{money(amount)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="stat">
          <p className="stat-label flex items-center gap-1">
            <SolidIcon name="clock" className="h-4 w-4 text-orange-500" /> {t("Processing")}
          </p>
          <p className="stat-value">{money(data.processing)}</p>
          <p className="mt-2 text-sm text-stone-500">{t("Current Processing amount")}</p>
        </div>
        <TransferCard overview={data} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t("Recent transactions")}</h2>
            <Link href="/dashboard/statement" className="btn btn-secondary btn-sm">
              {t("View All")}
            </Link>
          </div>
          {data.recent_withdrawals.length === 0 ? (
            <NoData t={t} />
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recent_withdrawals.map((withdrawal) => (
                <li key={withdrawal.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                  <span className="text-stone-600">
                    {date(withdrawal.requested_at)}
                    {withdrawal.status === "requested" && <span className="badge ms-2 bg-amber-100 text-amber-800">{t("Pending")}</span>}
                  </span>
                  <span className="font-bold text-stone-900">{money(withdrawal.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t("Referral rewards")}</h2>
          </div>
          {data.recent_referrals.length === 0 ? (
            <NoData t={t} />
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recent_referrals.map((referral) => (
                <li key={referral.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                  <span className="text-stone-600">🏆 {date(referral.created_at)}</span>
                  <span className="font-bold text-stone-900">{money(referral.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">{t("How you get paid ?")}</h2>
          </div>
          <div className="card-body text-center">
            {data.bank_account ? (
              <>
                <p className="text-sm text-stone-500">{t("Wire transfer to bank account")}</p>
                <p className="mt-2 font-mono text-lg font-bold text-stone-900">•••• {data.bank_account.account_number.slice(-4)}</p>
                <p className="mt-1 text-sm font-semibold text-stone-700">{data.bank_account.account_name}</p>
              </>
            ) : (
              <p className="text-sm text-stone-500">{t("Please update bank account to receive transfer amount")}</p>
            )}
            <Link href="/dashboard/bank" className="btn btn-outline btn-sm mt-6">
              {t("Change Method")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function NoData({ t }: { t: Translate }) {
  return (
    <div className="card-body">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 py-12 text-stone-400">
        <SolidIcon name="database" className="h-8 w-8" />
        <p className="text-sm">{t("Sorry, no data found!")}</p>
      </div>
    </div>
  );
}
