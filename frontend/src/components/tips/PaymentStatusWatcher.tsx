"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { checkPayment } from "@/app/actions/tips";
import { useT } from "@/components/i18n/I18nProvider";

const INTERVAL_MS = 3000;
const MAX_CHECKS = 20;

/**
 * Some payment methods confirm a few seconds after the customer returns from
 * Pay.nl. Checks again until the payment is final, then reloads the page.
 */
export function PaymentStatusWatcher({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const t = useT();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let checks = 0;
    let stopped = false;

    const timer = setInterval(async () => {
      checks += 1;
      const status = await checkPayment(paymentId);

      if (stopped) {
        return;
      }
      if (status !== null && status !== "pending" && status !== "verify") {
        stopped = true;
        clearInterval(timer);
        router.refresh();
      } else if (checks >= MAX_CHECKS) {
        stopped = true;
        clearInterval(timer);
        setGaveUp(true);
      }
    }, INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [paymentId, router]);

  return (
    <p className="mt-6 text-sm text-stone-500" aria-live="polite">
      {gaveUp ? t("Your payment is still being processed. You can safely close this page.") : t("Waiting for confirmation from your bank…")}
    </p>
  );
}
