import { NextResponse } from "next/server";

import { ApiError, api } from "@/lib/api";

/** Sends the visitor to Google's "Add to Google Wallet" page for this card. */
export async function GET(_request: Request, { params }: RouteContext<"/vcards/[slug]/wallet/google">) {
  const { slug } = await params;

  try {
    const { data } = await api<{ data: { url: string } }>(`/public/vcards/${encodeURIComponent(slug)}/wallet/google`);
    if (!data.url.startsWith("https://pay.google.com/")) {
      throw new Error("Unexpected Google Wallet link.");
    }
    return NextResponse.redirect(data.url, 303);
  } catch (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return new NextResponse(notFound ? "This card does not exist." : "Google Wallet is not available right now. Please try again later.", {
      status: notFound ? 404 : 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
