import { type NextRequest, NextResponse } from "next/server";

import { getSessionToken } from "@/lib/session";

const ALLOWED = ["period", "from", "until", "status", "type"];

/** Streams the CSV export from the API to the browser, adding the user's token on the server. */
export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return new NextResponse(null, { status: 307, headers: { Location: "/login" } });
  }

  const query = new URLSearchParams();
  for (const key of ALLOWED) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) {
      query.set(key, value);
    }
  }

  const upstream = await fetch(`${process.env.API_URL}/api/v1/me/tips/export?${query}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("The export could not be created. Please try again.", { status: upstream.status === 401 ? 401 : 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? 'attachment; filename="tips.csv"',
      "Cache-Control": "no-store",
    },
  });
}
