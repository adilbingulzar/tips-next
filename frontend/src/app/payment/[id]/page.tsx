import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PaymentStatusWatcher } from "@/components/tips/PaymentStatusWatcher";
import { TipPageSkeleton } from "@/components/tips/TipPageShell";
import { money } from "@/lib/format";
import { getPayment } from "@/lib/public";
import { getI18n } from "@/lib/i18n";
import type { Translate } from "@/lib/i18n-shared";
import type { PublicPayment } from "@/lib/types";

export const metadata: Metadata = { title: "Payment" };

/** Where Pay.nl sends the customer back to after paying (or cancelling). */
export default function Page({ params }: PageProps<"/payment/[id]">) {
  return (
    <Suspense fallback={<TipPageSkeleton />}>
      <PaymentPage params={params} />
    </Suspense>
  );
}

async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPayment(id);

  if (!payment) {
    notFound();
  }

  return (
    <div data-theme="light" className="tip-page">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="tip-panel w-full max-w-xl motion-safe:animate-fade-up px-6 py-14 text-center">
          <PaymentResult payment={payment} t={(await getI18n()).t} />
        </section>
      </main>
    </div>
  );
}

function tipPageHref(payment: PublicPayment): string | null {
  if (payment.spot) {
    return `/paytips/spot/${payment.spot.business_id}/${payment.spot.slug}`;
  }
  return payment.recipient ? `/paytips/${payment.recipient.slug}` : null;
}

function PaymentResult({ payment, t }: { payment: PublicPayment; t: Translate }) {
  const recipientName = payment.spot?.business_name ?? payment.recipient?.name;
  const retryHref = payment.purpose === "subscription" ? "/dashboard/plan" : tipPageHref(payment);

  if (payment.purpose === "subscription" && (payment.status === "paid" || payment.status === "authorised")) {
    return (
      <>
        <p className="text-5xl" aria-hidden="true">
          ✅
        </p>
        <h1 className="mt-4 text-2xl">{t("Your plan is active")}</h1>
        <p className="mt-2 text-sm text-stone-600">{t("Thank you. You paid {amount} and can transfer your balance again.", { amount: money(payment.total_amount, payment.currency) })}</p>
        <Link href="/dashboard/plan" className="btn btn-primary mt-6">
          {t("Back to my plan")}
        </Link>
      </>
    );
  }

  if (payment.status === "paid" || payment.status === "authorised") {
    return (
      <>
        <p className="text-5xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-4 text-2xl">{payment.recipient?.success_header ?? t("Thank you for your tip!")}</h1>
        <p className="mt-2 text-sm text-stone-600">
          {payment.recipient?.success_message ??
            (recipientName
              ? t("{name} received your tip of {amount}.", { name: recipientName, amount: money(payment.tip_amount, payment.currency) })
              : t("We received your tip of {amount}.", { amount: money(payment.tip_amount, payment.currency) }))}
        </p>
      </>
    );
  }

  if (payment.status === "pending" || payment.status === "verify") {
    return (
      <>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" aria-hidden="true" />
        <h1 className="mt-6 text-2xl">{t("Processing your payment")}</h1>
        <PaymentStatusWatcher paymentId={payment.id} />
      </>
    );
  }

  return (
    <>
      <p className="text-5xl" aria-hidden="true">
        😕
      </p>
      <h1 className="mt-4 text-2xl">{payment.status === "cancelled" ? t("Payment cancelled") : t("Payment not completed")}</h1>
      <p className="mt-2 text-sm text-stone-600">{t("No money was taken. You can try again.")}</p>
      {retryHref && (
        <Link href={retryHref} className="btn btn-primary btn-pill mt-6">
          {t("Try again")}
        </Link>
      )}
    </>
  );
}
