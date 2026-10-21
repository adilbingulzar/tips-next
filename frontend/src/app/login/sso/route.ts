import { type NextRequest, NextResponse } from "next/server";

import { ApiError, api } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { sessionCookieOptions } from "@/lib/session";

/**
 * Single sign-on from itsmycontact.info. Its login form posts here as a normal
 * top-level form post (so the session cookie is first-party on this domain).
 *
 * The browser's Origin must be on SSO_ALLOWED_ORIGINS; the credentials (and
 * the optional HMAC signature of that site) are checked by the API.
 */

function allowedOrigins(): string[] {
  return (process.env.SSO_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, "").toLowerCase())
    .filter(Boolean);
}

function isAllowed(origin: string | null): boolean {
  return origin !== null && allowedOrigins().includes(origin.replace(/\/$/, "").toLowerCase());
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Redirect within this site with a relative Location, so the browser stays on the
 * domain it used. (request.url carries the server's own hostname, not the visitor's.)
 */
function localRedirect(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

/** Where to send a failed login: the page it came from when that is allowed, else the configured page, else our login. */
function failureRedirect(returnUrl: string, message: string): NextResponse {
  const candidates = [returnUrl, process.env.SSO_ERROR_RETURN_URL ?? ""].filter((url) => url && isAllowed(originOf(url)));

  if (!candidates[0]) {
    return localRedirect(`/login?${new URLSearchParams({ sso_error: message })}`);
  }

  const target = new URL(candidates[0]);
  target.searchParams.set("sso_error", message);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const returnUrl = String(form.get("return_url") ?? "");

  if (!isAllowed(request.headers.get("origin"))) {
    return failureRedirect("", "This login form is not allowed to sign in from that address.");
  }

  let token: string;
  try {
    const response = await api<{ token: string }>("/auth/sso", {
      method: "POST",
      body: {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        sso_ts: form.get("sso_ts") ? Number(form.get("sso_ts")) : undefined,
        sso_nonce: form.get("sso_nonce") ?? undefined,
        sso_sig: form.get("sso_sig") ?? undefined,
        device_name: "sso",
      },
    });
    token = response.token;
  } catch (error) {
    const message = error instanceof ApiError ? (Object.values(error.errors)[0]?.[0] ?? error.message) : "Login failed. Please try again.";
    return failureRedirect(returnUrl, message);
  }

  const success = localRedirect("/dashboard");
  success.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return success;
}
