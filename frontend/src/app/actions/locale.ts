"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";

import { getLocales } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/i18n-shared";

/** Remembers the visitor's language for a year. */
export async function setLocale(code: string): Promise<void> {
  if (!(await getLocales()).some((locale) => locale.code === code)) {
    return;
  }
  (await cookies()).set(LOCALE_COOKIE, code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: false, secure: process.env.NODE_ENV === "production" });
  refresh();
}
