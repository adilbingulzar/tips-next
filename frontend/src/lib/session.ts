import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "./session-cookie";

/**
 * The Laravel API token of the signed-in user lives in an httpOnly cookie on
 * this domain: page scripts cannot read it, and only this server sends it on.
 */

/** Cookie settings; maxAge matches the API token lifetime (AUTH_TOKEN_LIFETIME_DAYS in the backend). */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function setSessionToken(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function clearSessionToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
