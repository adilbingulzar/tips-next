import "server-only";

import { NextResponse } from "next/server";

/**
 * Passes a file made by the API (contact file, Apple Wallet pass) on to the
 * visitor. The API is not reachable from the browser, so this server fetches it.
 */
export async function forwardCardFile(slug: string, file: "vcf" | "wallet/apple", visitorIp: string | null): Promise<NextResponse> {
  const upstream = await fetch(`${process.env.API_URL}/api/v1/public/vcards/${encodeURIComponent(slug)}/${file}`, {
    headers: { Accept: "*/*", ...(visitorIp ? { "X-Forwarded-For": visitorIp } : {}) },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    const message = upstream.status === 404 ? "This card does not exist." : "This file is not available right now. Please try again later.";
    return new NextResponse(message, { status: upstream.status === 404 ? 404 : 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? "attachment",
      "Cache-Control": "no-store",
    },
  });
}
