import type { Metadata } from "next";
import { Suspense } from "react";

import { PlanForm } from "@/components/app/PlanForm";
import { EmptyState, PageHeader } from "@/components/app/ui";
import type { SubscriptionInfo } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";
import { money } from "@/lib/format";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Plan" };

type MyPlan = SubscriptionInfo & {
  payment_methods: { id: number; name: string; fee_percent: string; fee_fixed: string }[];
  history: { id: number; plan: string; amount: string; starts_on: string | null; ends_on: string | null; granted: boolean }[];
};

export default function Page() {
  return (
    <>
      <PageHeader title="Plan" description="A plan lets you transfer your balance to your bank account." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Plan />
      </Suspense>
    </>
  );
}

async function Plan() {
  const { t } = await getI18n();
  await requireVerifiedUser();
  const { data } = await api<{ data: MyPlan }>("/me/subscription", { token: await requireToken() });

  const status = !data.required
    ? { tone: "bg-emerald-50 border-emerald-200 text-emerald-900", text: t("You don't need a plan: you can transfer your balance at any time.") }
    : data.active
      ? { tone: "bg-emerald-50 border-emerald-200 text-emerald-900", text: data.granted ? t("You have a free plan until {date}.", { date: data.ends_on ?? "" }) : data.plan === "yearly" ? t("Your yearly plan is active until {date}.", { date: data.ends_on ?? "" }) : t("Your monthly plan is active until {date}.", { date: data.ends_on ?? "" }) }
      : data.trial_ends_on
        ? { tone: "bg-orange-50 border-orange-200 text-orange-900", text: t("Your free trial runs until {date}. Choose a plan to keep transferring your balance after that.", { date: data.trial_ends_on }) }
        : { tone: "bg-amber-50 border-amber-200 text-amber-900", text: t("You need a plan to transfer your balance.") };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <p className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${status.tone}`}>{status.text}</p>
        {data.required && <PlanForm prices={data.prices} methods={data.payment_methods} />}
      </div>
      <section className="space-y-3">
        <h2 className="text-lg">{t("Your plans")}</h2>
        {data.history.length === 0 ? (
          <EmptyState>No plans yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-stone-100 card">
            {data.history.map((plan) => (
              <li key={plan.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  <span className="font-bold text-stone-900">{plan.granted ? t("Free plan") : plan.plan === "yearly" ? t("Yearly") : t("Monthly")}</span>
                  <span className="block text-xs text-stone-500">
                    {plan.starts_on} – {plan.ends_on}
                  </span>
                </span>
                <span className="font-semibold text-stone-900">{plan.granted ? "–" : money(plan.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
