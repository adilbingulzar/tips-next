import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";
import { visitorIpFrom } from "@/lib/visitor-ip";

/**
 * Runs before every matched page:
 *
 * - Quick redirect based only on whether the session cookie exists. The real
 *   check happens in the pages (lib/auth.ts), where the API validates the token.
 * - Public pages that do not exist get a real "404 Not Found". Pages stream,
 *   so once a page has started it can only show the not-found text with
 *   status 200; asking the API first avoids that.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/verify-email")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const lookup = publicPage(pathname);
  if (lookup && !(await pageExists(lookup, request))) {
    // No page matches this path, so Next.js answers with the not-found page and status 404.
    return NextResponse.rewrite(new URL("/_page-not-found", request.url));
  }

  return NextResponse.next();
}

type Lookup = { type: "profile" | "card" | "spot" | "payment" | "widget"; key: string; business?: string };

function publicPage(pathname: string): Lookup | null {
  const parts = pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
  const [first, second, third, fourth] = parts;

  if ((first === "paytips" || first === "review") && second === "spot" && third && fourth && parts.length === 4) {
    return { type: "spot", business: third, key: fourth };
  }
  if ((first === "paytips" || first === "review") && second && parts.length === 2 && !["thanks-review", "thank-you", "spot"].includes(second)) {
    return { type: "profile", key: second };
  }
  if (first === "vcards" && second && parts.length === 2) {
    return { type: "card", key: second };
  }
  if (first === "payment" && second && parts.length === 2) {
    return { type: "payment", key: second };
  }
  if (first === "widgets" && second === "review" && third && parts.length === 3) {
    return { type: "widget", key: third };
  }
  return null;
}

/** Asks the API; when it cannot be reached the page is shown as usual. */
async function pageExists(lookup: Lookup, request: NextRequest): Promise<boolean> {
  const url = new URL(`${process.env.API_URL}/api/v1/public/page-exists`);
  url.searchParams.set("type", lookup.type);
  url.searchParams.set("key", lookup.key);
  if (lookup.business) {
    url.searchParams.set("business", lookup.business);
  }
  const visitorIp = visitorIpFrom(request.headers);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", ...(visitorIp ? { "X-Forwarded-For": visitorIp } : {}) },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return response.status !== 404;
  } catch {
    return true;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/verify-email",
    "/login",
    "/register",
    "/paytips/:path*",
    "/review/:path*",
    "/vcards/:slug",
    "/payment/:id",
    "/widgets/review/:id",
  ],
};
