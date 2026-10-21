"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/actions/auth";
import { startPlanCheckout } from "@/app/actions/settings";
import { money } from "@/lib/format";

import { Feedback, SaveButton } from "./forms";
import { useT } from "@/components/i18n/I18nProvider";

type Props = {
  prices: { monthly: string; yearly: string };
  methods: { id: number; name: string; fee_percent: string; fee_fixed: string }[];
};

export function PlanForm({ prices, methods }: Props) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(startPlanCheckout, {});
  const radio = "cursor-pointer rounded-xl border border-stone-200 px-4 py-3 has-checked:border-orange-500 has-checked:bg-orange-50 has-checked:ring-2 has-checked:ring-orange-200";

  return (
    <form action={action} className="card space-y-5 p-6">
      <h2 className="text-lg">{t("Choose a plan")}</h2>
      <Feedback state={state} />
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">{t("Plan")}</legend>
        <label className={radio}>
          <input type="radio" name="plan" value="monthly" defaultChecked className="sr-only" />
          <span className="block text-sm font-bold text-stone-900">{t("Monthly")}</span>
          <span className="block text-2xl font-bold text-stone-900">{money(prices.monthly)}</span>
          <span className="block text-xs text-stone-500">{t("for one month")}</span>
        </label>
        <label className={radio}>
          <input type="radio" name="plan" value="yearly" className="sr-only" />
          <span className="block text-sm font-bold text-stone-900">{t("Yearly")}</span>
          <span className="block text-2xl font-bold text-stone-900">{money(prices.yearly)}</span>
          <span className="block text-xs text-stone-500">{t("for one year")}</span>
        </label>
      </fieldset>
      <fieldset>
        <legend className="label">{t("Pay with")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {methods.map((method, index) => (
            <label key={method.id} className={radio}>
              <input type="radio" name="payment_method_id" value={method.id} defaultChecked={index === 0} className="sr-only" />
              <span className="block text-sm font-bold text-stone-900">{method.name}</span>
              <span className="block text-xs text-stone-500">
                {t("+ {fee} transaction fee", { fee: `${Number(method.fee_percent) > 0 ? `${method.fee_percent}% + ` : ""}${money(method.fee_fixed)}` })}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-stone-500">{t("Paying while a plan is running adds the new period after it ends. Plans do not renew by themselves.")}</p>
      <div className="flex justify-end">
        <SaveButton pendingText="Opening payment…">Pay now</SaveButton>
      </div>
    </form>
  );
}
