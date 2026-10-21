"use server";

import { refresh } from "next/cache";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";

import type { FormState } from "./auth";

/**
 * Server functions of the admin area. The API checks that the user is an
 * admin and validates everything; these only pass the form on.
 */

type Method = "POST" | "PUT" | "DELETE";

function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

async function call<T = unknown>(path: string, method: Method, body: unknown, success: string): Promise<FormState & { data?: T }> {
  let data: T | undefined;
  try {
    const response = await api<{ data?: T } | undefined>(path, { method, token: await requireToken(), body });
    data = response?.data;
  } catch (error) {
    if (error instanceof ApiError) {
      const first = Object.values(error.errors)[0]?.[0];
      return { message: error.status === 422 ? (first ?? error.message) : error.message, errors: error.errors };
    }
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }
  refresh();
  return { success, data };
}

/* Payouts */

export async function markPayoutsPaid(_state: FormState, formData: FormData): Promise<FormState> {
  const ids = formData.getAll("ids").map(Number).filter(Boolean);
  if (ids.length === 0) {
    return { message: "Select the payouts you transferred." };
  }
  const result = await call<{ marked: number }>("/admin/payouts/mark-paid", "POST", { ids }, "");
  return result.message ? result : { success: `${result.data?.marked ?? 0} payout(s) marked as paid. The users were told.` };
}

/* Users */

export async function updateUserFees(userId: number, _state: FormState, formData: FormData): Promise<FormState> {
  const rate = (prefix: string) =>
    formData.get(`${prefix}_custom`) === "on" ? { percent: Number(text(formData, `${prefix}_percent`) ?? 0), fixed: Number(text(formData, `${prefix}_fixed`) ?? 0) } : null;

  return call(
    `/admin/users/${userId}/fees`,
    "PUT",
    {
      tip: rate("tip"),
      payout: Object.fromEntries(["manual", "daily", "weekly", "monthly"].map((schedule) => [schedule, rate(`payout_${schedule}`)])),
    },
    "Fees saved.",
  );
}

/* Plans */

export async function grantSubscription(userId: number, _state: FormState, formData: FormData): Promise<FormState> {
  return call("/admin/subscriptions", "POST", { user_id: userId, months: Number(formData.get("months") ?? 1) }, "Free plan given.");
}

export async function endSubscription(subscriptionId: number): Promise<FormState> {
  return call(`/admin/subscriptions/${subscriptionId}`, "DELETE", undefined, "Plan ended.");
}

/* Settings */

export async function updateSettings(_state: FormState, formData: FormData): Promise<FormState> {
  const flag = (name: string) => formData.get(name) === "on";
  const number = (name: string) => Number(String(formData.get(name) ?? "0").replace(",", "."));

  return call(
    "/admin/settings",
    "PUT",
    {
      tip_fee_percent: number("tip_fee_percent"),
      tip_fee_fixed: number("tip_fee_fixed"),
      user_subscription_required: flag("user_subscription_required"),
      business_subscription_required: flag("business_subscription_required"),
      user_plan_monthly: number("user_plan_monthly"),
      user_plan_yearly: number("user_plan_yearly"),
      business_plan_monthly: number("business_plan_monthly"),
      business_plan_yearly: number("business_plan_yearly"),
      free_trial_days: number("free_trial_days"),
      support_url: text(formData, "support_url"),
      support_email: text(formData, "support_email"),
      terms_and_conditions: text(formData, "terms_and_conditions"),
      payout_debtor_name: text(formData, "payout_debtor_name"),
      payout_debtor_iban: text(formData, "payout_debtor_iban"),
      payout_debtor_bic: text(formData, "payout_debtor_bic"),
    },
    "Settings saved.",
  );
}

/* Translations */

export async function saveTranslation(locale: string, key: string, _state: FormState, formData: FormData): Promise<FormState> {
  return call("/admin/translations", "PUT", { locale, key, text: String(formData.get("text") ?? "") }, "Saved.");
}

/* Email templates */

export async function saveEmailTemplate(name: string, _state: FormState, formData: FormData): Promise<FormState> {
  return call(`/admin/email-templates/${encodeURIComponent(name)}`, "PUT", { subject: text(formData, "subject"), html: text(formData, "html") }, "Template saved.");
}

export async function resetEmailTemplate(name: string): Promise<FormState> {
  return call(`/admin/email-templates/${encodeURIComponent(name)}`, "DELETE", undefined, "Back to the built-in text.");
}

/* Text messages */

export async function sendSms(_state: FormState, formData: FormData): Promise<FormState> {
  const result = await call<{ queued: number }>(
    "/admin/sms",
    "POST",
    {
      audience: text(formData, "audience"),
      country_code: text(formData, "country_code"),
      phones: text(formData, "phones"),
      message: text(formData, "message"),
      unicode: formData.get("unicode") === "on",
    },
    "",
  );
  return result.message ? result : { success: `${result.data?.queued ?? 0} message(s) queued.` };
}

/* Bulk sign-up */

export type ImportState = FormState & { created?: string[]; skipped?: string[] };

export async function importAccounts(_state: ImportState, formData: FormData): Promise<ImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { file: ["Choose a CSV file."] } };
  }
  const body = new FormData();
  for (const name of ["account_type", "business_id", "country_code", "country", "theme", "message"]) {
    const value = text(formData, name);
    if (value !== null) {
      body.set(name, value);
    }
  }
  body.set("file", file);

  const result = await call<{ created: string[]; skipped: string[] }>("/admin/account-imports", "POST", body, "");
  if (result.message) {
    return result;
  }
  return { success: `${result.data?.created.length ?? 0} account(s) created.`, created: result.data?.created ?? [], skipped: result.data?.skipped ?? [] };
}
