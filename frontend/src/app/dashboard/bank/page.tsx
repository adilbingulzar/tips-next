import type { Metadata } from "next";
import { Suspense } from "react";

import { BankAccountForm, type PayoutOverview, PayoutScheduleForm, TaxForm } from "@/components/app/PayoutForms";
import { PageHeader } from "@/components/app/ui";
import { api } from "@/lib/api";
import { requireToken, requireVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Bank Account" };

/** The old "Bank Account" page: payout settings, who pays the fee, and the bank account. */
export default function Page() {
  return (
    <>
      <PageHeader title="Bank Account" description="Payout, fees and where your money lands" />
      <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <Bank />
      </Suspense>
    </>
  );
}

async function Bank() {
  await requireVerifiedUser();
  const { data } = await api<{ data: PayoutOverview }>("/me/payouts", { token: await requireToken() });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div id="payout-settings" className="scroll-mt-6">
        <PayoutScheduleForm overview={data} />
      </div>
      <TaxForm overview={data} />
      <div id="bank-account" className="scroll-mt-6">
        <BankAccountForm account={data.bank_account} />
      </div>
    </div>
  );
}
