"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { clearSessionToken } from "@/lib/session";
import type { NotificationPreference } from "@/lib/types";

import type { FormState } from "./auth";

/**
 * Server functions behind the notifications and account settings pages.
 * Every password-protected change is checked again by the API.
 */

function failed(error: unknown): FormState {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return { message: "Too many attempts. Please wait a minute and try again." };
    }
    return { message: error.status === 422 ? "Please check the highlighted fields." : error.message, errors: error.errors };
  }
  console.error(error);
  return { message: "Something went wrong. Please try again." };
}

export async function markNotificationRead(id: number): Promise<FormState> {
  try {
    await api(`/me/notifications/${id}/read`, { method: "POST", token: await requireToken() });
  } catch (error) {
    return failed(error);
  }
  refresh();
  return {};
}

export async function markAllNotificationsRead(): Promise<FormState> {
  try {
    await api("/me/notifications/read-all", { method: "POST", token: await requireToken() });
  } catch (error) {
    return failed(error);
  }
  refresh();
  return {};
}

export async function updateNotificationPreferences(_state: FormState, formData: FormData): Promise<FormState> {
  const events = formData.getAll("events").map(String);
  const preferences = events.map((event) => ({
    event,
    enabled: formData.get(`enabled_${event}`) === "on",
    stars: event === "service_rating" ? formData.getAll("stars").map(Number) : [],
  })) satisfies Omit<NotificationPreference, "label">[];

  if (preferences.some((preference) => preference.event === "service_rating" && preference.enabled && preference.stars.length === 0)) {
    return { message: "Choose at least one star rating, or switch rating notifications off." };
  }

  try {
    await api("/me/notification-preferences", { method: "PUT", token: await requireToken(), body: { preferences } });
  } catch (error) {
    return failed(error);
  }
  refresh();
  return { success: "Your notification settings were saved." };
}

export async function changeEmail(_state: FormState, formData: FormData): Promise<FormState> {
  let emailVerified = true;
  try {
    const response = await api<{ data: { email_verified: boolean } }>("/auth/email", {
      method: "PUT",
      token: await requireToken(),
      body: { email: String(formData.get("email") ?? ""), password: String(formData.get("email_password") ?? "") },
    });
    emailVerified = response.data.email_verified;
  } catch (error) {
    const state = failed(error);
    // The password field is called email_password on this form, so its error shows in the right place.
    if (state.errors?.password) {
      state.errors = { ...state.errors, email_password: state.errors.password };
    }
    return state;
  }

  if (!emailVerified) {
    redirect("/verify-email");
  }
  return { success: "That is already your email address." };
}

/** Token for the Sumsub identity check (also used by the SDK to renew an expired one). */
export async function getVerificationToken(): Promise<{ token?: string; message?: string }> {
  try {
    const { data } = await api<{ data: { token: string } }>("/me/verification/token", { method: "POST", token: await requireToken() });
    return { token: data.token };
  } catch (error) {
    return { message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." };
  }
}

export async function savePushSubscription(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<FormState> {
  try {
    await api("/me/push", { method: "POST", token: await requireToken(), body: subscription });
  } catch (error) {
    return failed(error);
  }
  return { success: "Notifications are on for this device." };
}

export async function removePushSubscription(endpoint: string): Promise<FormState> {
  try {
    await api("/me/push", { method: "DELETE", token: await requireToken(), body: { endpoint } });
  } catch (error) {
    return failed(error);
  }
  return { success: "Notifications are off for this device." };
}

/** Moves an API error on `from` to the form field `to`. */
function renameError(state: FormState, from: string, to: string): FormState {
  if (state.errors?.[from]) {
    state.errors = { ...state.errors, [to]: state.errors[from] };
  }
  return state;
}

/**
 * The old "Account" form with one "Update Account" button: email, phone,
 * password and account status. Unlike the old app, changing the email or
 * password, and deleting the account, need the current password.
 */
export async function updateAccount(_state: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken();
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const oldPassword = String(formData.get("old_password") ?? "");
  const newPassword = String(formData.get("password") ?? "");
  const status = value("status");
  const { data: user } = await api<{ data: { email: string; phone: string | null; country_code: string | null; status: string; name: string; slug: string; accepts_individual_tips: boolean } }>("/me", {
    token,
  });
  const emailChanged = value("email").toLowerCase() !== user.email.toLowerCase();

  if ((emailChanged || newPassword || status === "delete") && !oldPassword) {
    return { message: "Please check the highlighted fields.", errors: { old_password: ["Enter your current password to make this change."] } };
  }

  if (status === "delete") {
    if (formData.get("confirm_delete") !== "on") {
      return { errors: { confirm_delete: ["Please check the box and confirm that you are deleting the account"] } };
    }
    try {
      await api("/me/account", { method: "DELETE", token, body: { password: oldPassword } });
    } catch (error) {
      return renameError(failed(error), "password", "old_password");
    }
    await clearSessionToken();
    redirect("/login?deleted=1");
  }

  try {
    const phone = value("phone") || null;
    const countryCode = value("country_code") || null;
    if (phone !== user.phone || countryCode !== user.country_code) {
      await api("/me/profile", {
        method: "PATCH",
        token,
        body: { name: user.name, slug: user.slug, accepts_individual_tips: user.accepts_individual_tips, phone, country_code: countryCode },
      });
    }
    if (status && status !== user.status && user.status !== "pending") {
      await api("/me/account/status", { method: "PUT", token, body: { status } });
    }
  } catch (error) {
    return failed(error);
  }

  if (newPassword) {
    try {
      await api("/me/password", {
        method: "PUT",
        token,
        body: { current_password: oldPassword, password: newPassword, password_confirmation: String(formData.get("password_confirmation") ?? "") },
      });
    } catch (error) {
      return renameError(failed(error), "current_password", "old_password");
    }
  }

  if (emailChanged) {
    let emailVerified = true;
    try {
      const response = await api<{ data: { email_verified: boolean } }>("/auth/email", { method: "PUT", token, body: { email: value("email"), password: oldPassword } });
      emailVerified = response.data.email_verified;
    } catch (error) {
      return renameError(failed(error), "password", "old_password");
    }
    if (!emailVerified) {
      redirect("/verify-email");
    }
  }

  refresh();
  return { success: "Account updated successfully" };
}
