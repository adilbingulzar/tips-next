import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";

/** Removes a session cookie whose token the API no longer accepts, then shows the login page. */
export function GET() {
  // Relative Location: the browser stays on the domain it used.
  const response = new NextResponse(null, { status: 307, headers: { Location: "/login" } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
