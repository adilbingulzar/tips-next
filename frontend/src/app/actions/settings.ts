"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";

import type { FormState } from "./auth";

/**
 * Server functions behind the profile, tip page and QR settings. The API
 * validates everything and only ever changes the signed-in user's own data.
 */

function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

async function save(path: string, method: "PATCH" | "PUT" | "POST" | "DELETE", body: unknown, success: string): Promise<FormState> {
  try {
    await api(path, { method, token: await requireToken(), body });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.status === 422 ? "Please check the highlighted fields." : error.message, errors: error.errors };
    }
    console.error(error);
    return { message: "Something went wrong. Please try again." };
  }

  refresh();
  return { success };
}

/** Only the fields the form has, so fields shown on other pages are left as they are. */
function present(formData: FormData, names: string[]): Record<string, string | null> {
  return Object.fromEntries(names.filter((name) => formData.has(name)).map((name) => [name, text(formData, name)]));
}

/**
 * The old "Profile Details" form: business info (for business owners) and
 * user info, saved with one button.
 */
export async function updateProfileDetails(_state: FormState, formData: FormData): Promise<FormState> {
  if (formData.has("business_name")) {
    const business = await save(
      "/me/business",
      "PATCH",
      { name: text(formData, "business_name"), email: text(formData, "business_email"), address: text(formData, "business_address") },
      "",
    );
    if (business.message) {
      // Business fields are prefixed in the form, so their errors are too.
      const errors = Object.fromEntries(Object.entries(business.errors ?? {}).map(([key, messages]) => [`business_${key}`, messages]));
      return { ...business, errors };
    }
  }

  const name = [text(formData, "first_name"), text(formData, "last_name")].filter(Boolean).join(" ");
  return updateProfileFields({ ...(name ? { name } : {}), ...present(formData, ["slug", "phone", "country_code", "country", "birth_date", "address", "bio"]) }, formData);
}

async function updateProfileFields(fields: Record<string, string | null>, formData: FormData): Promise<FormState> {
  const token = await requireToken();
  const current = await api<{ data: { name: string; slug: string; accepts_individual_tips: boolean } }>("/me", { token });
  return save(
    "/me/profile",
    "PATCH",
    {
      name: current.data.name,
      slug: current.data.slug,
      accepts_individual_tips: formData.has("accepts_individual_tips") ? checked(formData, "accepts_individual_tips") : current.data.accepts_individual_tips,
      ...fields,
    },
    "Your profile was saved.",
  );
}

/** The profile bio, which the old app also edited as "User Status" and "Vcard Status". */
export async function saveBio(bio: string | null): Promise<FormState> {
  return updateProfileFields({ bio }, new FormData());
}

/** Whether a public URL name is still free (or already the user's own). */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!/^[A-Za-z0-9]{3,50}$/.test(slug)) {
    return false;
  }
  try {
    await api(`/public/page-exists?type=profile&key=${encodeURIComponent(slug)}`, { forwardVisitorIp: false });
    return false;
  } catch (error) {
    return error instanceof ApiError && error.status === 404;
  }
}

/** Uploads an image file to the given API path (profile photo or tip page background). */
async function upload(path: string, formData: FormData, success: string): Promise<FormState> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { image: ["Choose an image first."] } };
  }
  const body = new FormData();
  body.set("image", file);
  return save(path, "POST", body, success);
}

export async function uploadAvatar(_state: FormState, formData: FormData): Promise<FormState> {
  return upload("/me/avatar", formData, "Your photo was updated.");
}

export async function removeAvatar(): Promise<FormState> {
  return save("/me/avatar", "DELETE", undefined, "Your photo was removed.");
}

export async function updateTipPage(_state: FormState, formData: FormData): Promise<FormState> {
  const saved = await save(
    "/me/tip-page",
    "PUT",
    {
      mode: text(formData, "mode"),
      header: text(formData, "header"),
      title: text(formData, "title"),
      success_header: text(formData, "success_header"),
      success_message: text(formData, "success_message"),
      page_color: checked(formData, "use_page_color") ? text(formData, "page_color") : null,
      panel_color: checked(formData, "use_panel_color") ? text(formData, "panel_color") : null,
      text_color: checked(formData, "use_text_color") ? text(formData, "text_color") : null,
      emoji_color: checked(formData, "use_emoji_color") ? text(formData, "emoji_color") : null,
      button_style: text(formData, "button_style"),
      emoji_type: Number(formData.get("emoji_type") ?? 0),
      show_email_field: checked(formData, "show_email_field"),
      show_review_field: checked(formData, "show_review_field"),
      preset_amounts: [text(formData, "amount_1"), text(formData, "amount_2"), text(formData, "amount_3")].map((amount) => (amount ?? "").replace(",", ".")),
      pin_reviews: checked(formData, "pin_reviews"),
      review_style: Number(formData.get("review_style") ?? 1),
      ...(formData.has("pattern") ? { pattern: text(formData, "pattern") } : {}),
      ...(formData.has("methods_shown") ? { payment_methods: formData.getAll("methods").map(Number) } : {}),
    },
    "Your tip page was saved.",
  );
  // "User Status" on the tip page is the profile bio, as in the old app.
  if (saved.success && formData.has("bio")) {
    return saveBio(text(formData, "bio")).then((state) => (state.success ? saved : state));
  }
  return saved;
}

export async function uploadBackground(_state: FormState, formData: FormData): Promise<FormState> {
  return upload("/me/tip-page/background", formData, "The background was updated.");
}

export async function removeBackground(): Promise<FormState> {
  return save("/me/tip-page/background", "DELETE", undefined, "The background was removed.");
}

export async function updateQr(_state: FormState, formData: FormData): Promise<FormState> {
  return save("/me/qr", "PUT", { header: text(formData, "header"), title: text(formData, "title") }, "The card texts were saved.");
}

export async function requestPayout(): Promise<FormState> {
  return save("/me/withdrawals", "POST", undefined, "Your payout was requested. You can follow it on the Statement page.");
}

export async function updateBankAccount(_state: FormState, formData: FormData): Promise<FormState> {
  const normalise = (name: string) => (text(formData, name) ?? "").replace(/\s+/g, "").toUpperCase();
  if (normalise("account_number") !== normalise("account_number_confirmation")) {
    return { message: "Please check the highlighted fields.", errors: { account_number_confirmation: ["The account numbers do not match."] } };
  }
  return save(
    "/me/bank-account",
    "PUT",
    {
      bank_name: text(formData, "bank_name"),
      account_name: text(formData, "account_name"),
      account_type: Number(formData.get("account_type") ?? 1),
      account_number: text(formData, "account_number"),
      swift_code: text(formData, "swift_code"),
    },
    "Your bank account was saved.",
  );
}

export async function updatePayoutSettings(_state: FormState, formData: FormData): Promise<FormState> {
  return save(
    "/me/payout-settings",
    "PUT",
    { schedule: text(formData, "schedule"), platform_fee_paid_by: text(formData, "platform_fee_paid_by") },
    "Your payout settings were saved.",
  );
}

/** Starts paying for a plan and sends the user to Pay.nl. */
export async function startPlanCheckout(_state: FormState, formData: FormData): Promise<FormState> {
  let redirectUrl: string;
  try {
    const response = await api<{ data: { redirect_url: string } }>("/me/subscription/checkout", {
      method: "POST",
      token: await requireToken(),
      body: { plan: formData.get("plan"), payment_method_id: Number(formData.get("payment_method_id")) },
    });
    redirectUrl = response.data.redirect_url;
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.status === 422 ? (Object.values(error.errors)[0]?.[0] ?? error.message) : error.message };
    }
    console.error(error);
    return { message: "The payment could not be started. Please try again later." };
  }
  if (!/^https:\/\/([a-z0-9-]+\.)*pay\.nl\//.test(redirectUrl)) {
    return { message: "The payment could not be started. Please try again later." };
  }
  redirect(redirectUrl);
}
