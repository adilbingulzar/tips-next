"use server";

import { ApiError, api } from "@/lib/api";
import type { PaymentStatus, PublicPayment, TipQuote, TipTarget } from "@/lib/types";

/**
 * Server functions behind the public tip and review pages. They only pass the
 * customer's input on to the API, which validates everything and decides the
 * amounts; nothing here is trusted for money.
 */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors: Record<string, string[]> };

function basePath(target: TipTarget): string {
  return target.kind === "person"
    ? `/public/profiles/${encodeURIComponent(target.slug)}`
    : `/public/businesses/${target.businessId}/spots/${encodeURIComponent(target.spotSlug)}`;
}

function failure(error: unknown): { ok: false; message: string; errors: Record<string, string[]> } {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, errors: error.errors };
  }
  console.error(error);
  return { ok: false, message: "Something went wrong. Please try again.", errors: {} };
}

export type ReviewInput = {
  rating: number;
  review?: string;
  name?: string;
  email?: string;
};

export async function submitReview(target: TipTarget, input: ReviewInput): Promise<ActionResult> {
  try {
    await api(`${basePath(target)}/reviews`, { method: "POST", body: input });
    return { ok: true, data: undefined };
  } catch (error) {
    return failure(error);
  }
}

export async function quoteTip(target: TipTarget, amount: string, paymentMethodId: number): Promise<ActionResult<TipQuote>> {
  try {
    const response = await api<{ data: TipQuote }>(`${basePath(target)}/quote`, {
      query: { amount, payment_method_id: paymentMethodId },
    });
    return { ok: true, data: response.data };
  } catch (error) {
    return failure(error);
  }
}

export type CheckoutInput = Omit<ReviewInput, "rating"> & {
  amount: string;
  payment_method_id: number;
  rating?: number;
};

export async function startCheckout(target: TipTarget, input: CheckoutInput): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const response = await api<{ payment: string; redirect_url: string }>(`${basePath(target)}/checkout`, {
      method: "POST",
      body: input,
    });
    return { ok: true, data: { redirectUrl: response.redirect_url } };
  } catch (error) {
    return failure(error);
  }
}

/** Current status of a checkout; the API confirms pending payments with Pay.nl. */
export async function checkPayment(id: string): Promise<PaymentStatus | null> {
  try {
    const response = await api<{ data: PublicPayment }>(`/public/payments/${encodeURIComponent(id)}`);
    return response.data.status;
  } catch {
    return null;
  }
}
