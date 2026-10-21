import { type NextRequest, NextResponse } from "next/server";

import { getLocales } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/i18n-shared";

/**
 * The old app's language links (/swicthlang/nl, spelling included): set the
 * language and go back to the page the visitor came from on this site.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/swicthlang/[code]">) {
  const { code } = await params;
  const referer = request.headers.get("referer");
  let back = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.host === request.headers.get("host")) {
        back = url.pathname + url.search;
      }
    } catch {
      back = "/";
    }
  }

  const response = new NextResponse(null, { status: 303, headers: { Location: back } });
  if ((await getLocales()).some((locale) => locale.code === code)) {
    response.cookies.set(LOCALE_COOKIE, code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}
