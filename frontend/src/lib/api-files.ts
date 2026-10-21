import "server-only";

import { NextResponse } from "next/server";

import { getSessionToken } from "./session";

/**
 * Passes a file made by the API (exports, payout files, CSV template) on to the
 * browser, adding the user’s token on the server. The API checks access.
 */
export async function forwardApiFile(path: string, init: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return new NextResponse(null, { status: 307, headers: { Location: "/login" } });
  }

  const upstream = await fetch(`${process.env.API_URL}/api/v1${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json, */*", ...(init.body ? { "Content-Type": "application/json" } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => ({}));
    const first = Object.values((payload.errors ?? {}) as Record<string, string[]>)[0]?.[0];
    return new NextResponse(first ?? payload.message ?? "The file could not be made.", { status: upstream.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? "attachment",
      "Cache-Control": "no-store",
    },
  });
}
