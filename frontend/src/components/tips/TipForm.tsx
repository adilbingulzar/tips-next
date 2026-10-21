"use client";

import { useState, useTransition } from "react";

import { quoteTip, startCheckout } from "@/app/actions/tips";
import { useT } from "@/components/i18n/I18nProvider";
import { money } from "@/lib/format";
import type { PaymentMethod, TipOptions, TipPage, TipQuote, TipTarget } from "@/lib/types";

import { buttonClass, inputStyle, textStyle } from "./branding";
import { methodLabel, methodLogo } from "./payment-methods";

type Props = {
  target: TipTarget;
  page: TipPage;
  options: TipOptions;
};

/** "€ 5" for whole amounts and "€ 7,50" otherwise, as the old tip buttons showed them. */
function shortMoney(amount: string | number, currency: string): string {
  const value = Number(amount);
  return Number.isInteger(value) ? `€ ${value}` : money(value.toFixed(2), currency);
}

function methodFee(method: PaymentMethod, amount: number): number {
  return Math.round((amount * Number(method.fee_percent)) / 100 * 100) / 100 + Number(method.fee_fixed);
}

/**
 * As in the old app: choose an amount ("Pay Tip"), then a payment method
 * from a grid of tiles ("Choose payment method"), which opens Pay.nl.
 */
export function TipForm({ target, page, options }: Props) {
  const t = useT();
  const [step, setStep] = useState<"amount" | "method">("amount");
  const [amount, setAmount] = useState(String(Number(page.preset_amounts[0] ?? "5")));
  const [quote, setQuote] = useState<TipQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quoting, startQuote] = useTransition();
  const [paying, startPay] = useTransition();

  const min = Number(options.min_amount);
  const max = Number(options.max_amount);
  const amountValue = Number(amount.replace(",", "."));
  const amountValid = Number.isFinite(amountValue) && amountValue >= min && amountValue <= max;
  const normalisedAmount = amountValid ? amountValue.toFixed(2) : amount;
  const processingFee = quote ? Number(quote.platform_fee) : 0;

  function toMethods() {
    setStep("method");
    setError(null);
    setQuote(null);
    const first = options.payment_methods[0];
    if (first) {
      startQuote(async () => {
        const result = await quoteTip(target, normalisedAmount, first.id);
        if (result.ok) {
          setQuote(result.data);
        }
      });
    }
  }

  function pay(methodId: number) {
    setError(null);
    startPay(async () => {
      const result = await startCheckout(target, { amount: normalisedAmount, payment_method_id: methodId });
      if (result.ok) {
        window.location.assign(result.data.redirectUrl);
      } else {
        setError(result.message);
      }
    });
  }

  if (step === "amount") {
    return (
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (amountValid) {
            toMethods();
          }
        }}
      >
        <p className="text-center text-sm font-semibold" style={textStyle(page)}>
          {t("Select your tip")}
        </p>
        <div className="tip-amounts mt-3">
          {page.preset_amounts.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={Number(preset) === amountValue}
              onClick={() => setAmount(String(Number(preset)))}
              className={`amount-btn ${Number(preset) === amountValue ? "is-selected" : ""} ${buttonClass(page)}`}
            >
              {shortMoney(preset, options.currency)}
            </button>
          ))}
        </div>

        <label htmlFor="amount" className="mt-8 block text-center text-sm font-semibold" style={textStyle(page)}>
          {t("or enter amount")}
        </label>
        <div className="mx-auto mt-3 flex max-w-sm items-stretch gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">€</span>
            <input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
              className="input ps-9 text-center text-lg font-bold"
              aria-invalid={!amountValid}
              aria-describedby={amountValid ? undefined : "amount-hint"}
              style={inputStyle(page)}
            />
          </div>
          <button type="submit" disabled={!amountValid} className={`btn btn-pill shrink-0 ${buttonClass(page)}`}>
            {t("Pay Tip")}
          </button>
        </div>
        {!amountValid && (
          <p id="amount-hint" className="mt-2 text-center text-xs font-semibold text-red-600">
            {t("Between {min} and {max}", { min: money(min, options.currency), max: money(max, options.currency) })}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="-mx-6 -mb-10 mt-8 border-t border-stone-200/60 sm:-mx-10">
      <div className="flex items-center gap-3 border-b border-stone-200/60 bg-stone-50 px-5 py-4">
        <button type="button" onClick={() => setStep("amount")} className="text-sm font-semibold text-stone-600 hover:text-stone-900">
          ← {t("Back")}
        </button>
        <h2 className="flex-1 pe-12 text-center text-base">{t("Choose payment method")}</h2>
      </div>
      <div className="border-b border-stone-200/60 px-5 py-4 text-center" aria-live="polite">
        <p className="text-sm text-stone-500" style={textStyle(page)}>
          {t("Tip Amount")} {shortMoney(normalisedAmount, options.currency)}
          {processingFee > 0 && ` ${t("+ Processing Fees €")} ${processingFee.toFixed(2).replace(".", ",")}`}
        </p>
        <p className="mt-1 font-display text-2xl font-extrabold text-stone-900" style={textStyle(page)}>
          {quoting ? "…" : money((amountValue + processingFee).toFixed(2), options.currency)}
        </p>
      </div>
      {error && (
        <p role="alert" className="alert alert-error mx-5 mt-4">
          {t(error)}
        </p>
      )}
      <section className="grid grid-cols-2 gap-3 p-5">
        {options.payment_methods.map((method) => (
          <button
            key={method.id}
            type="button"
            disabled={paying}
            onClick={() => pay(method.id)}
            className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-300 disabled:opacity-60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- small logos, local or from Pay.nl */}
            <img src={methodLogo(method)} alt="" className="h-10 w-auto object-contain" />
            <span className="text-sm font-bold text-stone-900">{t(methodLabel(method))}</span>
            <span className="text-xs font-semibold text-stone-500">+ {money(methodFee(method, amountValue).toFixed(2), options.currency)}</span>
          </button>
        ))}
      </section>
      {paying && <p className="pb-5 text-center text-sm text-stone-500">{t("Opening payment…")}</p>}
    </div>
  );
}
