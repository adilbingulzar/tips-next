import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, api } from "./api";
import { getSessionToken } from "./session";
import type { CurrentUser } from "./types";

/**
 * Data access layer for the signed-in user. Every page and server action that
 * needs the user goes through here; the API checks the token on each call.
 */

/** The signed-in user, or null. Read once per request. */
export const findCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  try {
    const response = await api<{ data: CurrentUser }>("/auth/me", { token });
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
});

/**
 * The signed-in user; sends visitors who are not signed in to the login page.
 * An expired or revoked token goes through /session-expired first, which
 * removes the cookie (a page cannot), so the login page does not bounce back.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await findCurrentUser();
  if (!user) {
    redirect((await getSessionToken()) ? "/session-expired" : "/login");
  }
  return user;
}

/** A signed-in user with a confirmed email; others confirm their email first. */
export async function requireVerifiedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.email_verified) {
    redirect("/verify-email");
  }
  return user;
}

/** The token for API calls made on behalf of the signed-in user. */
export async function requireToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }
  return token;
}

/** For the admin area: anyone else gets a 404, so the area does not reveal itself. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireVerifiedUser();
  if (user.role !== "admin") {
    notFound();
  }
  return user;
}
