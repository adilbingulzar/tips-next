"use server";

import { redirect } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/session";
import type { CurrentUser } from "@/lib/types";

/** State of an auth form between submissions (React useActionState). */
export type FormState = {
  message?: string;
  success?: string;
  errors?: Record<string, string[]>;
  /** Values to put back in the form after a failed submit (never passwords). */
  values?: Record<string, string>;
};

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function failed(error: unknown, values: Record<string, string> = {}): FormState {
  if (error instanceof ApiError) {
    return { message: error.status === 422 ? undefined : error.message, errors: error.errors, values };
  }
  console.error(error);
  return { message: "Something went wrong. Please try again.", values };
}

/** Only follow a "next" target inside this site, so a login link cannot send users elsewhere. */
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/dashboard";
}

type AuthResponse = { token: string; user: CurrentUser };

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email");
  let response: AuthResponse;

  try {
    response = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password: String(formData.get("password") ?? ""), device_name: "web" },
    });
  } catch (error) {
    return failed(error, { email });
  }

  await setSessionToken(response.token);
  redirect(response.user.email_verified ? safeNext(field(formData, "next")) : "/verify-email");
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const values = {
    first_name: field(formData, "first_name"),
    last_name: field(formData, "last_name"),
    email: field(formData, "email"),
    account_type: field(formData, "account_type") || "private",
    business_name: field(formData, "business_name"),
    country: field(formData, "country"),
    country_code: field(formData, "country_code"),
    phone: field(formData, "phone"),
    referral: field(formData, "referral"),
  };
  let response: AuthResponse;

  try {
    response = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: {
        ...values,
        business_name: values.account_type === "business" ? values.business_name : undefined,
        referral: values.referral || undefined,
        password: String(formData.get("password") ?? ""),
        password_confirmation: String(formData.get("password_confirmation") ?? ""),
        accept_terms: formData.get("accept_terms") === "on",
      },
    });
  } catch (error) {
    return failed(error, values);
  }

  await setSessionToken(response.token);
  redirect("/verify-email");
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    // Revoke the token at the API; the cookie is removed either way.
    await api("/auth/logout", { method: "POST", token }).catch(() => undefined);
  }
  await clearSessionToken();
  redirect("/login");
}

export async function verifyEmail(_state: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken();

  try {
    await api("/auth/email/verify", { method: "POST", token, body: { code: field(formData, "code") } });
  } catch (error) {
    return failed(error);
  }

  redirect("/dashboard");
}

export async function resendVerificationCode(): Promise<FormState> {
  const token = await requireToken();

  try {
    await api("/auth/email/resend", { method: "POST", token });
    return { success: "We sent you a new code. Check your inbox." };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { message: "Please wait a few minutes before asking for another code." };
    }
    return failed(error);
  }
}

export async function forgotPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email");

  try {
    const response = await api<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } });
    return { success: response.message, values: { email } };
  } catch (error) {
    return failed(error, { email });
  }
}

export async function resetPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email");

  try {
    await api("/auth/reset-password", {
      method: "POST",
      body: {
        token: field(formData, "token"),
        email,
        password: String(formData.get("password") ?? ""),
        password_confirmation: String(formData.get("password_confirmation") ?? ""),
      },
    });
  } catch (error) {
    return failed(error, { email });
  }

  redirect("/login?reset=1");
}
